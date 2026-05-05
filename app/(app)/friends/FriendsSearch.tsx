'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FriendshipStatus } from '@/types'
import Avatar from '@/components/Avatar'

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
  avatar_url?: string | null
  profile_type?: 'user' | 'public_figure'
}

export default function FriendsSearch({
  currentUserId,
  existingFriendships,
}: {
  currentUserId: string
  existingFriendships: ExistingFriendship[]
}) {
  const [query, setQuery]       = useState('')
  const [results, setResults]   = useState<SearchResult[]>([])
  const [searching, setSearching] = useState(false)
  const [open, setOpen]         = useState(false)
  const [sendingTo, setSendingTo] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // ── Debounced live search ──────────────────────────────────────────────────

  useEffect(() => {
    const trimmed = query.trim()
    if (trimmed.length < 2) {
      setResults([])
      setOpen(false)
      return
    }

    setSearching(true)
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/profiles/search?q=${encodeURIComponent(trimmed)}`)
        const json = await res.json()
        setResults(json.profiles ?? [])
        setOpen(true)
      } finally {
        setSearching(false)
      }
    }, 400)

    return () => clearTimeout(timer)
  }, [query])

  // ── Close on outside click ─────────────────────────────────────────────────

  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [])

  // ── Close on Escape ────────────────────────────────────────────────────────

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [])

  // ── Send friend request ────────────────────────────────────────────────────

  async function sendRequest(addresseeId: string) {
    setSendingTo(addresseeId)
    await fetch('/api/friends/request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ addressee_id: addresseeId }),
    })
    setSendingTo(null)
    router.refresh()
    // Re-fetch to reflect updated button state
    const res = await fetch(`/api/profiles/search?q=${encodeURIComponent(query.trim())}`)
    const json = await res.json()
    setResults(json.profiles ?? [])
  }

  // ── Friendship state helpers ───────────────────────────────────────────────

  function getFriendshipStatus(userId: string): ExistingFriendship | undefined {
    return existingFriendships.find(
      (f) =>
        (f.requester_id === currentUserId && f.addressee_id === userId) ||
        (f.requester_id === userId && f.addressee_id === currentUserId)
    )
  }

  function renderActionButton(user: SearchResult) {
    if (user.id === currentUserId) return null

    // Public figures cannot be added as friends
    if (user.profile_type === 'public_figure') {
      return (
        <span className="text-xs font-medium px-2 py-1 rounded-lg bg-purple-50 text-purple-600 border border-purple-200 shrink-0">
          Public Figure
        </span>
      )
    }

    const friendship = getFriendshipStatus(user.id)

    if (!friendship) {
      return (
        <button
          onClick={() => sendRequest(user.id)}
          disabled={sendingTo === user.id}
          className="btn-primary text-xs px-3 py-1.5 shrink-0"
        >
          {sendingTo === user.id ? '...' : '+ Add'}
        </button>
      )
    }

    if (friendship.status === 'accepted') {
      return (
        <span className="text-xs text-green-600 font-medium bg-green-50 border border-green-200 px-2 py-1 rounded-lg shrink-0">
          Friends
        </span>
      )
    }

    if (friendship.status === 'pending' && friendship.requester_id === currentUserId) {
      return (
        <span className="text-xs text-yellow-600 font-medium bg-yellow-50 border border-yellow-200 px-2 py-1 rounded-lg shrink-0">
          Sent
        </span>
      )
    }

    if (friendship.status === 'pending' && friendship.addressee_id === currentUserId) {
      return (
        <span className="text-xs text-blue-600 font-medium bg-blue-50 border border-blue-200 px-2 py-1 rounded-lg shrink-0">
          Incoming
        </span>
      )
    }

    return null
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div ref={containerRef} className="relative">

      {/* Search input */}
      <div className="relative">
        <input
          className="input w-full pr-9"
          placeholder="Search by username or name..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => { if (results.length > 0) setOpen(true) }}
          autoComplete="off"
        />

        {/* Spinner while searching */}
        {searching && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <svg className="w-4 h-4 text-gray-400 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
          </span>
        )}

        {/* Clear button */}
        {!searching && query && (
          <button
            type="button"
            onClick={() => { setQuery(''); setResults([]); setOpen(false) }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm leading-none"
            aria-label="Clear search"
          >
            ✕
          </button>
        )}
      </div>

      {/* Dropdown results */}
      {open && (results.length > 0 || (!searching && query.trim().length >= 2)) && (
        <div className="absolute top-full mt-1.5 left-0 right-0 z-50 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
          {results.length > 0 ? (
            results.map((u) => (
              <div
                key={u.id}
                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-0 transition-colors"
              >
                <Link
                  href={`/profile/${u.id}`}
                  className="flex items-center gap-3 flex-1 min-w-0"
                  onClick={() => setOpen(false)}
                >
                  <Avatar src={u.avatar_url} name={u.full_name} size="sm" />
                  <div className="min-w-0">
                    <p className="font-medium text-gray-800 text-sm truncate">{u.full_name}</p>
                    <p className="text-xs text-gray-400">@{u.username}</p>
                  </div>
                </Link>
                {renderActionButton(u)}
              </div>
            ))
          ) : (
            <p className="text-center text-gray-400 text-sm py-5">
              No users found for &ldquo;{query}&rdquo;
            </p>
          )}
        </div>
      )}
    </div>
  )
}
