'use client'

import { useCallback, useState } from 'react'
import Cropper from 'react-easy-crop'
import type { Area } from 'react-easy-crop'
import { cropImageToBlob } from '@/lib/cropImage'

type Props = {
  imageSrc: string      // object URL of the raw selected file
  onConfirm: (blob: Blob) => void
  onCancel: () => void
}

export default function CropModal({ imageSrc, onConfirm, onCancel }: Props) {
  const [crop, setCrop]                   = useState({ x: 0, y: 0 })
  const [zoom, setZoom]                   = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
  const [processing, setProcessing]       = useState(false)
  const [error, setError]                 = useState('')

  const onCropComplete = useCallback((_: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels)
  }, [])

  async function handleConfirm() {
    if (!croppedAreaPixels) return
    setError('')
    setProcessing(true)
    try {
      const blob = await cropImageToBlob(imageSrc, croppedAreaPixels)
      onConfirm(blob)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Crop failed')
      setProcessing(false)
    }
  }

  return (
    /* Backdrop */
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm flex flex-col overflow-hidden">

        {/* Header */}
        <div className="px-5 pt-5 pb-3">
          <h2 className="text-base font-semibold text-gray-800">Crop Profile Picture</h2>
          <p className="text-xs text-gray-400 mt-0.5">Drag to reposition · pinch or scroll to zoom</p>
        </div>

        {/* Crop area — fixed square viewport */}
        <div className="relative w-full" style={{ height: 300 }}>
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            showGrid={false}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>

        {/* Zoom slider */}
        <div className="px-5 pt-4">
          <label className="text-xs text-gray-400 block mb-1">Zoom</label>
          <input
            type="range"
            min={1}
            max={3}
            step={0.01}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="w-full accent-blue-600"
          />
        </div>

        {/* Error */}
        {error && (
          <p className="px-5 pt-2 text-xs text-red-600">{error}</p>
        )}

        {/* Actions */}
        <div className="flex gap-3 px-5 py-4 mt-1">
          <button
            type="button"
            onClick={onCancel}
            disabled={processing}
            className="btn-secondary flex-1"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={processing}
            className="btn-primary flex-1 flex items-center justify-center gap-2"
          >
            {processing && (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
            )}
            {processing ? 'Processing…' : 'Save'}
          </button>
        </div>

      </div>
    </div>
  )
}
