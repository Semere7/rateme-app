'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FriendshipStatus } from '@/types'

type Props = {
  targetUserId: string
  friendship: {
    id: string
    status: FriendshipStatus
    requester_id: string
    addressee_id: string
  } | null
  currentUserId: string
}

export default function FriendRequestButton({ targetUserId, friendship, currentUserId }: Props) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function sendRequest() {
    setLoading(true)
    await fetch('/api/friends/request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ addressee_id: targetUserId }),
    })
    setLoading(false)
    router.refresh()
  }

  async function respond(status: 'accepted' | 'rejected') {
    if (!friendship) return
    setLoading(true)
    await fetch(`/api/friends/${friendship.id}/respond`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    setLoading(false)
    router.refresh()
  }

  if (!friendship) {
    return (
      <button onClick={sendRequest} disabled={loading} className="btn-primary">
        {loading ? 'Sending...' : '+ Add Friend'}
      </button>
    )
  }

  if (friendship.status === 'accepted') {
    return (
      <span className="btn bg-green-50 text-green-700 border border-green-200 cursor-default">
        ✓ Friends
      </span>
    )
  }

  if (friendship.status === 'pending' && friendship.requester_id === currentUserId) {
    return (
      <span className="btn bg-yellow-50 text-yellow-700 border border-yellow-200 cursor-default">
        Request Sent
      </span>
    )
  }

  if (friendship.status === 'pending' && friendship.addressee_id === currentUserId) {
    return (
      <div className="flex gap-2">
        <button onClick={() => respond('accepted')} disabled={loading} className="btn-success">
          Accept
        </button>
        <button onClick={() => respond('rejected')} disabled={loading} className="btn-secondary">
          Decline
        </button>
      </div>
    )
  }

  if (friendship.status === 'rejected') {
    return (
      <button onClick={sendRequest} disabled={loading} className="btn-secondary">
        {loading ? 'Sending...' : '+ Add Friend Again'}
      </button>
    )
  }

  return null
}
