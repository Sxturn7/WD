import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getEntityEvents } from '@/actions/events'
import { getEntityReimbursements } from '@/actions/reimbursements'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/empty-state'
import { formatDate } from '@/lib/utils'
import { CalendarPlus, Receipt, ChevronRight } from 'lucide-react'

export default async function EntityDashboard() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/')

  const [events, reimbursements] = await Promise.all([
    getEntityEvents(),
    getEntityReimbursements(),
  ])

  const totalEvents = events.length
  const pendingReimbursements = reimbursements.filter((r) => r.status === 'pending').length

  return (
    <div className="space-y-10 animate-fade-in">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-zinc-100">Entity Dashboard</h1>
        <p className="text-base md:text-lg text-zinc-500 mt-2">
          Create events, announce winners, and submit reimbursements.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-8 flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/15 flex items-center justify-center flex-shrink-0">
              <CalendarPlus className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <p className="text-4xl font-bold text-zinc-100">{totalEvents}</p>
              <p className="text-base text-zinc-500 mt-1">Total Events</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-8 flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/15 flex items-center justify-center flex-shrink-0">
              <Receipt className="h-6 w-6 text-emerald-400" />
            </div>
            <div>
              <p className="text-4xl font-bold text-zinc-100">{pendingReimbursements}</p>
              <p className="text-base text-zinc-500 mt-1">Pending Reimbursements</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Link href="/entity/proposals">
          <Card className="hover:bg-zinc-800/50 transition-colors cursor-pointer border-dashed border-zinc-700">
            <CardContent className="p-7 flex items-center gap-5">
              <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center flex-shrink-0">
                <CalendarPlus className="h-6 w-6 text-zinc-300" />
              </div>
              <div>
                <p className="text-base font-semibold text-zinc-200">Events</p>
                <p className="text-sm text-zinc-500 mt-0.5">Create events and announce winners</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/entity/reimbursement">
          <Card className="hover:bg-zinc-800/50 transition-colors cursor-pointer border-dashed border-zinc-700">
            <CardContent className="p-7 flex items-center gap-5">
              <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center flex-shrink-0">
                <Receipt className="h-6 w-6 text-zinc-300" />
              </div>
              <div>
                <p className="text-base font-semibold text-zinc-200">Reimbursement</p>
                <p className="text-sm text-zinc-500 mt-0.5">Upload proof</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">Your Events</CardTitle>
              <CardDescription className="text-base">Your recent events</CardDescription>
            </div>
            <Button variant="ghost" asChild className="text-base">
              <Link href="/entity/proposals">
                View all <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <EmptyState
              title="No events yet"
              description="Create your first event to get started"
            />
          ) : (
            <div className="space-y-3">
              {events.slice(0, 5).map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between p-5 rounded-xl border border-zinc-800/70 hover:bg-zinc-800/30 transition-colors"
                >
                  <div>
                    <div className="flex items-center gap-2.5">
                      <p className="text-lg font-semibold text-zinc-200">{event.name}</p>
                      <span className="text-xs bg-zinc-800 text-zinc-400 px-2.5 py-1 rounded-md font-mono">
                        {event.code}
                      </span>
                    </div>
                    <p className="text-base text-zinc-500 mt-1">
                      {event.winners_count} winners · {formatDate(event.created_at)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
