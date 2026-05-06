'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Profile } from '@/types'
import AvatarUpload from '@/components/AvatarUpload'

export default function ProfileEditForm({ profile }: { profile: Profile }) {
  const [fullName, setFullName] = useState(profile.full_name)
  const [bio, setBio]           = useState(profile.bio ?? '')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const router                  = useRouter()

  const profileUrl = `/profile/${profile.id}`

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const res = await fetch(`/api/profiles/${profile.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ full_name: fullName, bio }),
    })

    const json = await res.json()

    if (!res.ok) {
      setError(json.error ?? 'Update failed')
      setLoading(false)
      return
    }

    router.push(profileUrl)
  }

  return (
    <>
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="flex justify-center pb-2">
        <AvatarUpload
          userId={profile.id}
          currentUrl={profile.avatar_url ?? null}
          name={profile.full_name}
        />
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      <div>
        <label className="label">Username</label>
        <input
          className="input bg-gray-50 cursor-not-allowed"
          value={profile.username}
          disabled
        />
        <p className="text-xs text-gray-400 mt-1">Username cannot be changed</p>
      </div>

      <div>
        <label className="label" htmlFor="fullName">Full Name</label>
        <input
          id="fullName"
          className="input"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
          maxLength={100}
        />
      </div>

      <div>
        <label className="label" htmlFor="bio">Bio</label>
        <textarea
          id="bio"
          className="input resize-none"
          rows={4}
          placeholder="Tell people a bit about yourself..."
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          maxLength={300}
        />
        <p className="text-xs text-gray-400 mt-1">{bio.length}/300</p>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => router.push(profileUrl)}
          disabled={loading}
          className="btn-secondary flex-1"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn-primary flex-1"
          disabled={loading}
        >
          {loading ? 'Saving…' : 'Save Changes'}
        </button>
      </div>
    </form>

</>
  )
}
