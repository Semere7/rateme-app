import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { UserScore, AchievementScore, Profile, SalaryProfile } from '@/types'
import { CURRENCY_SYMBOLS, getFieldLabel, getExperienceLabel } from '@/lib/salary'
import WelcomeBanner from '@/components/WelcomeBanner'
import Avatar from '@/components/Avatar'
import {
  computeAchievementRank,
  formatPercentile,
  getAchievementLevel,
  getLevelProgress,
  LEVEL_BADGE_COLORS,
  LEVEL_BAR_COLORS,
} from '@/lib/achievements'

export const dynamic = 'force-dynamic'

type RankField = 'trust_avg' | 'communication_avg' | 'helpfulness_avg' | 'respect_avg' | 'overall_score'

const SOCIAL_CATEGORIES: { label: string; field: RankField }[] = [
  { label: 'Trust',         field: 'trust_avg' },
  { label: 'Communication', field: 'communication_avg' },
  { label: 'Helpfulness',   field: 'helpfulness_avg' },
  { label: 'Respect',       field: 'respect_avg' },
]

function toPercent(avg: number | null | undefined): number {
  const n = Number(avg)
  if (!avg || isNaN(n) || n <= 0) return 0
  return Math.min(100, Math.round((n / 5) * 100))
}

function computeRankings(all: UserScore[], mine: UserScore) {
  const total = all.length
  return [...SOCIAL_CATEGORIES, { label: 'Overall', field: 'overall_score' as RankField }].map(({ label, field }) => {
    const myVal  = Number(mine[field]) || 0
    const rank   = all.filter(s => (Number(s[field]) || 0) > myVal).length + 1
    const pct    = toPercent(mine[field])
    const topPct = Math.ceil((rank / total) * 100)
    return { label, rank, total, pct, topPct }
  })
}

type ActivityEvent = {
  type: 'rated_you' | 'you_rated' | 'friend_request'
  userId: string
  name: string
  avatarUrl: string | null
  timestamp: string
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return new Date(iso).toLocaleDateString()
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { welcome?: string }
}) {
  const supabase = createClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError) console.error('[dashboard] auth error:', userError.message)
  if (!user) redirect('/login')

  const userId = user.id

  const [
    profileResult,
    scoreResult, allScoresResult,
    ratingsReceivedResult, ratingsGivenResult, friendRequestsResult,
    allAchievementScoresResult, myAchievementScoreResult,
    salaryResult,
  ] = await Promise.all([
    supabase.from('profiles').select('id, username, full_name, avatar_url').eq('id', userId).maybeSingle(),
    supabase.from('user_scores').select('*').eq('user_id', userId).maybeSingle(),
    supabase.from('user_scores').select('*').gt('rating_count', 0),
    supabase
      .from('ratings')
      .select('id, created_at, rater:rater_id(id, full_name, avatar_url, username)')
      .eq('ratee_id', userId).order('created_at', { ascending: false }).limit(8),
    supabase
      .from('ratings')
      .select('id, created_at, ratee:ratee_id(id, full_name, avatar_url, username)')
      .eq('rater_id', userId).order('created_at', { ascending: false }).limit(8),
    supabase
      .from('friendships')
      .select('id, created_at, requester:requester_id(id, full_name, avatar_url, username)')
      .eq('addressee_id', userId).eq('status', 'pending').order('created_at', { ascending: false }).limit(8),
    supabase.from('achievement_scores').select('user_id, total_points').gt('total_points', 0),
    supabase.from('achievement_scores').select('*').eq('user_id', userId).maybeSingle(),
    supabase.from('salary_profiles').select('salary_min, salary_max, currency, field, experience_level').eq('user_id', userId).maybeSingle(),
  ])

  const profile       = (profileResult.data as Pick<Profile, 'id' | 'username' | 'full_name' | 'avatar_url'>) ?? null
  const score         = (scoreResult.data as UserScore) ?? null
  const allScores     = (allScoresResult.data as UserScore[]) ?? []

  const rankings        = score && allScores.length >= 2 ? computeRankings(allScores, score) : null
  const overallRanking  = rankings?.find(r => r.label === 'Overall') ?? null
  const socialRankings  = rankings?.filter(r => r.label !== 'Overall') ?? []
  const weakestSocial   = socialRankings.length > 0 ? [...socialRankings].sort((a, b) => b.topPct - a.topPct)[0] : null
  const strongestSocial = socialRankings.length > 0 ? [...socialRankings].sort((a, b) => a.topPct - b.topPct)[0] : null

  const myAchievementScore   = (myAchievementScoreResult.data as AchievementScore) ?? null
  const allAchievementScores = (allAchievementScoresResult.data as { user_id: string; total_points: number }[]) ?? []
  const achPoints            = myAchievementScore?.total_points ?? 0
  const achievementRank      = computeAchievementRank(allAchievementScores, achPoints)

  const salaryProfile = (salaryResult.data as Pick<SalaryProfile, 'salary_min' | 'salary_max' | 'currency' | 'field' | 'experience_level'> | null) ?? null

  const socialScore = toPercent(score?.overall_score)
  const level       = getAchievementLevel(achPoints)
  const levelPct    = getLevelProgress(achPoints, level)

  const events: ActivityEvent[] = []
  for (const r of (ratingsReceivedResult.data ?? []) as any[]) {
    if (r.rater && typeof r.rater === 'object' && !Array.isArray(r.rater))
      events.push({ type: 'rated_you', userId: r.rater.id, name: r.rater.full_name, avatarUrl: r.rater.avatar_url || null, timestamp: r.created_at })
  }
  for (const r of (ratingsGivenResult.data ?? []) as any[]) {
    if (r.ratee && typeof r.ratee === 'object' && !Array.isArray(r.ratee))
      events.push({ type: 'you_rated', userId: r.ratee.id, name: r.ratee.full_name, avatarUrl: r.ratee.avatar_url || null, timestamp: r.created_at })
  }
  for (const f of (friendRequestsResult.data ?? []) as any[]) {
    if (f.requester && typeof f.requester === 'object' && !Array.isArray(f.requester))
      events.push({ type: 'friend_request', userId: f.requester.id, name: f.requester.full_name, avatarUrl: f.requester.avatar_url || null, timestamp: f.created_at })
  }
  events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  const recentActivity = events.slice(0, 5)

  const welcomeType = searchParams.welcome === 'signup' || searchParams.welcome === 'login'
    ? searchParams.welcome : null

  return (
    <div className="space-y-4">
      {welcomeType && <WelcomeBanner type={welcomeType} />}

      {/* ── Hero: Profile + Scores ── */}
      <section className="card p-5">
        <div className="flex items-center gap-4 mb-5">
          <Avatar src={profile?.avatar_url ?? null} name={profile?.full_name ?? 'You'} size="lg" />
          <div>
            <h1 className="text-xl font-bold text-gray-900">{profile?.full_name || 'Your Dashboard'}</h1>
            {profile?.username && <p className="text-sm text-gray-400 mt-0.5">@{profile.username}</p>}
          </div>
        </div>

        {/* Score tiles */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="rounded-xl bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-100 p-4">
            <p className="text-xs font-semibold text-blue-400 uppercase tracking-wide mb-2">Social Score</p>
            {score ? (
              <>
                <p className="text-3xl font-bold text-blue-700 leading-none">
                  {socialScore}<span className="text-sm font-normal text-blue-400">/100</span>
                </p>
                <p className="text-xs text-blue-400 mt-2">
                  {overallRanking ? (() => {
                    const pct = formatPercentile(overallRanking.topPct)
                    return `#${overallRanking.rank} of ${overallRanking.total}${pct ? ` · ${pct.label}` : ''}`
                  })() : `${score.rating_count} rating${score.rating_count !== 1 ? 's' : ''}`}
                </p>
              </>
            ) : (
              <>
                <p className="text-2xl font-bold text-blue-300 leading-none">—</p>
                <p className="text-xs text-blue-300 mt-2">Not rated yet</p>
              </>
            )}
          </div>

          <div className="rounded-xl bg-gradient-to-br from-purple-50 to-purple-100/50 border border-purple-100 p-4">
            <p className="text-xs font-semibold text-purple-400 uppercase tracking-wide mb-2">Achievement Pts</p>
            {achPoints > 0 ? (
              <>
                <p className="text-3xl font-bold text-purple-700 leading-none">{achPoints.toLocaleString()}</p>
                <p className="text-xs text-purple-400 mt-2">
                  {achievementRank ? (() => {
                    const pct = formatPercentile(achievementRank.topPct)
                    return `#${achievementRank.rank} of ${achievementRank.total}${pct ? ` · ${pct.label}` : ''}`
                  })() : `${myAchievementScore?.achievement_count ?? 0} achievement${(myAchievementScore?.achievement_count ?? 0) !== 1 ? 's' : ''}`}
                </p>
              </>
            ) : (
              <>
                <p className="text-2xl font-bold text-purple-300 leading-none">—</p>
                <p className="text-xs text-purple-300 mt-2">No achievements yet</p>
              </>
            )}
          </div>
        </div>

        {/* Strengths */}
        {(strongestSocial || weakestSocial) && (
          <div className="flex flex-wrap gap-x-4 gap-y-1 mb-4">
            {strongestSocial && (
              <p className="text-xs text-gray-500">
                <span className="text-emerald-500 font-semibold">↑ Strongest:</span>{' '}
                <span className="font-medium text-gray-700">{strongestSocial.label}</span>{' '}
                <span className="text-gray-400">({strongestSocial.pct}%)</span>
              </p>
            )}
            {weakestSocial && weakestSocial.label !== strongestSocial?.label && (
              <p className="text-xs text-gray-500">
                <span className="text-amber-500 font-semibold">↓ Needs work:</span>{' '}
                <span className="font-medium text-gray-700">{weakestSocial.label}</span>{' '}
                <span className="text-gray-400">({weakestSocial.pct}%)</span>
              </p>
            )}
          </div>
        )}

        {!score && (
          <p className="text-sm text-gray-400 mb-4">
            Ask a friend to rate you — your Social Score will appear once you have ratings.
          </p>
        )}
        {achPoints === 0 && (
          <p className="text-xs text-gray-400 mb-4">
            Technology & Global Impact achievements give the highest points.
          </p>
        )}

        {/* Quick actions */}
        <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-100">
          <Link
            href="/achievements"
            className="text-xs font-semibold text-purple-600 hover:text-purple-800 bg-purple-50 hover:bg-purple-100 border border-purple-200 px-3 py-1.5 rounded-full transition-colors"
          >
            View Achievements
          </Link>
          <Link
            href="/compare"
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-1.5 rounded-full transition-colors"
          >
            Compare & Rank
          </Link>
          {!score && (
            <Link
              href="/friends"
              className="text-xs font-semibold text-gray-600 hover:text-gray-800 bg-gray-50 hover:bg-gray-100 border border-gray-200 px-3 py-1.5 rounded-full transition-colors"
            >
              Get rated by friends
            </Link>
          )}
          {weakestSocial && (
            <Link
              href="/friends"
              className="text-xs font-semibold text-amber-700 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-3 py-1.5 rounded-full transition-colors"
            >
              Improve {weakestSocial.label}
            </Link>
          )}
        </div>
      </section>

      {/* ── Achievement Summary ── */}
      <section className="card p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-gray-800">Achievements</h2>
          <Link href="/achievements" className="text-xs font-semibold text-purple-600 hover:text-purple-800">
            View all →
          </Link>
        </div>

        {achPoints > 0 ? (
          <div>
            <div className="flex items-center gap-4 mb-3">
              <div>
                <p className="text-2xl font-bold text-purple-700">{achPoints.toLocaleString()}</p>
                <p className="text-xs text-purple-500 font-medium">Total Points</p>
              </div>
              <div className="w-px h-10 bg-purple-100" />
              <div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold border ${LEVEL_BADGE_COLORS[level.tone]}`}>
                  {level.label}
                </span>
                <p className="text-xs text-gray-400 mt-1.5">
                  {level.nextAt
                    ? `${(level.nextAt - achPoints).toLocaleString()} pts to ${level.nextLabel}`
                    : 'Max level reached'}
                </p>
              </div>
            </div>
            {level.nextAt && (
              <div>
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>{level.label}</span>
                  <span>{levelPct}% to {level.nextLabel}</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${LEVEL_BAR_COLORS[level.tone]}`}
                    style={{ width: `${levelPct}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-between py-2">
            <p className="text-sm text-gray-400">No achievements yet</p>
            <Link
              href="/achievements"
              className="text-xs font-semibold text-purple-600 hover:text-purple-800 bg-purple-50 hover:bg-purple-100 border border-purple-200 px-3 py-1.5 rounded-full transition-colors"
            >
              + Add first achievement
            </Link>
          </div>
        )}
      </section>

      {/* ── Salary Insight ── */}
      <section className="card p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-gray-800">Salary Insight</h2>
          <Link href="/salary" className="text-xs font-semibold text-blue-600 hover:text-blue-800">
            View insights →
          </Link>
        </div>
        {salaryProfile ? (
          <div className="flex items-center gap-4">
            <div>
              <p className="text-lg font-bold text-gray-800">
                {CURRENCY_SYMBOLS[salaryProfile.currency] ?? salaryProfile.currency}
                {salaryProfile.salary_min.toLocaleString()}
                {' – '}
                {CURRENCY_SYMBOLS[salaryProfile.currency] ?? salaryProfile.currency}
                {salaryProfile.salary_max.toLocaleString()}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                {getFieldLabel(salaryProfile.field)} · {getExperienceLabel(salaryProfile.experience_level)}
              </p>
            </div>
            <div className="ml-auto">
              <Link
                href="/salary"
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-1.5 rounded-full transition-colors"
              >
                See benchmarks
              </Link>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between py-1">
            <p className="text-sm text-gray-400">Add your salary to see private benchmarks</p>
            <Link
              href="/salary"
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-1.5 rounded-full transition-colors shrink-0 ml-3"
            >
              + Add salary
            </Link>
          </div>
        )}
      </section>

      {/* ── Social Ranking ── */}
      {rankings && (
        <section className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-800">Social Ranking</h2>
            <Link href="/compare" className="text-xs font-semibold text-blue-600 hover:text-blue-800">
              Full comparison →
            </Link>
          </div>
          <div className="space-y-3">
            {socialRankings.map(({ label, rank, total, pct }) => {
              const isWeakest   = weakestSocial?.label === label
              const isStrongest = strongestSocial?.label === label
              return (
                <div key={label} className="flex items-center gap-3">
                  <span className={`w-28 text-sm shrink-0 ${
                    isWeakest   ? 'font-semibold text-amber-600' :
                    isStrongest ? 'font-semibold text-emerald-600' :
                    'font-medium text-gray-600'
                  }`}>
                    {isWeakest ? '↓ ' : isStrongest ? '↑ ' : ''}{label}
                  </span>
                  <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        isWeakest ? 'bg-amber-400' : isStrongest ? 'bg-emerald-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-8 text-right text-xs text-gray-400 shrink-0">{pct}%</span>
                  <span className="w-16 text-right text-sm font-bold text-blue-600 shrink-0">
                    #{rank}<span className="text-gray-300 font-normal text-xs">/{total}</span>
                  </span>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* ── Recent Activity ── */}
      {recentActivity.length > 0 && (
        <section className="card px-4 py-3">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Recent Activity</h2>
          <div className="divide-y divide-gray-50">
            {recentActivity.map((event, i) => (
              <div key={i} className="flex items-center gap-2.5 py-2.5 first:pt-0 last:pb-0">
                <Link href={`/profile/${event.userId}`} className="shrink-0">
                  <Avatar src={event.avatarUrl} name={event.name} size="sm" />
                </Link>
                <p className="flex-1 text-xs text-gray-600 min-w-0">
                  {event.type === 'rated_you' && (
                    <><Link href={`/profile/${event.userId}`} className="font-semibold text-gray-800">{event.name}</Link> rated you</>
                  )}
                  {event.type === 'you_rated' && (
                    <>You rated <Link href={`/profile/${event.userId}`} className="font-semibold text-gray-800">{event.name}</Link></>
                  )}
                  {event.type === 'friend_request' && (
                    <><Link href={`/profile/${event.userId}`} className="font-semibold text-gray-800">{event.name}</Link> sent a friend request</>
                  )}
                </p>
                <span className="text-xs text-gray-400 shrink-0">{timeAgo(event.timestamp)}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
