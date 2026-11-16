import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getEntityEvents, getEntityEventWinners } from '@/actions/events'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { EmptyState } from '@/components/empty-state'
import { formatDate, formatCurrency } from '@/lib/utils'
import { ProposeEventForm } from './propose-event-form'
import { AnnounceWinnersForm } from './announce-winners-form'
import type { EventWinner } from '@/types'

export default async function ProposalsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/')

  const [events, winnersMap] = await Promise.all([getEntityEvents(), getEntityEventWinners()])

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-100">Events</h1>
        <p className="text-sm text-zinc-500 mt-1">
          Create events and announce winners - claims go directly to SAC Treasury
        </p>
      </div>

      <div className="grid grid-cols-5 gap-6">
        <div className="col-span-2">
          <ProposeEventForm />
        </div>

        <div className="col-span-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Your Events</CardTitle>
              <CardDescription>{events.length} total</CardDescription>
            </CardHeader>
            <CardContent>
              {events.length === 0 ? (
                <EmptyState
                  title="No events proposed"
                  description="Use the form to create your first event"
                />
              ) : (
                <div className="space-y-3">
                  {events.map((event) => (
                    <div
                      key={event.id}
                      className="p-4 rounded-lg border border-zinc-800 hover:bg-zinc-800/30 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-zinc-200">{event.name}</p>
                            <span className="text-xs bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded font-mono">
                              {event.code}
                            </span>
                          </div>
                          <p className="text-xs text-zinc-500 mt-0.5">
                            {formatDate(event.created_at)} · {event.winners_count} winners
                          </p>
                        </div>
                      </div>
                      {event.prizes && event.prizes.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {event.prizes.map((prize: { position: string; amount: number }) => (
                            <span
                              key={prize.position}
                              className="text-xs bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded"
                            >
                              {prize.position}: {formatCurrency(prize.amount)}
                            </span>
                          ))}
                        </div>
                      )}
                      <AnnounceWinnersForm
                        event={event}
                        existingWinners={(winnersMap[event.id] ?? []) as EventWinner[]}
                      />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
