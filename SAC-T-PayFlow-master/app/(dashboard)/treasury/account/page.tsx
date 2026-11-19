import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getInitials } from '@/lib/utils'
import { NameForm } from '@/components/account/name-form'

export default async function TreasuryAccountPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/')

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-zinc-100">Account Settings</h1>
        <p className="text-base md:text-lg text-zinc-500 mt-2">
          Manage your treasury profile
        </p>
      </div>

      {/* Profile card */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 md:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 md:gap-7">
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-emerald-600/15 border-2 border-emerald-500/30 flex items-center justify-center flex-shrink-0">
            <span className="text-emerald-400 text-2xl md:text-3xl font-bold">
              {getInitials(profile?.full_name ?? profile?.email ?? 'T')}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl md:text-3xl font-bold text-zinc-100 leading-tight truncate">
              {profile?.full_name ?? 'No name set'}
            </h2>
            <p className="text-base text-zinc-400 mt-1 truncate">{profile?.email}</p>
            <div className="flex flex-wrap items-center gap-3 mt-3">
              <span className="inline-flex items-center gap-1.5 text-sm font-medium bg-emerald-600/10 border border-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full capitalize">
                {profile?.role}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Name form */}
      <div className="max-w-xl">
        <NameForm
          initialName={profile?.full_name ?? ''}
          revalidatePath="/treasury/account"
        />
      </div>
    </div>
  )
}
