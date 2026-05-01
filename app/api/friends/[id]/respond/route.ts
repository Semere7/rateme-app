import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { status } = await req.json()

  if (!['accepted', 'rejected'].includes(status)) {
    return NextResponse.json({ error: 'Status must be "accepted" or "rejected"' }, { status: 400 })
  }

  // Verify the request exists and current user is the addressee
  const { data: friendship } = await supabase
    .from('friendships')
    .select('id, addressee_id, status')
    .eq('id', params.id)
    .single()

  if (!friendship) return NextResponse.json({ error: 'Friend request not found' }, { status: 404 })
  if (friendship.addressee_id !== user.id) return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
  if (friendship.status !== 'pending') return NextResponse.json({ error: 'Request already responded to' }, { status: 409 })

  const { data, error } = await supabase
    .from('friendships')
    .update({ status })
    .eq('id', params.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  return NextResponse.json({ friendship: data })
}
