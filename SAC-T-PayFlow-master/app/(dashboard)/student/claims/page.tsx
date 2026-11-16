import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getStudentClaims } from '@/actions/claims'
import { Card, CardContent } from '@/components/ui/card'
import { ClaimStatusBadge } from '@/components/status-badge'
import { EmptyState } from '@/components/empty-state'
import { PaymentTracker } from '@/components/payment-tracker'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { ClaimStatus } from '@/types'

export default async function ClaimsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/')

  const claims = await getStudentClaims()

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-zinc-100">My Claims</h1>
        <p className="text-base md:text-lg text-zinc-500 mt-2">
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
              className="rounded-2xl border border-zinc-800 bg-zinc-900 overflow-hidden"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-5 border-b border-zinc-800">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-xl font-bold text-zinc-100">
                      {claim.event?.name ?? 'Event'}
                    </h3>
                    <ClaimStatusBadge status={claim.status as ClaimStatus} />
                  </div>
                  <p className="text-base text-zinc-500 mt-1">
                    {claim.prize_position} · {formatCurrency(claim.prize_amount)} ·{' '}
                    {formatDate(claim.created_at)}
                  </p>
                </div>
              </div>

              <div className="px-6 py-6">
                <p className="text-sm font-semibold text-zinc-600 uppercase tracking-wider mb-4">
                  Payment Progress
                </p>
                <PaymentTracker status={claim.status as ClaimStatus} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
