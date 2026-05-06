import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  console.log('[middleware] has url:', !!process.env.NEXT_PUBLIC_SUPABASE_URL)
  console.log('[middleware] has anon:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

  // Pass through Next.js internals, static assets, and public auth routes
  const isPublicRoute =
    pathname === '/' ||
    pathname === '/login' ||
    pathname === '/signup' ||
    pathname.startsWith('/auth/') ||
    pathname.startsWith('/_next/') ||
    pathname === '/favicon.ico'

  // API routes handle their own auth
  if (pathname.startsWith('/api/')) {
    return NextResponse.next()
  }

  // Bail out early if env vars are missing — avoids crash in createServerClient
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error('[middleware] missing Supabase env vars — skipping auth check')
    if (!isPublicRoute) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    return NextResponse.next()
  }

  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  let user = null
  try {
    const { data } = await supabase.auth.getUser()
    user = data.user
  } catch (err) {
    console.error('[middleware] getUser error:', err)
    // If session check fails, treat as unauthenticated
  }

  const isAuthPage = pathname === '/login' || pathname === '/signup'

  if (!user && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (user && isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
