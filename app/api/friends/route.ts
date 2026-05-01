import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('friendships')
    .select(`
      id, requester_id, addressee_id, status, created_at,
      requester:requester_id(id, username, full_name, avatar_url),
      addressee:addressee_id(id, username, full_name, avatar_url)
    `)
    .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  return NextResponse.json({ friendships: data })
}
