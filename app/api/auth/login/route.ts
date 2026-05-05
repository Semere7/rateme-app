import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  console.log('[login] request received')

  try {
    const body = await req.json()
    const { email, password } = body

    console.log('[login] email:', email)

    if (!email || !password) {
      console.log('[login] missing email or password')
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    const response = NextResponse.json({ success: true })

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return req.cookies.getAll()
          },
          setAll(cookiesToSet) {
            console.log('[login] setting cookies:', cookiesToSet.map(c => c.name))
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    console.log('[login] calling supabase.auth.signInWithPassword...')

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      console.log('[login] supabase error:', error.message)
      return NextResponse.json({ error: error.message }, { status: 401 })
    }

    if (!data.session) {
      console.log('[login] no session returned')
      return NextResponse.json({ error: 'No session returned — check email confirmation in Supabase' }, { status: 401 })
    }

    console.log('[login] success, user:', data.user.id)
    return response

  } catch (err) {
    console.error('[login] unexpected error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Server error' },
      { status: 500 }
    )
  }
}
