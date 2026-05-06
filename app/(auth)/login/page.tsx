'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'

export default function LoginPage() {
  const { t } = useLanguage()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    const json = await res.json()

    if (!res.ok) {
      setError(json.error ?? 'Login failed')
      setLoading(false)
      return
    }

    window.location.href = '/dashboard?welcome=login'
  }

  return (
    <div className="card p-8">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">{t.auth.signInTitle}</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-4">
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
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="btn-primary w-full" disabled={loading}>
          {loading ? t.auth.signingIn : t.auth.signIn}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        {t.auth.noAccount}{' '}
        <Link href="/signup" className="text-blue-600 hover:underline font-medium">
          {t.auth.createOne}
        </Link>
      </p>
    </div>
  )
}
