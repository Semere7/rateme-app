'use client'

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type NavbarProps = {
  userId: string
}

export default function Navbar({ userId }: NavbarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const navLink = (href: string, label: string) => {
    const active = pathname === href || pathname.startsWith(href + '/')
    return (
      <Link
        href={href}
        className={`text-sm font-medium px-3 py-2 rounded-lg transition-colors ${
          active
            ? 'bg-blue-50 text-blue-600'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
        }`}
      >
        {label}
      </Link>
    )
  }

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/dashboard" className="text-xl font-bold text-blue-600">
          RateMe
        </Link>

        <div className="flex items-center gap-1">
          {navLink('/dashboard', 'Dashboard')}
          {navLink('/friends', 'Friends')}
          {navLink(`/profile/${userId}`, 'My Profile')}
          <button
            onClick={handleLogout}
            className="text-sm font-medium px-3 py-2 rounded-lg text-gray-600 hover:text-red-600 hover:bg-red-50 transition-colors ml-2"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  )
}
