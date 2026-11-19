import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getEntityReimbursements } from '@/actions/reimbursements'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/empty-state'
import { formatCurrency, formatDate } from '@/lib/utils'
import { ReimbursementForm } from './reimbursement-form'

export default async function ReimbursementPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/')

  const reimbursements = await getEntityReimbursements()

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl">
      <div>
        <h1 className="text-2xl font-semibold text-[#171717]">Reimbursement</h1>
        <p className="text-sm text-[#77716c] mt-1">
          Submit expense reimbursement requests with proof
        </p>
      </div>

      <div className="grid grid-cols-5 gap-6">
        <div className="col-span-2">
          <ReimbursementForm />
        </div>

        <div className="col-span-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Submitted Requests</CardTitle>
              <CardDescription>{reimbursements.length} total</CardDescription>
            </CardHeader>
            <CardContent>
              {reimbursements.length === 0 ? (
                <EmptyState
                  title="No requests yet"
                  description="Your reimbursement requests will appear here"
                />
              ) : (
                <div className="space-y-2">
                  {reimbursements.map((r) => (
                    <div
                      key={r.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-[#e5e5e5] hover:bg-[#f7f5f2] transition-colors"
                    >
                      <div>
                        <p className="text-sm font-medium text-[#262626]">
                          {r.event_name}
                        </p>
                        <p className="text-xs text-[#77716c] mt-0.5">
                          {formatCurrency(r.amount)} · {formatDate(r.created_at)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <a
                          href={r.proof_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-400 hover:underline"
                        >
                          View proof
                        </a>
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
