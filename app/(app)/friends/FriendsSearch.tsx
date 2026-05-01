'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FriendshipStatus } from '@/types'

type ExistingFriendship = {
  id: string
  requester_id: string
  addressee_id: string
  status: FriendshipStatus
}

type SearchResult = {
  id: string
  username: string
  full_name: string
}

export default function FriendsSearch({
  currentUserId,
  existingFriendships,
}: {
  currentUserId: string
  existingFriendships: ExistingFriendship[]
}) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [searching, setSearching] = useState(false)
  const [sendingTo, setSendingTo] = useState<string | null>(null)
  const router = useRouter()

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!query.trim()) return

    setSearching(true)
    const res = await fetch(`/api/profiles/search?q=${encodeURIComponent(query)}`)
    const json = await res.json()
    setResults(json.profiles ?? [])
    setSearching(false)
  }

  async function sendRequest(addresseeId: string) {
    setSendingTo(addresseeId)
    await fetch('/api/friends/request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ addressee_id: addresseeId }),
    })
    setSendingTo(null)
    router.refresh()
    // Re-search to update button states
    const res = await fetch(`/api/profiles/search?q=${encodeURIComponent(query)}`)
    const json = await res.json()
    setResults(json.profiles ?? [])
  }

  function getFriendshipStatus(userId: string): ExistingFriendship | undefined {
    return existingFriendships.find(
      (f) =>
        (f.requester_id === currentUserId && f.addressee_id === userId) ||
        (f.requester_id === userId && f.addressee_id === currentUserId)
    )
  }

  function renderActionButton(user: SearchResult) {
    if (user.id === currentUserId) return null

    const friendship = getFriendshipStatus(user.id)

    if (!friendship) {
      return (
        <button
          onClick={() => sendRequest(user.id)}
          disabled={sendingTo === user.id}
          className="btn-primary text-xs px-3 py-1.5"
        >
          {sendingTo === user.id ? '...' : '+ Add'}
        </button>
      )
    }

    if (friendship.status === 'accepted') {
      return (
        <span className="text-xs text-green-600 font-medium bg-green-50 border border-green-200 px-2 py-1 rounded-lg">
          Friends
        </span>
      )
    }

    if (friendship.status === 'pending' && friendship.requester_id === currentUserId) {
      return (
        <span className="text-xs text-yellow-600 font-medium bg-yellow-50 border border-yellow-200 px-2 py-1 rounded-lg">
          Sent
        </span>
      )
    }

    if (friendship.status === 'pending' && friendship.addressee_id === currentUserId) {
      return (
        <span className="text-xs text-blue-600 font-medium bg-blue-50 border border-blue-200 px-2 py-1 rounded-lg">
          Incoming
        </span>
      )
    }

    return null
  }

  return (
    <div>
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          className="input flex-1"
          placeholder="Search by username or name..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button type="submit" className="btn-primary" disabled={searching}>
          {searching ? '...' : 'Search'}
        </button>
      </form>

      {results.length > 0 && (
        <div className="mt-4 space-y-2">
          {results.map((u) => (
            <div key={u.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <Link href={`/profile/${u.id}`} className="flex items-center gap-3 hover:opacity-80">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white font-semibold text-sm">
                  {u.full_name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-gray-800 text-sm">{u.full_name}</p>
                  <p className="text-xs text-gray-400">@{u.username}</p>
                </div>
              </Link>
              {renderActionButton(u)}
            </div>
          ))}
        </div>
      )}

      {results.length === 0 && query && !searching && (
        <p className="text-center text-gray-400 text-sm mt-4">No users found for &ldquo;{query}&rdquo;</p>
      )}
    </div>
  )
}
