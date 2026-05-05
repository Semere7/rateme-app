import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/Navbar'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, username, full_name, avatar_url')
    .eq('id', user.id)
    .single()

  // Fallback if profile row hasn't been created yet
  const navProfile = profile ?? {
    id: user.id,
    username: user.email?.split('@')[0] ?? 'me',
    full_name: user.email ?? 'User',
    avatar_url: null,
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar profile={navProfile} />
      <main className="max-w-4xl mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  )
}
