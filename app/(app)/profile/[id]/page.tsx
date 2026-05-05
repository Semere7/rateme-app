import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Profile, Rating, UserScore, Friendship, Achievement, AchievementScore } from '@/types'
import StarRating from '@/components/StarRating'
import FriendRequestButton from '@/components/FriendRequestButton'
import Avatar from '@/components/Avatar'
import ProfileRatingSection from './ProfileRatingSection'
import ReportTrigger from './ReportTrigger'
import AchievementsSection from '@/components/AchievementsSection'
import { computeAchievementRank } from '@/lib/achievements'

export default async function ProfilePage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [
    { data: profile },
    { data: score },
    { data: rawRatings },
    { data: rawFriendship },
    { data: rawAchievements },
    { data: rawAchievementScore },
    { data: rawAllAchievementScores },
  ] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', params.id).single(),
    supabase.from('user_scores').select('*').eq('user_id', params.id).single(),
    supabase
      .from('ratings')
      .select('*, rater:rater_id(id, username, full_name, avatar_url)')
      .eq('ratee_id', params.id)
      .order('created_at', { ascending: false }),
    params.id === user.id
      ? { data: null }
      : supabase
          .from('friendships')
          .select('id, requester_id, addressee_id, status')
          .or(
            `and(requester_id.eq.${user.id},addressee_id.eq.${params.id}),` +
            `and(requester_id.eq.${params.id},addressee_id.eq.${user.id})`
          )
          .maybeSingle(),
    supabase
      .from('achievements')
      .select('*')
      .eq('user_id', params.id)
      .order('created_at', { ascending: false }),
    supabase.from('achievement_scores').select('*').eq('user_id', params.id).maybeSingle(),
    supabase.from('achievement_scores').select('user_id, total_points').gt('total_points', 0),
  ])

  if (!profile) notFound()

  const typedProfile  = profile as Profile
  const typedScore    = score as UserScore | null
  const ratings       = (rawRatings ?? []) as unknown as (Rating & { rater: Profile })[]
  const friendship    = rawFriendship as Pick<Friendship, 'id' | 'requester_id' | 'addressee_id' | 'status'> | null

  const isPublicFigure = typedProfile.profile_type === 'public_figure'
  const isOwnProfile   = !isPublicFigure && params.id === user.id
  const isFriend       = friendship?.status === 'accepted'
  const myRating       = ratings.find((r) => r.rater_id === user.id) ?? null

  const achievements       = (rawAchievements ?? []) as Achievement[]
  const achievementScore   = rawAchievementScore as AchievementScore | null
  const allAchievementScores = (rawAllAchievementScores ?? []) as { user_id: string; total_points: number }[]
  const achievementRank    = computeAchievementRank(allAchievementScores, achievementScore?.total_points ?? 0)

  const scoreCategories = [
    { label: 'Trust', value: typedScore?.trust_avg },
    { label: 'Communication', value: typedScore?.communication_avg },
    { label: 'Helpfulness', value: typedScore?.helpfulness_avg },
    { label: 'Respect', value: typedScore?.respect_avg },
  ]

  // ── Public figure: abbreviated layout ────────────────────────────────────
  if (isPublicFigure) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="card p-6">
          <div className="flex flex-col sm:flex-row gap-5 items-start">
            <Avatar src={typedProfile.avatar_url} name={typedProfile.full_name} size="lg" />
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold text-gray-800">{typedProfile.full_name}</h1>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-purple-100 text-purple-700 border border-purple-200 shrink-0">
                  Public Figure
                </span>
              </div>
              <p className="text-gray-500 mb-3">@{typedProfile.username}</p>
              {typedProfile.bio && (
                <p className="text-gray-600 text-sm leading-relaxed mb-3">{typedProfile.bio}</p>
              )}
              <p className="text-xs text-gray-400 bg-gray-50 rounded-lg px-3 py-2.5 border border-gray-100">
                This profile is based on publicly known achievements and is not managed by this person.
              </p>
            </div>
          </div>
        </div>

        {/* Achievements — main content for public figures */}
        <div className="card p-6">
          <AchievementsSection
            achievements={achievements}
            totalPoints={achievementScore?.total_points ?? 0}
            rankInfo={achievementRank}
            isOwn={false}
            profileId={params.id}
          />
        </div>
      </div>
    )
  }

  // ── Regular user: full layout ─────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="card p-6">
        <div className="flex flex-col sm:flex-row gap-5 items-start">
          <Avatar src={typedProfile.avatar_url} name={typedProfile.full_name} size="lg" />
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">{typedProfile.full_name}</h1>
                <p className="text-gray-500">@{typedProfile.username}</p>
              </div>
              {isOwnProfile ? (
                <Link href="/profile/edit" className="btn-secondary">
                  Edit Profile
                </Link>
              ) : (
                <FriendRequestButton
                  targetUserId={params.id}
                  friendship={friendship}
                  currentUserId={user.id}
                />
              )}
            </div>
            {typedProfile.bio && (
              <p className="mt-3 text-gray-600 text-sm leading-relaxed">{typedProfile.bio}</p>
            )}
          </div>
        </div>
      </div>

      {/* Score Card */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Overall Score</h2>
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="text-center shrink-0">
            <p className="text-5xl font-bold text-blue-600">
              {typedScore?.overall_score ?? '—'}
            </p>
            <p className="text-sm text-gray-400 mt-1">
              {typedScore?.rating_count ?? 0} rating{typedScore?.rating_count !== 1 ? 's' : ''}
            </p>
            {typedScore && (
              <div className="mt-2">
                <StarRating value={Math.round(Number(typedScore.overall_score ?? 0))} readonly size="md" />
              </div>
            )}
          </div>
          <div className="flex-1 grid grid-cols-2 gap-3 w-full">
            {scoreCategories.map((cat) => (
              <div key={cat.label} className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-1">{cat.label}</p>
                <div className="flex items-center gap-2">
                  <StarRating value={Math.round(Number(cat.value ?? 0))} readonly size="sm" />
                  <span className="text-sm font-medium text-gray-700">
                    {cat.value ? Number(cat.value).toFixed(1) : '—'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Achievements */}
      <div className="card p-6">
        <AchievementsSection
          achievements={achievements}
          totalPoints={achievementScore?.total_points ?? 0}
          rankInfo={achievementRank}
          isOwn={isOwnProfile}
          profileId={params.id}
        />
      </div>

      {/* Rate section — only for accepted friends, not own profile */}
      {!isOwnProfile && isFriend && (
        <ProfileRatingSection
          rateeId={params.id}
          rateeName={typedProfile.full_name}
          existingRating={myRating}
        />
      )}

      {!isOwnProfile && friendship?.status === 'pending' && (
        <div className="card p-5 text-center text-gray-500 text-sm">
          Friend request is pending. Once accepted, you can rate each other.
        </div>
      )}

      {!isOwnProfile && !friendship && (
        <div className="card p-5 text-center text-gray-500 text-sm">
          Send a friend request to be able to rate this person.
        </div>
      )}

      {/* Ratings List */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Ratings Received{' '}
          <span className="text-sm font-normal text-gray-400">({ratings.length})</span>
        </h2>

        {ratings.length === 0 ? (
          <p className="text-center text-gray-400 py-8">No ratings yet.</p>
        ) : (
          <div className="space-y-4">
            {ratings.map((r) => {
              const overall = (r.trust + r.communication + r.helpfulness + r.respect) / 4
              return (
                <div key={r.id} className="border border-gray-100 rounded-xl p-4">
                  <div className="flex items-start justify-between mb-3">
                    <Link
                      href={`/profile/${r.rater.id}`}
                      className="flex items-center gap-2 hover:opacity-80"
                    >
                      <Avatar src={r.rater.avatar_url} name={r.rater.full_name} size="sm" />
                      <div>
                        <p className="text-sm font-medium text-gray-800">{r.rater.full_name}</p>
                        <p className="text-xs text-gray-400">@{r.rater.username}</p>
                      </div>
                    </Link>
                    <div className="flex items-center gap-1">
                      <StarRating value={Math.round(overall)} readonly size="sm" />
                      <span className="text-sm font-semibold text-gray-700 ml-1">
                        {overall.toFixed(1)}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-2">
                    {[
                      { label: 'Trust', value: r.trust },
                      { label: 'Communication', value: r.communication },
                      { label: 'Helpfulness', value: r.helpfulness },
                      { label: 'Respect', value: r.respect },
                    ].map((cat) => (
                      <div
                        key={cat.label}
                        className="flex items-center justify-between text-xs text-gray-500 bg-gray-50 rounded px-2 py-1"
                      >
                        <span>{cat.label}</span>
                        <StarRating value={cat.value} readonly size="sm" />
                      </div>
                    ))}
                  </div>

                  {r.comment && (
                    <p className="text-sm text-gray-600 italic border-t border-gray-100 pt-3 mt-2">
                      &ldquo;{r.comment}&rdquo;
                    </p>
                  )}

                  <div className="flex items-center justify-between mt-2 pt-1">
                    <span className="text-xs text-gray-400">
                      {new Date(r.created_at).toLocaleDateString()}
                    </span>
                    {isOwnProfile && (
                      <ReportTrigger ratingId={r.id} raterName={r.rater.full_name} />
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
