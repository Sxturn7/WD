'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { approveReimbursement, rejectReimbursement } from '@/actions/treasury'

export function ReimbActions({ id, status }: { id: string; status: string }) {
  const [loading, setLoading] = useState<'approve' | 'reject' | null>(null)

  if (status !== 'pending') return null

  async function handleApprove() {
    setLoading('approve')
    const result = await approveReimbursement(id)
    setLoading(null)
    if (result?.error) toast.error(result.error)
    else toast.success('Reimbursement approved')
  }

  async function handleReject() {
    setLoading('reject')
    const result = await rejectReimbursement(id)
    setLoading(null)
    if (result?.error) toast.error(result.error)
    else toast.success('Reimbursement rejected')
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        size="sm"
        onClick={handleApprove}
        disabled={loading !== null}
        className="bg-emerald-600 hover:bg-emerald-700 text-white h-8 px-3 text-xs"
      >
        {loading === 'approve' ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <><CheckCircle2 className="h-3 w-3 mr-1" />Approve</>
        )}
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={handleReject}
        disabled={loading !== null}
        className="border-red-800 text-red-400 hover:bg-red-900/20 h-8 px-3 text-xs"
      >
        {loading === 'reject' ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <><XCircle className="h-3 w-3 mr-1" />Reject</>
        )}
      </Button>
    </div>
  )
}
