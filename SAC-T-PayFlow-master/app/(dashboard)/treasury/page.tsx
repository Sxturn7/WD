import Link from 'next/link'
import { getAllClaims, getAllReimbursements } from '@/actions/treasury'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CreditCard, Clock, CheckCircle2, ChevronRight, Receipt } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

export default async function TreasuryDashboard() {
  const [claims, reimbursements] = await Promise.all([
    getAllClaims(),
    getAllReimbursements(),
  ])

  const pendingClaims = claims.filter((c) => c.status === 'winners_announced')
  const processingClaims = claims.filter((c) =>
    ['treasury_verified', 'bank_details_shared'].includes(c.status)
  )
  const completedClaims = claims.filter((c) => c.status === 'payment_completed')
  const pendingReimbursements = reimbursements.filter((r) => r.status === 'pending')

  const totalPaid = completedClaims.reduce(
    (sum, c) => sum + (c.prize_amount ?? 0),
    0
  )
  const totalPending = pendingClaims.reduce(
    (sum, c) => sum + (c.prize_amount ?? 0),
    0
  )

  return (
    <div className="space-y-10 animate-fade-in">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-zinc-100">Treasury Dashboard</h1>
        <p className="text-base md:text-lg text-zinc-500 mt-2">
          Payment queue overview and controls.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-7">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/15 flex items-center justify-center">
                <Clock className="h-5 w-5 text-amber-400" />
              </div>
              <span className="text-base text-zinc-500 font-medium">Pending</span>
            </div>
            <p className="text-4xl font-bold text-zinc-100">{pendingClaims.length}</p>
            <p className="text-base text-zinc-500 mt-1.5">{formatCurrency(totalPending)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-7">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/15 flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-blue-400" />
              </div>
              <span className="text-base text-zinc-500 font-medium">Processing</span>
            </div>
            <p className="text-4xl font-bold text-zinc-100">{processingClaims.length}</p>
            <p className="text-base text-zinc-500 mt-1.5">in progress</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-7">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/15 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              </div>
              <span className="text-base text-zinc-500 font-medium">Paid Out</span>
            </div>
            <p className="text-4xl font-bold text-zinc-100">{completedClaims.length}</p>
            <p className="text-base text-zinc-500 mt-1.5">{formatCurrency(totalPaid)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-7">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/15 flex items-center justify-center">
                <Receipt className="h-5 w-5 text-orange-400" />
              </div>
              <span className="text-base text-zinc-500 font-medium">Reimbursements</span>
            </div>
            <p className="text-4xl font-bold text-zinc-100">{pendingReimbursements.length}</p>
            <p className="text-base text-zinc-500 mt-1.5">pending review</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="hover:bg-zinc-800/40 transition-colors cursor-pointer">
          <CardContent className="p-7 flex items-center justify-between">
            <div className="flex items-center gap-5">
              <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center flex-shrink-0">
                <CreditCard className="h-6 w-6 text-zinc-300" />
              </div>
              <div>
                <p className="text-lg font-semibold text-zinc-200">Payment Queue</p>
                <p className="text-base text-zinc-500">
                  {pendingClaims.length + processingClaims.length} active claims
                </p>
              </div>
            </div>
            <Button variant="ghost" asChild className="text-base text-zinc-400 hover:text-zinc-200">
              <Link href="/treasury/queue">
                Open <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </CardContent>
        </Card>
        <Card className="hover:bg-zinc-800/40 transition-colors cursor-pointer">
          <CardContent className="p-7 flex items-center justify-between">
            <div className="flex items-center gap-5">
              <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center flex-shrink-0">
                <Receipt className="h-6 w-6 text-zinc-300" />
              </div>
              <div>
                <p className="text-lg font-semibold text-zinc-200">Reimbursements</p>
                <p className="text-base text-zinc-500">
                  {pendingReimbursements.length} pending review
                </p>
              </div>
            </div>
            <Button variant="ghost" asChild className="text-base text-zinc-400 hover:text-zinc-200">
              <Link href="/treasury/reimbursements">
                Open <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
