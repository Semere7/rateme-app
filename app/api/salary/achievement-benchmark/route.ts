import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

const TOLERANCE = 0.50  // ±50% of achievement score

export async function GET(req: NextRequest) {
  const supabase = createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError) console.error('[salary/achievement-benchmark] auth error:', authError.message)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const url      = new URL(req.url)
  const points   = Number(url.searchParams.get('points') ?? '0')
  const currency = url.searchParams.get('currency') ?? 'ILS'

  if (points <= 0) return NextResponse.json({ hidden: true, count: 0 })

  const minPoints = Math.max(0, points * (1 - TOLERANCE))
  const maxPoints = points * (1 + TOLERANCE)

  console.log('[salary/achievement-benchmark] filters:', {
    points, minPoints, maxPoints, currency, user_id: user.id,
  })

  const { data, error } = await supabase.rpc('get_achievement_salary_benchmark', {
    p_min_points: minPoints,
    p_max_points: maxPoints,
    p_currency:   currency,
  })

  if (error) {
    console.error('[salary/achievement-benchmark] rpc error:', error.code, error.message, error.details, error.hint)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (data === null || data === undefined) {
    console.warn('[salary/achievement-benchmark] rpc returned null — treating as hidden')
    return NextResponse.json({ hidden: true, count: 0 })
  }

  console.log('[salary/achievement-benchmark] result:', {
    hidden: data.hidden, count: data.count, avg_midpoint: data.avg_midpoint,
  })

  return NextResponse.json(data)
}
