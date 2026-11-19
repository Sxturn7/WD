'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Loader2, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { approveEventProposal, rejectEventProposal } from '@/actions/treasury'

interface ProposalActionsProps {
  eventId: string
  currentStatus: 'pending' | 'approved' | 'rejected'
}

export function ProposalActions({ eventId, currentStatus }: ProposalActionsProps) {
  const [loading, setLoading] = useState(false)

  if (currentStatus !== 'pending') {
    return null
  }

  async function handleApprove() {
    setLoading(true)
    const result = await approveEventProposal(eventId)
    setLoading(false)

    if (result?.error) {
      toast.error(result.error)
    } else {
      toast.success('Event proposal approved! Entity can now announce winners.')
    }
  }

  async function handleReject() {
    setLoading(true)
    const result = await rejectEventProposal(eventId)
    setLoading(false)

    if (result?.error) {
      toast.error(result.error)
    } else {
      toast.success('Event proposal rejected.')
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        size="sm"
        className="bg-emerald-600 hover:bg-emerald-500 text-white"
        onClick={handleApprove}
        disabled={loading}
      >
        {loading ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Check className="h-3 w-3 mr-1" />}
        Approve
      </Button>
      <Button
        size="sm"
        variant="ghost"
        className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
        onClick={handleReject}
        disabled={loading}
      >
        {loading ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <X className="h-3 w-3 mr-1" />}
        Reject
      </Button>
    </div>
  )
}
