'use client'

import { useEffect, useState } from 'react'

type Props = { type: 'signup' | 'login' }

const messages = {
  signup: 'Welcome! Your account has been created successfully.',
  login: 'Welcome back!',
}

export default function WelcomeBanner({ type }: Props) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => setVisible(false), 5000)
    return () => clearTimeout(t)
  }, [])

  if (!visible) return null

  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-lg bg-green-50 border border-green-200 text-green-800 text-sm">
      <span>{messages[type]}</span>
      <button
        onClick={() => setVisible(false)}
        className="shrink-0 text-green-600 hover:text-green-800 transition-colors"
        aria-label="Dismiss"
      >
        ✕
      </button>
    </div>
  )
}
