import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getAllEventProposals } from '@/actions/treasury'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { EventStatusBadge } from '@/components/status-badge'
import { EmptyState } from '@/components/empty-state'
import { formatDate, formatCurrency } from '@/lib/utils'
import { ProposalActions } from './proposal-actions'

export default async function TreasuryProposalsPage({
  searchParams,
}: {
  searchParams?: Promise<{ status?: string }>
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/')

  const resolvedParams = searchParams ? await searchParams : {}
  const statusFilter = (resolvedParams.status as 'pending' | 'approved' | 'rejected') || undefined

  const proposals = await getAllEventProposals(statusFilter)

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl">
      <div>
        <h1 className="text-3xl font-bold text-[#171717]">Event Proposals</h1>
        <p className="text-base text-[#77716c] mt-2">
          Review and approve event prize distributions proposed by campus entities.
        </p>
      </div>

      <div className="space-y-4">
        {proposals.length === 0 ? (
          <Card>
            <CardContent className="p-10">
              <EmptyState
                title="No event proposals found"
                description="When entities submit events with prize tiers, they will show up here for verification and approval."
              />
            </CardContent>
          </Card>
        ) : (
          proposals.map((event) => (
            <Card key={event.id} className="border-[#e5e5e5] bg-white/70">
              <CardHeader className="pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <CardTitle className="text-xl text-[#171717]">{event.name}</CardTitle>
                      <span className="text-xs font-mono bg-[#f1efec] text-[#66615d] px-2.5 py-0.5 rounded">
                        {event.code}
                      </span>
                      <EventStatusBadge status={event.status} />
                    </div>
                    <CardDescription className="text-sm mt-1">
                      Proposed by <span className="text-[#404040] font-medium">{event.entity?.full_name ?? event.entity?.email ?? 'Entity'}</span> ({event.entity?.email}) · {formatDate(event.created_at)}
                    </CardDescription>
                  </div>

                  <ProposalActions eventId={event.id} currentStatus={event.status} />
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {event.description && (
                  <p className="text-sm text-[#66615d] bg-[#fcfbf9]/80 p-3 rounded-lg border border-[#e5e5e5]">
                    {event.description}
                  </p>
                )}

                <div>
                  <p className="text-xs uppercase font-semibold text-[#77716c] tracking-wider mb-2">
                    Prize Tiers ({event.prizes?.length ?? 0})
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {event.prizes && event.prizes.length > 0 ? (
                      event.prizes.map((prize: { position: string; amount: number }, idx: number) => (
                        <div
                          key={idx}
                          className="px-3 py-1.5 rounded-lg bg-[#f1efec] border border-[#d8d6d2]/60 text-xs font-medium text-[#262626]"
                        >
                          <span className="text-[#66615d] mr-1.5">{prize.position}:</span>
                          <span className="text-[#4338ca] font-semibold">{formatCurrency(prize.amount)}</span>
                        </div>
                      ))
                    ) : (
                      <span className="text-xs text-[#77716c]">No prizes listed</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
