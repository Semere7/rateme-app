import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { SalaryProfile } from '@/types'
import {
  EXPERIENCE_LEVELS, COUNTRY_LIST, EMPLOYMENT_TYPES, CURRENCIES,
} from '@/lib/salary'

const VALID_EXPERIENCE = EXPERIENCE_LEVELS.map(e => e.value)
const VALID_EMPLOYMENT = EMPLOYMENT_TYPES.map(e => e.value)
const VALID_CURRENCIES = CURRENCIES.map(c => c.value)

export async function GET() {
  const supabase = createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError) console.error('[salary/me GET] auth error:', authError.message)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('salary_profiles')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()

  if (error) {
    console.error('[salary/me GET] db error:', error.code, error.message, '| user:', user.id)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ profile: data as SalaryProfile | null })
}

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError) console.error('[salary/me POST] auth error:', authError.message)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { salary_min, salary_max, currency, field, experience_level, country, employment_type, include_in_benchmarks } = body

  // Validate
  if (typeof salary_min !== 'number' || typeof salary_max !== 'number')
    return NextResponse.json({ error: 'salary_min and salary_max must be numbers' }, { status: 400 })
  if (salary_min < 0 || salary_max < salary_min)
    return NextResponse.json({ error: 'Invalid salary range' }, { status: 400 })
  if (!VALID_CURRENCIES.includes(currency))
    return NextResponse.json({ error: 'Invalid currency' }, { status: 400 })
  if (typeof field !== 'string' || field.trim() === '' || field.trim() === 'other')
    return NextResponse.json({ error: 'Invalid field' }, { status: 400 })
  if (!VALID_EXPERIENCE.includes(experience_level))
    return NextResponse.json({ error: 'Invalid experience_level' }, { status: 400 })
  if (!COUNTRY_LIST.includes(country))
    return NextResponse.json({ error: 'Invalid country' }, { status: 400 })
  if (!VALID_EMPLOYMENT.includes(employment_type))
    return NextResponse.json({ error: 'Invalid employment_type' }, { status: 400 })

  const { data, error } = await supabase
    .from('salary_profiles')
    .upsert({
      user_id: user.id,
      salary_min,
      salary_max,
      currency,
      field:                  field.trim(),
      experience_level,
      country,
      employment_type,
      include_in_benchmarks:  include_in_benchmarks !== false,
      updated_at:             new Date().toISOString(),
    }, { onConflict: 'user_id' })
    .select()
    .single()

  if (error) {
    console.error('[salary/me POST] db error:', error.code, error.message, '| user:', user.id)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ profile: data as SalaryProfile })
}
