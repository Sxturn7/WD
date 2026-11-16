import { getAllReimbursements } from '@/actions/treasury'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/empty-state'
import { formatCurrency, formatDate } from '@/lib/utils'
import { ReimbActions } from './reimb-actions'
import { ExternalLink, Building2, CreditCard, Landmark } from 'lucide-react'

export default async function TreasuryReimbursementsPage() {
  const reimbursements = await getAllReimbursements()

  const pending = reimbursements.filter((r) => r.status === 'pending').length
  const approved = reimbursements.filter((r) => r.status === 'approved').length
  const totalApproved = reimbursements
    .filter((r) => r.status === 'approved')
    .reduce((s, r) => s + Number(r.amount), 0)

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-zinc-100">Reimbursements</h1>
        <p className="text-base md:text-lg text-zinc-500 mt-2">
          Review and approve entity reimbursement requests
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-6">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <p className="text-sm text-zinc-500 font-medium">Pending</p>
          <p className="text-4xl font-bold text-zinc-100 mt-2">{pending}</p>
          <p className="text-sm text-amber-400 mt-1">awaiting review</p>
        </div>
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <p className="text-sm text-zinc-500 font-medium">Approved</p>
          <p className="text-4xl font-bold text-zinc-100 mt-2">{approved}</p>
          <p className="text-sm text-emerald-400 mt-1">this cycle</p>
        </div>
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <p className="text-sm text-zinc-500 font-medium">Total Approved</p>
          <p className="text-4xl font-bold text-zinc-100 mt-2">{formatCurrency(totalApproved)}</p>
          <p className="text-sm text-zinc-500 mt-1">disbursed</p>
        </div>
      </div>

      {/* Requests list */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">All Requests</CardTitle>
          <CardDescription className="text-base">{reimbursements.length} total</CardDescription>
        </CardHeader>
        <CardContent>
          {reimbursements.length === 0 ? (
            <EmptyState
              title="No reimbursement requests"
              description="Entity requests will appear here once submitted"
            />
          ) : (
            <div className="space-y-4">
              {reimbursements.map((r) => (
                <div
                  key={r.id}
                  className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden"
                >
                  {/* Header row */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 border-b border-zinc-800">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-3">
                        <p className="text-lg font-semibold text-zinc-100">
                          {r.entity?.full_name ?? 'Unknown Entity'}
                        </p>
                        <Badge
                          variant={
                            r.status === 'approved'
                              ? 'success'
                              : r.status === 'rejected'
                              ? 'danger'
                              : 'pending'
                          }
                        >
                          {r.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-zinc-500 mt-1">{r.entity?.email}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-2xl font-bold text-zinc-100">{formatCurrency(r.amount)}</p>
                      <p className="text-sm text-zinc-500 mt-0.5">{formatDate(r.created_at)}</p>
                    </div>
                  </div>

                  {/* Details row */}
                  <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left: event + proof */}
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs font-semibold text-zinc-600 uppercase tracking-wider mb-1">Event / Purpose</p>
                        <p className="text-base text-zinc-200">{r.event_name}</p>
                      </div>
                      {r.notes && (
                        <div>
                          <p className="text-xs font-semibold text-zinc-600 uppercase tracking-wider mb-1">Notes</p>
                          <p className="text-sm text-zinc-400">{r.notes}</p>
                        </div>
                      )}
                      <div className="flex items-center gap-3">
                        <a
                          href={r.proof_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-sm text-blue-400 hover:text-blue-300 underline-offset-2 hover:underline"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          View proof document
                        </a>
                      </div>
                    </div>

                    {/* Right: entity bank details */}
                    <div>
                      <p className="text-xs font-semibold text-zinc-600 uppercase tracking-wider mb-3">
                        Entity Bank Details (encrypted)
                      </p>
                      {r.entity?.bank_details ? (
                        <div className="rounded-lg bg-zinc-800/60 border border-zinc-700/50 p-4 space-y-2.5">
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-zinc-500 flex-shrink-0" />
                            <div>
                              <p className="text-xs text-zinc-600">Account Holder</p>
                              <p className="text-sm font-medium text-zinc-200">
                                {r.entity.bank_details.account_holder}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <CreditCard className="h-4 w-4 text-zinc-500 flex-shrink-0" />
                            <div>
                              <p className="text-xs text-zinc-600">Account Number</p>
                              <p className="text-sm font-mono font-medium text-zinc-200 tracking-wider">
                                {r.entity.bank_details.account_number}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Landmark className="h-4 w-4 text-zinc-500 flex-shrink-0" />
                            <div>
                              <p className="text-xs text-zinc-600">IFSC · Bank</p>
                              <p className="text-sm font-mono font-medium text-zinc-200 uppercase">
                                {r.entity.bank_details.ifsc_code}
                                {r.entity.bank_details.bank_name
                                  ? ` · ${r.entity.bank_details.bank_name}`
                                  : ''}
                              </p>
                            </div>
                          </div>
                          {r.entity.bank_details.upi_id && (
                            <div className="flex items-start gap-2">
                              <div className="h-4 w-4 flex-shrink-0" />
                              <div>
                                <p className="text-xs text-zinc-600">UPI ID</p>
                                <p className="text-sm font-mono text-zinc-300">
                                  {r.entity.bank_details.upi_id}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="rounded-lg bg-zinc-800/60 border border-zinc-700/50 p-4">
                          <p className="text-sm text-zinc-500">
                            Entity has not set up bank details yet
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions footer */}
                  <div className="px-5 py-4 border-t border-zinc-800 flex items-center justify-end">
                    <ReimbActions id={r.id} status={r.status} />
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
