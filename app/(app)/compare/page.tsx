import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import RankingComparison from '@/app/(app)/dashboard/RankingComparison'

export const dynamic = 'force-dynamic'

export default async function ComparePage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div className="card p-5">
      <RankingComparison userId={user.id} />
    </div>
  )
}
