'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'

export default function SignupPage() {
  const { t } = useLanguage()
  const [fullName, setFullName]   = useState('')
  const [username, setUsername]   = useState('')
  const [email, setEmail]         = useState('')
  const [password, setPassword]   = useState('')
  const [error, setError]         = useState('')
  const [loading, setLoading]     = useState(false)

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (username.length < 3) {
      setError(t.auth.usernameMin)
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError(t.auth.passwordMin)
      setLoading(false)
      return
    }

    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, username, full_name: fullName }),
    })

    const json = await res.json()

    if (!res.ok) {
      setError(json.error ?? 'Signup failed')
      setLoading(false)
      return
    }

    window.location.href = '/dashboard?welcome=signup'
  }

  return (
    <div className="card p-8">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">{t.auth.createAccount}</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSignup} className="space-y-4">
        <div>
          <label className="label" htmlFor="fullName">{t.auth.fullName}</label>
          <input
            id="fullName"
            type="text"
            className="input"
            placeholder="John Doe"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="label" htmlFor="username">{t.auth.username}</label>
          <input
            id="username"
            type="text"
            className="input"
            placeholder="johndoe"
            value={username}
            onChange={(e) => setUsername(e.target.value.replace(/[^a-z0-9_]/gi, '').toLowerCase())}
            required
          />
        </div>

        <div>
          <label className="label" htmlFor="email">{t.auth.email}</label>
          <input
            id="email"
            type="email"
            className="input"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="label" htmlFor="password">{t.auth.password}</label>
          <input
            id="password"
            type="password"
            className="input"
            placeholder="Min. 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="btn-primary w-full" disabled={loading}>
          {loading ? t.auth.creatingAccount : t.auth.signUp}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        {t.auth.haveAccount}{' '}
        <Link href="/login" className="text-blue-600 hover:underline font-medium">
          {t.auth.signInLink}
        </Link>
      </p>
    </div>
  )
}
