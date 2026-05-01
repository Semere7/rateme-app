import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Friendship, Profile } from '@/types'
import FriendRequestButton from '@/components/FriendRequestButton'

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch all friendships for current user
  const { data: rawFriendships } = await supabase
    .from('friendships')
    .select(`
      id, requester_id, addressee_id, status, created_at, updated_at,
      requester:requester_id(id, username, full_name, avatar_url),
      addressee:addressee_id(id, username, full_name, avatar_url)
    `)
    .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
    .order('created_at', { ascending: false })

  const friendships = (rawFriendships ?? []) as unknown as (Friendship & {
    requester: Profile
    addressee: Profile
  })[]

  const accepted = friendships.filter((f) => f.status === 'accepted')
  const pendingIncoming = friendships.filter(
    (f) => f.status === 'pending' && f.addressee_id === user.id
  )
  const pendingOutgoing = friendships.filter(
    (f) => f.status === 'pending' && f.requester_id === user.id
  )

  function getFriendProfile(f: typeof accepted[0]): Profile {
    return f.requester_id === user!.id ? f.addressee : f.requester
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>

      {/* Incoming Friend Requests */}
      {pendingIncoming.length > 0 && (
        <section className="card p-5">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            Friend Requests
            <span className="bg-blue-100 text-blue-700 text-xs font-medium px-2 py-0.5 rounded-full">
              {pendingIncoming.length}
            </span>
          </h2>
          <div className="space-y-3">
            {pendingIncoming.map((f) => (
              <div key={f.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <Link href={`/profile/${f.requester.id}`} className="flex items-center gap-3 hover:opacity-80">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-semibold text-sm">
                    {f.requester.full_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{f.requester.full_name}</p>
                    <p className="text-sm text-gray-500">@{f.requester.username}</p>
                  </div>
                </Link>
                <FriendRequestButton
                  targetUserId={f.requester.id}
                  friendship={{ id: f.id, status: f.status, requester_id: f.requester_id, addressee_id: f.addressee_id }}
                  currentUserId={user.id}
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Friends List */}
      <section className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">
            My Friends
            <span className="ml-2 text-sm font-normal text-gray-400">({accepted.length})</span>
          </h2>
          <Link href="/friends" className="text-sm text-blue-600 hover:underline">
            Find Friends →
          </Link>
        </div>

        {accepted.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <p className="text-3xl mb-2">👥</p>
            <p>No friends yet.</p>
            <Link href="/friends" className="text-blue-600 hover:underline text-sm mt-1 inline-block">
              Find people to connect with
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {accepted.map((f) => {
              const friend = getFriendProfile(f)
              return (
                <Link
                  key={f.id}
                  href={`/profile/${friend.id}`}
                  className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white font-semibold text-sm shrink-0">
                    {friend.full_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-gray-800 truncate">{friend.full_name}</p>
                    <p className="text-sm text-gray-500 truncate">@{friend.username}</p>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </section>

      {/* Outgoing Requests */}
      {pendingOutgoing.length > 0 && (
        <section className="card p-5">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Pending Sent Requests
            <span className="ml-2 text-sm font-normal text-gray-400">({pendingOutgoing.length})</span>
          </h2>
          <div className="space-y-2">
            {pendingOutgoing.map((f) => (
              <div key={f.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center text-white font-semibold text-sm">
                  {f.addressee.full_name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-700 truncate">{f.addressee.full_name}</p>
                  <p className="text-xs text-gray-400">@{f.addressee.username}</p>
                </div>
                <span className="text-xs text-yellow-600 bg-yellow-50 border border-yellow-200 px-2 py-0.5 rounded-full">
                  Pending
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
