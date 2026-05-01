'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function SignupPage() {
  const [fullName, setFullName] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (username.length < 3) {
      setError('Username must be at least 3 characters')
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      setLoading(false)
      return
    }

    // Check username availability
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('username')
      .eq('username', username.toLowerCase())
      .single()

    if (existingUser) {
      setError('Username is already taken')
      setLoading(false)
      return
    }

    // Create auth user
    const { data, error: signupError } = await supabase.auth.signUp({ email, password })

    if (signupError || !data.user) {
      setError(signupError?.message ?? 'Signup failed')
      setLoading(false)
      return
    }

    // Create profile
    const { error: profileError } = await supabase.from('profiles').insert({
      id: data.user.id,
      username: username.toLowerCase(),
      full_name: fullName,
      bio: '',
      avatar_url: '',
    })

    if (profileError) {
      setError(profileError.message)
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="card p-8">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Create Account</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSignup} className="space-y-4">
        <div>
          <label className="label" htmlFor="fullName">Full Name</label>
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
          <label className="label" htmlFor="username">Username</label>
          <input
            id="username"
            type="text"
            className="input"
            placeholder="johndoe"
            value={username}
            onChange={(e) => setUsername(e.target.value.replace(/[^a-z0-9_]/gi, '').toLowerCase())}
            required
          />
          <p className="text-xs text-gray-400 mt-1">Letters, numbers, underscores only</p>
        </div>

        <div>
          <label className="label" htmlFor="email">Email</label>
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
          <label className="label" htmlFor="password">Password</label>
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
          {loading ? 'Creating account...' : 'Create Account'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        Already have an account?{' '}
        <Link href="/login" className="text-blue-600 hover:underline font-medium">
          Sign in
        </Link>
      </p>
    </div>
  )
}
