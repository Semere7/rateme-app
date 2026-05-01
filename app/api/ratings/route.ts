import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { ratee_id, trust, communication, helpfulness, respect, comment } = await req.json()

  if (!ratee_id) return NextResponse.json({ error: 'Missing ratee_id' }, { status: 400 })
  if (ratee_id === user.id) return NextResponse.json({ error: 'Cannot rate yourself' }, { status: 400 })

  // Validate scores
  const scores = { trust, communication, helpfulness, respect }
  for (const [key, val] of Object.entries(scores)) {
    if (!Number.isInteger(val) || val < 1 || val > 5) {
      return NextResponse.json({ error: `${key} must be an integer between 1 and 5` }, { status: 400 })
    }
  }

  // Verify accepted friendship exists
  const { data: friendship } = await supabase
    .from('friendships')
    .select('id')
    .eq('status', 'accepted')
    .or(
      `and(requester_id.eq.${user.id},addressee_id.eq.${ratee_id}),` +
      `and(requester_id.eq.${ratee_id},addressee_id.eq.${user.id})`
    )
    .maybeSingle()

  if (!friendship) {
    return NextResponse.json(
      { error: 'You can only rate accepted friends' },
      { status: 403 }
    )
  }

  // Upsert rating (insert or update if already rated)
  const { data, error } = await supabase
    .from('ratings')
    .upsert(
      {
        rater_id: user.id,
        ratee_id,
        trust,
        communication,
        helpfulness,
        respect,
        comment: comment ?? '',
      },
      { onConflict: 'rater_id,ratee_id' }
    )
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  return NextResponse.json({ rating: data })
}

export async function GET(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const userId = searchParams.get('userId')

  if (!userId) return NextResponse.json({ error: 'Missing userId param' }, { status: 400 })

  const { data, error } = await supabase
    .from('ratings')
    .select('*, rater:rater_id(id, username, full_name, avatar_url)')
    .eq('ratee_id', userId)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  return NextResponse.json({ ratings: data })
}
