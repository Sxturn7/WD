import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { decryptJSON } from '@/lib/crypto'
import { getInitials } from '@/lib/utils'
import { EntityProfileForm, EntityBankDetailsForm } from './account-form'
import type { BankDetails } from '@/types'

export default async function EntityAccountPage() {
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

  const bankDetails = profile?.bank_details
    ? decryptJSON<BankDetails>(profile.bank_details)
    : null

  return (
    <div className="space-y-8 animate-fade-in">

      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-zinc-100">Account Settings</h1>
        <p className="text-base md:text-lg text-zinc-500 mt-2">
          Manage your organisation profile and bank details
        </p>
      </div>

      {/* Profile card */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 md:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 md:gap-7">
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-blue-600/15 border-2 border-blue-500/30 flex items-center justify-center flex-shrink-0">
            <span className="text-blue-400 text-2xl md:text-3xl font-bold">
              {getInitials(profile?.full_name ?? profile?.email ?? 'E')}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl md:text-3xl font-bold text-zinc-100 leading-tight truncate">
              {profile?.full_name ?? 'No name set'}
            </h2>
            <p className="text-base text-zinc-400 mt-1 truncate">{profile?.email}</p>
            <div className="flex flex-wrap items-center gap-3 mt-3">
              <span className="inline-flex items-center gap-1.5 text-sm font-medium bg-blue-600/10 border border-blue-500/20 text-blue-400 px-3 py-1 rounded-full capitalize">
                {profile?.role}
              </span>
              <span className="inline-flex items-center text-sm font-medium bg-zinc-800 border border-zinc-700 text-zinc-400 px-3 py-1 rounded-full">
                {bankDetails ? '🔒 Bank details saved' : 'No bank details yet'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Forms */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <EntityProfileForm initialName={profile?.full_name ?? ''} />
        <EntityBankDetailsForm initialBankDetails={bankDetails} />
      </div>
    </div>
  )
}
