import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { isIIMEmail } from '@/lib/utils'
import { DashboardFrame } from '@/components/layout/dashboard-frame'
import type { UserRole } from '@/types'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/')

  if (!isIIMEmail(user.email ?? '')) {
    await supabase.auth.signOut()
    redirect('/')
  }

  let { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) {
    const { data: created } = await supabase
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
      .select('*')
      .single()

    // Upsert failed - sign out and go to login (breaks the loop)
    if (!created) {
      await supabase.auth.signOut()
      redirect('/')
    }

    profile = created
  }

  return (
    <DashboardFrame user={profile} role={profile.role as UserRole}>
      {children}
    </DashboardFrame>
  )
}
