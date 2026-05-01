import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { rating_id, reason } = await req.json()

  if (!rating_id) return NextResponse.json({ error: 'Missing rating_id' }, { status: 400 })
  if (!reason?.trim()) return NextResponse.json({ error: 'Reason is required' }, { status: 400 })

  // Verify the rating exists and is on the reporter's own profile
  const { data: rating } = await supabase
    .from('ratings')
    .select('id, ratee_id, rater_id')
    .eq('id', rating_id)
    .single()

  if (!rating) return NextResponse.json({ error: 'Rating not found' }, { status: 404 })

  // Only the person being rated (ratee) can report a rating about themselves
  if (rating.ratee_id !== user.id) {
    return NextResponse.json({ error: 'You can only report ratings on your own profile' }, { status: 403 })
  }

  if (rating.rater_id === user.id) {
    return NextResponse.json({ error: 'Cannot report your own rating' }, { status: 400 })
  }

  // Check for duplicate report
  const { data: existing } = await supabase
    .from('reports')
    .select('id')
    .eq('reporter_id', user.id)
    .eq('rating_id', rating_id)
    .maybeSingle()

  if (existing) {
    return NextResponse.json({ error: 'You have already reported this rating' }, { status: 409 })
  }

  const { data, error } = await supabase.from('reports').insert({
    reporter_id: user.id,
    rating_id,
    reason: reason.trim(),
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  return NextResponse.json({ report: data })
}
