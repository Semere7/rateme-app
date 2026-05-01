'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function RespondButtonsClient({ friendshipId }: { friendshipId: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function respond(status: 'accepted' | 'rejected') {
    setLoading(true)
    await fetch(`/api/friends/${friendshipId}/respond`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    setLoading(false)
    router.refresh()
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={() => respond('accepted')}
        disabled={loading}
        className="btn-success text-xs px-3 py-1.5"
      >
        Accept
      </button>
      <button
        onClick={() => respond('rejected')}
        disabled={loading}
        className="btn-secondary text-xs px-3 py-1.5"
      >
        Decline
      </button>
    </div>
  )
}
