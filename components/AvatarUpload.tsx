'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Avatar from './Avatar'
import CropModal from './CropModal'

// ─── Types ────────────────────────────────────────────────────────────────────

type Props = {
  userId: string
  currentUrl: string | null
  name: string
}

type Stage =
  | { name: 'idle' }
  | { name: 'cropping'; objectUrl: string }
  | { name: 'uploading' }
  | { name: 'success' }
  | { name: 'error'; message: string }

// ─── Validation ───────────────────────────────────────────────────────────────
// Only type is checked upfront. Size is handled after crop + compression.

function validateFile(file: File): string | null {
  if (!file.type.startsWith('image/')) return 'Please select an image file (JPG, PNG, WebP…)'
  return null
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function AvatarUpload({ userId, currentUrl, name }: Props) {
  const [url, setUrl]     = useState(currentUrl)
  const [stage, setStage] = useState<Stage>({ name: 'idle' })
  const inputRef          = useRef<HTMLInputElement>(null)
  const router            = useRouter()

  // ── Step 1: file selected ──────────────────────────────────────────────────

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (inputRef.current) inputRef.current.value = '' // allow re-selecting same file
    if (!file) return

    const err = validateFile(file)
    if (err) {
      setStage({ name: 'error', message: err })
      return
    }

    // Create a temporary object URL to pass to the crop modal
    const objectUrl = URL.createObjectURL(file)
    setStage({ name: 'cropping', objectUrl })
  }

  // ── Step 2: crop confirmed — upload the cropped Blob ──────────────────────

  async function handleCropConfirm(blob: Blob) {
    // blob is already compressed to ≤2 MB by cropImageToBlob
    setStage({ name: 'uploading' })
    cleanupObjectUrl()

    try {
      const supabase = createClient()
      const storagePath = `${userId}/avatar`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(storagePath, blob, { upsert: true, contentType: 'image/jpeg' })

      if (uploadError) throw new Error(uploadError.message)

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(storagePath)

      // Cache-bust: path never changes, timestamp forces browser re-fetch
      const finalUrl = `${publicUrl}?t=${Date.now()}`

      const res = await fetch(`/api/profiles/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatar_url: finalUrl }),
      })

      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        throw new Error(json.error ?? 'Failed to save avatar URL')
      }

      setUrl(finalUrl)
      setStage({ name: 'success' })

      // Refresh server components so the new avatar appears everywhere
      router.refresh()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Upload failed. Please try again.'
      setStage({ name: 'error', message })
    }
  }

  // ── Step 3: crop cancelled ─────────────────────────────────────────────────

  function handleCropCancel() {
    cleanupObjectUrl()
    setStage({ name: 'idle' })
  }

  // ── Helpers ────────────────────────────────────────────────────────────────

  function cleanupObjectUrl() {
    if (stage.name === 'cropping') URL.revokeObjectURL(stage.objectUrl)
  }

  const uploading = stage.name === 'uploading'

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
      {/* Crop modal — rendered outside the card so it overlays the full screen */}
      {stage.name === 'cropping' && (
        <CropModal
          imageSrc={stage.objectUrl}
          onConfirm={handleCropConfirm}
          onCancel={handleCropCancel}
        />
      )}

      <div className="flex flex-col items-center gap-3">

        {/* Clickable avatar */}
        <button
          type="button"
          onClick={() => !uploading && inputRef.current?.click()}
          disabled={uploading}
          className="relative group focus:outline-none disabled:cursor-not-allowed"
          aria-label="Change profile picture"
        >
          <Avatar src={url} name={name} size="lg" />

          <div className={`
            absolute inset-0 rounded-full flex items-center justify-center
            transition-opacity pointer-events-none
            ${uploading
              ? 'bg-black/50 opacity-100'
              : 'bg-black/40 opacity-0 group-hover:opacity-100'}
          `}>
            {uploading ? (
              <svg className="w-6 h-6 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
            ) : (
              <span className="text-white text-xs font-semibold">Change</span>
            )}
          </div>
        </button>

        {/* Hidden file input */}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileSelect}
          disabled={uploading}
        />

        {/* Feedback messages */}
        {stage.name === 'success' && (
          <p className="text-xs text-green-600 font-medium">Profile picture updated successfully</p>
        )}
        {stage.name === 'error' && (
          <p className="text-xs text-red-600 text-center">{stage.message}</p>
        )}

        <p className="text-xs text-gray-400">JPG, PNG, WebP · auto-compressed to ≤ 2 MB</p>
      </div>
    </>
  )
}
