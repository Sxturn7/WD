import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getStudentClaims } from '@/actions/claims'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { PaymentTracker } from '@/components/payment-tracker'
import { ClaimStatusBadge } from '@/components/status-badge'
import { BankDetailsCard } from '@/components/bank-details-card'
import { EmptyState } from '@/components/empty-state'
import { formatCurrency, formatDate } from '@/lib/utils'

export default async function TrackerPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/')

  const claims = await getStudentClaims()

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-zinc-100">Payment Tracker</h1>
        <p className="text-base md:text-lg text-zinc-500 mt-2">
          Follow each claim from winner announcement to final payout.
        </p>
      </div>

      {claims.length === 0 ? (
        <Card>
          <CardContent className="p-0">
            <EmptyState
              title="No claims yet"
              description="Claims appear here automatically after you are announced as a winner."
            />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {claims.map((claim) => (
            <Card key={claim.id}>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle className="text-xl">{claim.event?.name ?? 'Event'}</CardTitle>
                    <CardDescription className="text-base mt-1">
                      {claim.prize_position} · {formatCurrency(claim.prize_amount)} ·{' '}
                      {formatDate(claim.created_at)}
                    </CardDescription>
                  </div>
                  <ClaimStatusBadge status={claim.status} />
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <PaymentTracker status={claim.status} />
                {claim.bank_details_snapshot && (
                  <div>
                    <p className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-3">
                      Bank Details on Record
                    </p>
                    <BankDetailsCard details={claim.bank_details_snapshot} />
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
