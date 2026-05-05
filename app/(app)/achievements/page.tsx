import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Achievement, AchievementScore } from '@/types'
import AchievementsSection from '@/components/AchievementsSection'
import { computeAchievementRank } from '@/lib/achievements'

export const dynamic = 'force-dynamic'

export default async function AchievementsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [achievementsResult, allScoresResult, myScoreResult] = await Promise.all([
    supabase
      .from('achievements')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
    supabase.from('achievement_scores').select('user_id, total_points').gt('total_points', 0),
    supabase.from('achievement_scores').select('*').eq('user_id', user.id).maybeSingle(),
  ])

  const achievements    = (achievementsResult.data as Achievement[]) ?? []
  const allScores       = (allScoresResult.data as { user_id: string; total_points: number }[]) ?? []
  const myScore         = (myScoreResult.data as AchievementScore) ?? null
  const achPoints       = myScore?.total_points ?? 0
  const achievementRank = computeAchievementRank(allScores, achPoints)

  return (
    <div className="card p-5">
      <AchievementsSection
        achievements={achievements}
        totalPoints={achPoints}
        rankInfo={achievementRank}
        isOwn={true}
        profileId={user.id}
        compact={false}
      />
    </div>
  )
}
