import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const supabase = createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError) console.error('[salary/benchmark] auth error:', authError.message)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const url              = new URL(req.url)
  const field            = url.searchParams.get('field')
  const experience_level = url.searchParams.get('experience_level')
  const country          = url.searchParams.get('country')
  const employment_type  = url.searchParams.get('employment_type')
  const currency         = url.searchParams.get('currency') ?? 'ILS'

  console.log('[salary/benchmark] filters:', {
    field, experience_level, country, employment_type, currency, user_id: user.id,
  })

  const { data, error } = await supabase.rpc('get_salary_benchmark', {
    p_user_id:          user.id,
    p_field:            field            ?? null,
    p_experience_level: experience_level ?? null,
    p_country:          country          ?? null,
    p_employment_type:  employment_type  ?? null,
    p_currency:         currency,
  })

  if (error) {
    console.error('[salary/benchmark] rpc error:', error.code, error.message, error.details, error.hint)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (data === null || data === undefined) {
    console.warn('[salary/benchmark] rpc returned null — treating as hidden')
    return NextResponse.json({ hidden: true, count: 0 })
  }

  console.log('[salary/benchmark] result:', {
    hidden:       data.hidden,
    scope:        data.scope,
    count:        data.count,
    avg_midpoint: data.avg_midpoint,
    p10_midpoint: data.p10_midpoint,
    p90_midpoint: data.p90_midpoint,
    my_midpoint:  data.my_midpoint,
    my_rank:      data.my_rank,
    my_top_pct:   data.my_top_pct,
  })

  return NextResponse.json(data)
}
