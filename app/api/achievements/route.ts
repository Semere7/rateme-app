import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { VALID_TYPES, getAchievementMeta, getAchievementDefaults } from '@/lib/achievements'

export async function GET(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = new URL(req.url).searchParams.get('userId')
  if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 })

  const { data, error } = await supabase
    .from('achievements')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  return NextResponse.json({ achievements: data })
}

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { achievement_type, title, description } = body

  if (!achievement_type || !VALID_TYPES.includes(achievement_type)) {
    return NextResponse.json({ error: 'Invalid achievement type' }, { status: 400 })
  }

  const meta     = getAchievementMeta(achievement_type)!
  const defaults = getAchievementDefaults(achievement_type)!

  const { data, error } = await supabase
    .from('achievements')
    .insert({
      user_id:             user.id,
      achievement_type,
      category:            defaults.category,
      impact_level:        defaults.impactLevel,
      title:               title?.trim() || meta.label,
      description:         description?.trim() ?? '',
      points:              defaults.points,
      verification_status: 'verified',
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  return NextResponse.json({ achievement: data }, { status: 201 })
}
