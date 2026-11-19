import { Badge } from '@/components/ui/badge'
import type { ClaimStatus, EventStatus } from '@/types'

const claimStatusMap: Record<
  ClaimStatus,
  { label: string; variant: 'pending' | 'info' | 'warning' | 'success' | 'danger' }
> = {
  winners_announced: { label: 'Winners Announced', variant: 'pending' },
  treasury_verified: { label: 'Treasury Verified', variant: 'warning' },
  bank_details_shared: { label: 'Claim Submitted', variant: 'info' },
  payment_completed: { label: 'Claimed', variant: 'success' },
}

const eventStatusMap: Record<
  EventStatus,
  { label: string; variant: 'pending' | 'success' | 'danger' }
> = {
  pending: { label: 'Pending', variant: 'pending' },
  approved: { label: 'Approved', variant: 'success' },
  rejected: { label: 'Rejected', variant: 'danger' },
}

export function ClaimStatusBadge({ status }: { status: ClaimStatus }) {
  const { label, variant } = claimStatusMap[status]
  return <Badge variant={variant}>{label}</Badge>
}

export function EventStatusBadge({ status }: { status: EventStatus }) {
  const { label, variant } = eventStatusMap[status]
  return <Badge variant={variant}>{label}</Badge>
}
