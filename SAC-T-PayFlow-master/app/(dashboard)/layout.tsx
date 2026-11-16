import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { isIIMEmail } from '@/lib/utils'
import { Header } from '@/components/layout/header'
import { Sidebar } from '@/components/layout/sidebar'
import { MobileNav } from '@/components/layout/mobile-nav'
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
    <div className="flex flex-col h-screen overflow-hidden">
      <Header user={profile} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar role={profile.role as UserRole} />
        <main className="flex-1 overflow-y-auto bg-[#0d0d0f] p-5 md:p-10 pb-28 md:pb-10">
          {children}
        </main>
      </div>
      <MobileNav role={profile.role as UserRole} />
    </div>
  )
}
