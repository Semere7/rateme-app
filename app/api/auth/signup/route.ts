import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  console.log('[auth] supabaseUrl:', process.env.NEXT_PUBLIC_SUPABASE_URL)

  const { email, password, username, full_name } = await req.json()

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
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://rateme-app-lilac.vercel.app'
  const emailRedirectTo = `${siteUrl}/dashboard`
  console.log('[signup] emailRedirectTo:', emailRedirectTo)

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { username: username.toLowerCase(), full_name },
      emailRedirectTo,
    },
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  if (!data.session) {
    return NextResponse.json(
      { error: 'Please confirm your email before signing in. Check your inbox — or disable "Confirm email" in Supabase → Authentication → Providers → Email.' },
      { status: 400 }
    )
  }

  return response
}
