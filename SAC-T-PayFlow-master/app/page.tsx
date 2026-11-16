import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { isIIMEmail } from '@/lib/utils'
import { LoginForm } from '@/components/login-form'

export default async function RootPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return <LoginForm />

  // Domain check - sign out and show login if invalid
  if (!isIIMEmail(user.email ?? '')) {
    await supabase.auth.signOut()
    return <LoginForm error="Only @iimidr.ac.in emails are allowed." />
  }

  // Try to get existing profile
  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role) {
    redirect(`/${profile.role}`)
  }

  // Profile missing - try to create it
  const { data: created, error: upsertError } = await supabase
    .from('users')
    .upsert(
      {
        id: user.id,
        email: user.email!,
        full_name: user.user_metadata?.full_name ?? null,
        role: 'student',
      },
      { onConflict: 'id' }
    )
    .select('role')
    .single()

  // If upsert failed (table missing / RLS / constraint) - sign out, show login
  if (upsertError || !created) {
    await supabase.auth.signOut()
    return (
      <LoginForm error="Account setup failed. Make sure the database schema has been applied, then try again." />
    )
  }

  redirect(`/${created.role}`)
}
