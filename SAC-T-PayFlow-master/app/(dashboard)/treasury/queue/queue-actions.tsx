'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Loader2, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { updateClaimStatus, markClaimPaid } from '@/actions/treasury'
import type { ClaimStatus } from '@/types'

const statusFlow: Partial<Record<ClaimStatus, { next: ClaimStatus; label: string }>> = {
  winners_announced: { next: 'treasury_verified', label: 'Verify' },
  treasury_verified: { next: 'bank_details_shared', label: 'Share Bank Details' },
  bank_details_shared: { next: 'payment_completed', label: 'Mark Paid' },
}

interface QueueActionsProps {
  claimId: string
  currentStatus: ClaimStatus
}

export function QueueActions({ claimId, currentStatus }: QueueActionsProps) {
  const [loading, setLoading] = useState(false)

  const action = statusFlow[currentStatus]

  if (!action) {
    if (currentStatus === 'payment_completed') {
      return <span className="text-xs text-emerald-400">Paid</span>
    }
    return null
  }

  async function handleAction() {
    setLoading(true)
    const result =
      action!.next === 'payment_completed'
        ? await markClaimPaid(claimId)
        : await updateClaimStatus(claimId, action!.next)
    setLoading(false)

    if (result?.error) {
      toast.error(result.error)
    } else {
      toast.success('Status updated')
    }
  }

  return (
    <Button
      size="sm"
      variant={action.next === 'payment_completed' ? 'default' : 'secondary'}
      onClick={handleAction}
      disabled={loading}
      className="whitespace-nowrap"
    >
      {loading ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : (
        <ChevronRight className="h-3 w-3" />
      )}
      {action.label}
    </Button>
  )
}
