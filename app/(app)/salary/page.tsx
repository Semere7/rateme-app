import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SalaryProfile, AchievementScore } from '@/types'
import SalaryClient from './SalaryClient'

export const dynamic = 'force-dynamic'

export default async function SalaryPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [profileResult, achScoreResult] = await Promise.all([
    supabase.from('salary_profiles').select('*').eq('user_id', user.id).maybeSingle(),
    supabase.from('achievement_scores').select('total_points').eq('user_id', user.id).maybeSingle(),
  ])

  const salaryProfile     = (profileResult.data  as SalaryProfile   | null) ?? null
  const achievementPoints = ((achScoreResult.data as AchievementScore | null)?.total_points) ?? 0

  return (
    <SalaryClient
      initialProfile={salaryProfile}
      achievementPoints={achievementPoints}
    />
  )
}
