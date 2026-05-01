import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Profile, Friendship } from '@/types'
import RespondButtonsClient from './RespondButtonsClient'
import FriendsSearch from './FriendsSearch'

type FriendshipWithProfiles = Friendship & { requester: Profile; addressee: Profile }

export default async function FriendsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: rawFriendships } = await supabase
    .from('friendships')
    .select(`
      id, requester_id, addressee_id, status, created_at, updated_at,
      requester:requester_id(id, username, full_name, avatar_url),
      addressee:addressee_id(id, username, full_name, avatar_url)
    `)
    .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)

  const friendships = (rawFriendships ?? []) as unknown as FriendshipWithProfiles[]
  const accepted = friendships.filter((f) => f.status === 'accepted')
  const pendingIncoming = friendships.filter(
    (f) => f.status === 'pending' && f.addressee_id === user.id
  )

  function getOtherProfile(f: FriendshipWithProfiles): Profile {
    return f.requester_id === user!.id ? f.addressee : f.requester
  }

  const searchFriendships = friendships.map((f) => ({
    id: f.id,
    requester_id: f.requester_id,
    addressee_id: f.addressee_id,
    status: f.status,
  }))

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Friends</h1>

      {/* Search */}
      <div className="card p-5">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Find People</h2>
        <FriendsSearch currentUserId={user.id} existingFriendships={searchFriendships} />
      </div>

      {/* Incoming Requests */}
      {pendingIncoming.length > 0 && (
        <div className="card p-5">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            Incoming Requests
            <span className="bg-blue-100 text-blue-700 text-xs font-medium px-2 py-0.5 rounded-full">
              {pendingIncoming.length}
            </span>
          </h2>
          <div className="space-y-3">
            {pendingIncoming.map((f) => {
              const other = getOtherProfile(f)
              return (
                <div key={f.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <Link href={`/profile/${other.id}`} className="flex items-center gap-3 hover:opacity-80">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-semibold text-sm">
                      {other.full_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{other.full_name}</p>
                      <p className="text-sm text-gray-500">@{other.username}</p>
                    </div>
                  </Link>
                  <RespondButtonsClient friendshipId={f.id} />
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Friends List */}
      <div className="card p-5">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          My Friends{' '}
          <span className="text-sm font-normal text-gray-400">({accepted.length})</span>
        </h2>
        {accepted.length === 0 ? (
          <p className="text-center text-gray-400 py-6">No friends yet. Search above to find people.</p>
        ) : (
          <div className="space-y-2">
            {accepted.map((f) => {
              const other = getOtherProfile(f)
              return (
                <Link
                  key={f.id}
                  href={`/profile/${other.id}`}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white font-semibold text-sm shrink-0">
                    {other.full_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800">{other.full_name}</p>
                    <p className="text-sm text-gray-500">@{other.username}</p>
                  </div>
                  <span className="text-blue-600 text-sm">View →</span>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
