'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Profile } from '@/types'
import AvatarUpload from '@/components/AvatarUpload'
import { useLanguage } from '@/contexts/LanguageContext'
import { LANGUAGES } from '@/lib/translations'

export default function ProfileEditForm({ profile }: { profile: Profile }) {
  const [fullName, setFullName] = useState(profile.full_name)
  const [bio, setBio]           = useState(profile.bio ?? '')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const router                  = useRouter()
  const { locale, setLocale }   = useLanguage()

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

    {/* ── Language section ─────────────────────────────────────── */}
    <div className="mt-8 pt-6 border-t border-gray-100">
      <h2 className="text-sm font-semibold text-gray-800 mb-0.5">Language</h2>
      <p className="text-xs text-gray-400 mb-3">Choose your preferred app language</p>
      <div className="flex gap-2">
        {LANGUAGES.map(lang => (
          <button
            key={lang.locale}
            type="button"
            onClick={() => setLocale(lang.locale)}
            className={[
              'flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-colors',
              locale === lang.locale
                ? 'bg-blue-600 text-white border-blue-600'
                : 'text-gray-700 border-gray-200 hover:bg-gray-50',
            ].join(' ')}
          >
            {lang.label}
          </button>
        ))}
      </div>
    </div>
    </>
  )
}
