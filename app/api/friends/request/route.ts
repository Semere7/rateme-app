import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { addressee_id } = await req.json()

  if (!addressee_id) return NextResponse.json({ error: 'Missing addressee_id' }, { status: 400 })
  if (addressee_id === user.id) return NextResponse.json({ error: 'Cannot send request to yourself' }, { status: 400 })

  // Check if target user exists
  const { data: targetProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', addressee_id)
    .single()

  if (!targetProfile) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  // Check if friendship already exists in either direction
  const { data: existing } = await supabase
    .from('friendships')
    .select('id, status')
    .or(
      `and(requester_id.eq.${user.id},addressee_id.eq.${addressee_id}),` +
      `and(requester_id.eq.${addressee_id},addressee_id.eq.${user.id})`
    )
    .maybeSingle()

  if (existing) {
    if (existing.status === 'accepted') {
      return NextResponse.json({ error: 'Already friends' }, { status: 409 })
    }
    if (existing.status === 'pending') {
      return NextResponse.json({ error: 'Friend request already exists' }, { status: 409 })
    }
    // If rejected, allow re-sending by deleting the old record first
    await supabase.from('friendships').delete().eq('id', existing.id)
  }

  const { data, error } = await supabase.from('friendships').insert({
    requester_id: user.id,
    addressee_id,
    status: 'pending',
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  return NextResponse.json({ friendship: data })
}
