import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getStudentClaims } from '@/actions/claims'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PaymentTracker } from '@/components/payment-tracker'
import { ClaimStatusBadge } from '@/components/status-badge'
import { BankDetailsCard } from '@/components/bank-details-card'
import { EmptyState } from '@/components/empty-state'
import { formatCurrency, formatDate } from '@/lib/utils'
import { AlertCircle, ArrowRight } from 'lucide-react'

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
        <h1 className="text-3xl md:text-4xl font-bold text-[#171717]">Payment Tracker</h1>
        <p className="text-base md:text-lg text-[#77716c] mt-2">
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
                {!claim.bank_details_snapshot && claim.status === 'winners_announced' && (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300">
                    <div className="flex items-center gap-2.5">
                      <AlertCircle className="h-5 w-5 flex-shrink-0 text-amber-400" />
                      <p className="text-sm font-medium">
                        Action required: Add your bank details to submit this claim to Treasury for verification.
                      </p>
                    </div>
                    <Button size="sm" asChild className="bg-amber-500 hover:bg-amber-400 text-[#171717] font-medium">
                      <Link href="/student/account">
                        Add Bank Details <ArrowRight className="h-3.5 w-3.5 ml-1" />
                      </Link>
                    </Button>
                  </div>
                )}
                <PaymentTracker status={claim.status} />
                {claim.bank_details_snapshot && (
                  <div>
                    <p className="text-sm font-semibold text-[#77716c] uppercase tracking-wider mb-3">
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
