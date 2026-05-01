import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ProfileEditForm from './ProfileEditForm'

export default async function EditProfilePage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/dashboard')

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Edit Profile</h1>
      <div className="card p-6">
        <ProfileEditForm profile={profile} />
      </div>
    </div>
  )
}
