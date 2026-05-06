'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useLanguage } from '@/contexts/LanguageContext'
import { LANGUAGES } from '@/lib/translations'
import Avatar from './Avatar'

type NavProfile = {
  id: string
  username: string
  full_name: string
  avatar_url: string | null
}

export default function Navbar({ profile }: { profile: NavProfile }) {
  const router   = useRouter()
  const pathname = usePathname()
  const supabase = createClient()
  const { t, locale, setLocale } = useLanguage()

  const NAV_LINKS = [
    { href: '/dashboard',    label: t.nav.dashboard,    mobileHidden: false },
    { href: '/achievements', label: t.nav.achievements, mobileHidden: true  },
    { href: '/compare',      label: t.nav.compare,      mobileHidden: true  },
    { href: '/salary',       label: t.nav.salary,       mobileHidden: true  },
    { href: '/friends',      label: t.nav.friends,      mobileHidden: false },
  ]

  const [open, setOpen]           = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const dropRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [])

  // Close mobile menu on navigation
  useEffect(() => { setMobileOpen(false) }, [pathname])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  function isActive(href: string) {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname === href || pathname.startsWith(href + '/')
  }

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">

        {/* Left: logo + nav links */}
        <div className="flex items-center h-full">
          <Link href="/dashboard" className="text-xl font-bold text-blue-600 shrink-0 mr-4">
            RateMe
          </Link>

          <div className="flex items-center h-full">
            {NAV_LINKS.map(({ href, label, mobileHidden }) => (
              <Link
                key={href}
                href={href}
                className={[
                  'h-full inline-flex items-center px-3 text-sm border-b-2 transition-colors',
                  mobileHidden ? 'hidden sm:inline-flex' : '',
                  isActive(href)
                    ? 'border-blue-600 text-blue-600 font-semibold'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300',
                ].join(' ')}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>

        {/* Right: add achievement + avatar dropdown */}
        <div className="flex items-center gap-2">
          <Link
            href="/achievements"
            className="hidden md:inline-flex items-center gap-1 text-xs font-semibold text-purple-600 hover:text-purple-800 bg-purple-50 hover:bg-purple-100 border border-purple-200 px-2.5 py-1 rounded-full transition-colors shrink-0"
          >
            {t.nav.addAchievement}
          </Link>

          {/* Avatar dropdown */}
          <div ref={dropRef} className="relative">
            <button
              onClick={() => setOpen((v) => !v)}
              className="flex items-center gap-1 p-1 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Account menu"
              aria-expanded={open}
            >
              <Avatar src={profile.avatar_url} name={profile.full_name} size="sm" />
              <svg
                className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {open && (
              <div className="absolute right-0 top-full mt-1.5 w-52 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-50 py-1">
                {/* Identity header */}
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-semibold text-gray-800 truncate">{profile.full_name}</p>
                  <p className="text-xs text-gray-400 truncate">@{profile.username}</p>
                </div>

                <Link
                  href={`/profile/${profile.id}`}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <span className="w-4 text-center text-gray-400">
                    <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                      <path d="M10 8a3 3 0 100-6 3 3 0 000 6zM3.465 14.493a1.23 1.23 0 00.41 1.412A9.957 9.957 0 0010 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 00-13.074.003z" />
                    </svg>
                  </span>
                  {t.nav.myProfile}
                </Link>

                <Link
                  href="/profile/edit"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <span className="w-4 text-center text-gray-400">
                    <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                      <path fillRule="evenodd" d="M7.84 1.804A1 1 0 018.82 1h2.36a1 1 0 01.98.804l.331 1.652a6.993 6.993 0 011.929 1.115l1.598-.54a1 1 0 011.186.447l1.18 2.044a1 1 0 01-.205 1.251l-1.267 1.113a7.047 7.047 0 010 2.228l1.267 1.113a1 1 0 01.206 1.25l-1.18 2.045a1 1 0 01-1.187.447l-1.598-.54a6.993 6.993 0 01-1.929 1.115l-.33 1.652a1 1 0 01-.98.804H8.82a1 1 0 01-.98-.804l-.331-1.652a6.993 6.993 0 01-1.929-1.115l-1.598.54a1 1 0 01-1.186-.447l-1.18-2.044a1 1 0 01.205-1.251l1.267-1.114a7.05 7.05 0 010-2.227L1.821 7.773a1 1 0 01-.206-1.25l1.18-2.045a1 1 0 011.187-.447l1.598.54A6.992 6.992 0 017.51 3.456l.33-1.652zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                    </svg>
                  </span>
                  {t.nav.settings}
                </Link>

                {/* Language selector */}
                <div className="border-t border-gray-100 mt-1 pt-1 px-4 py-2">
                  <p className="text-xs text-gray-400 mb-1.5">{t.nav.language}</p>
                  <div className="flex gap-1">
                    {LANGUAGES.map(lang => (
                      <button
                        key={lang.locale}
                        onClick={() => setLocale(lang.locale)}
                        className={[
                          'flex-1 text-xs py-1 rounded-md border transition-colors',
                          locale === lang.locale
                            ? 'bg-blue-600 text-white border-blue-600 font-semibold'
                            : 'text-gray-600 border-gray-200 hover:bg-gray-50',
                        ].join(' ')}
                      >
                        {lang.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-1">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <span className="w-4 text-center text-red-400">
                      <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                        <path fillRule="evenodd" d="M3 4.25A2.25 2.25 0 015.25 2h5.5A2.25 2.25 0 0113 4.25v2a.75.75 0 01-1.5 0v-2a.75.75 0 00-.75-.75h-5.5a.75.75 0 00-.75.75v11.5c0 .414.336.75.75.75h5.5a.75.75 0 00.75-.75v-2a.75.75 0 011.5 0v2A2.25 2.25 0 0110.75 18h-5.5A2.25 2.25 0 013 15.75V4.25z" clipRule="evenodd" />
                        <path fillRule="evenodd" d="M19 10a.75.75 0 00-.75-.75H8.704l1.048-1.08a.75.75 0 10-1.004-1.114l-2.5 2.571a.75.75 0 000 1.046l2.5 2.572a.75.75 0 101.004-1.115l-1.048-1.08h9.546A.75.75 0 0019 10z" clipRule="evenodd" />
                      </svg>
                    </span>
                    {t.nav.signOut}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Hamburger — mobile only */}
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="sm:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileOpen ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

      </div>

      {/* ── Mobile menu ── */}
      {mobileOpen && (
        <div className="sm:hidden border-t border-gray-100 bg-white">
          <div className="max-w-4xl mx-auto px-2 py-2 flex flex-col">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={[
                  'flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive(href)
                    ? 'bg-blue-50 text-blue-600 font-semibold'
                    : 'text-gray-700 hover:bg-gray-50',
                ].join(' ')}
              >
                {label}
              </Link>
            ))}
            <div className="mt-2 pt-2 border-t border-gray-100">
              <Link
                href="/achievements"
                className="flex items-center px-3 py-2.5 rounded-lg text-sm font-semibold text-purple-600 hover:bg-purple-50 transition-colors"
              >
                {t.nav.addAchievement}
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
