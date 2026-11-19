import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getStudentClaims } from '@/actions/claims'
import { decryptJSON } from '@/lib/crypto'
import { Card, CardContent } from '@/components/ui/card'
import { ClaimStatusBadge } from '@/components/status-badge'
import { ClaimPrizeDialog } from '@/components/claim-prize-dialog'
import { EmptyState } from '@/components/empty-state'
import { PaymentTracker } from '@/components/payment-tracker'
import { formatCurrency, formatDate } from '@/lib/utils'
import { AlertCircle } from 'lucide-react'
import type { ClaimStatus, BankDetails } from '@/types'

export default async function ClaimsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/')

  const [{ data: profile }, { data: bankRecord }, claims] = await Promise.all([
    supabase.from('users').select('*').eq('id', user.id).single(),
    supabase.from('user_bank_details').select('bank_details').eq('user_id', user.id).maybeSingle(),
    getStudentClaims(),
  ])

  const savedBankDetails = bankRecord?.bank_details
    ? decryptJSON<BankDetails>(bankRecord.bank_details)
    : null

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-[#171717]">My Claims</h1>
        <p className="text-base md:text-lg text-[#77716c] mt-2">
          Claims generated from your winning events, with live payout status.
        </p>
      </div>

      {claims.length === 0 ? (
        <Card>
          <CardContent className="p-10">
            <EmptyState
              title="No claims yet"
              description="Claims show up here automatically after winners are announced."
            />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-5">
          {claims.map((claim) => (
            <div
              key={claim.id}
              className="rounded-2xl border border-[#e5e5e5] bg-white overflow-hidden"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-5 border-b border-[#e5e5e5]">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-xl font-bold text-[#171717]">
                      {claim.event?.name ?? 'Event'}
                    </h3>
                    <ClaimStatusBadge status={claim.status as ClaimStatus} />
                  </div>
                  <p className="text-base text-[#77716c] mt-1">
                    {claim.prize_position} · {formatCurrency(claim.prize_amount)} ·{' '}
                    {formatDate(claim.created_at)}
                  </p>
                </div>
                {claim.status === 'winners_announced' && (
                  <div className="flex items-center gap-2">
                    <ClaimPrizeDialog
                      claim={claim}
                      savedBankDetails={savedBankDetails}
                      defaultAccountHolder={profile?.full_name ?? ''}
                      buttonText={claim.bank_details_snapshot ? 'Edit Bank Details' : 'Claim Prize'}
                    />
                  </div>
                )}
              </div>

              <div className="px-6 py-6 space-y-4">
                {!claim.bank_details_snapshot && claim.status === 'winners_announced' && (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300">
                    <div className="flex items-center gap-2.5">
                      <AlertCircle className="h-5 w-5 flex-shrink-0 text-amber-400" />
                      <p className="text-sm font-medium">
                        Action required: Submit your bank details to send this claim to Treasury for verification.
                      </p>
                    </div>
                    <ClaimPrizeDialog
                      claim={claim}
                      savedBankDetails={savedBankDetails}
                      defaultAccountHolder={profile?.full_name ?? ''}
                      buttonText="Claim Prize Now"
                      triggerClassName="bg-amber-500 hover:bg-amber-400 text-[#171717] font-medium text-sm px-4 py-2 rounded-xl transition-all"
                    />
                  </div>
                )}

                <div>
                  <p className="text-sm font-semibold text-[#918b85] uppercase tracking-wider mb-4">
                    Payment Progress
                  </p>
                  <PaymentTracker status={claim.status as ClaimStatus} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
