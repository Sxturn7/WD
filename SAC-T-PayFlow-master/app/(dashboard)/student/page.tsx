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
import { ClaimStatusBadge } from '@/components/status-badge'
import { formatCurrency } from '@/lib/utils'
import { Trophy, TrendingUp, ChevronRight } from 'lucide-react'

export default async function StudentDashboard() {
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

  const claims = await getStudentClaims()

  const activeClaimsCount = claims.filter((c) => c.status !== 'payment_completed').length
  const paidCount = claims.filter((c) => c.status === 'payment_completed').length

  return (
    <div className="space-y-10 animate-fade-in">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-zinc-100">
          Welcome back, {profile?.full_name?.split(' ')[0] ?? 'Student'}
        </h1>
        <p className="text-base md:text-lg text-zinc-500 mt-2">
          Track prize payouts and review the bank details saved against each claim.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-8 flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/15 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <p className="text-4xl font-bold text-zinc-100">{activeClaimsCount}</p>
              <p className="text-base text-zinc-500 mt-1">Active Claims</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-8 flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/15 flex items-center justify-center flex-shrink-0">
              <Trophy className="h-6 w-6 text-amber-400" />
            </div>
            <div>
              <p className="text-4xl font-bold text-zinc-100">{paidCount}</p>
              <p className="text-base text-zinc-500 mt-1">Payments Received</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {claims.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">Recent Claims</CardTitle>
                <CardDescription className="text-base">
                  Claims appear here after winners are announced
                </CardDescription>
              </div>
              <Button variant="ghost" asChild className="text-base">
                <Link href="/student/tracker">
                  View all <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {claims.slice(0, 3).map((claim) => (
                <div
                  key={claim.id}
                  className="flex items-center justify-between p-5 rounded-xl border border-zinc-800/70 hover:bg-zinc-800/30 transition-colors"
                >
                  <div>
                    <p className="text-lg font-semibold text-zinc-200">
                      {claim.event?.name ?? 'Event'}
                    </p>
                    <p className="text-base text-zinc-500 mt-1">
                      {claim.prize_position} · {formatCurrency(claim.prize_amount)}
                    </p>
                  </div>
                  <ClaimStatusBadge status={claim.status} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
