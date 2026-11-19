'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, User, CreditCard, Landmark, Building2, MapPin, Smartphone } from 'lucide-react'
import { ClaimStatusBadge } from '@/components/status-badge'
import { formatCurrency } from '@/lib/utils'
import { QueueActions } from './queue-actions'
import { cn } from '@/lib/utils'
import type { ClaimStatus, BankDetails } from '@/types'

interface Claim {
  id: string
  prize_position: string
  prize_amount: number
  status: string
  bank_details_snapshot: BankDetails | null
  student: { full_name: string | null; email: string | null; roll_number: string | null } | null
  event: { name: string | null } | null
}

function BankField({
  icon: Icon,
  label,
  value,
  mono,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string | null | undefined
  mono?: boolean
}) {
  if (!value) return null
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-[#f1efec] flex items-center justify-center flex-shrink-0 mt-0.5">
        <Icon className="h-4 w-4 text-[#66615d]" />
      </div>
      <div>
        <p className="text-xs text-[#918b85] uppercase tracking-wider font-medium">{label}</p>
        <p className={cn('text-sm text-[#262626] mt-0.5 font-medium', mono && 'font-mono tracking-wider')}>
          {value}
        </p>
      </div>
    </div>
  )
}

export function ClaimRow({ claim }: { claim: Claim }) {
  const [expanded, setExpanded] = useState(false)
  const bank = claim.bank_details_snapshot

  return (
    <>
      <tr
        className="border-b border-[#e5e5e5] hover:bg-[#f7f5f2] transition-colors cursor-pointer select-none"
        onClick={() => setExpanded((v) => !v)}
      >
        {/* Student */}
        <td className="py-3 pr-4 pl-2">
          <p className="text-sm font-semibold text-[#171717] whitespace-nowrap">
            {claim.student?.full_name ?? claim.student?.email ?? '-'}
          </p>
          <p className="text-xs text-[#77716c] mt-0.5">{claim.student?.email}</p>
          {claim.student?.roll_number && (
            <p className="text-xs font-mono text-[#918b85] mt-0.5">{claim.student.roll_number}</p>
          )}
        </td>

        {/* Event */}
        <td className="py-3 pr-4 text-sm text-[#404040] whitespace-nowrap">
          {claim.event?.name ?? '-'}
        </td>

        {/* Position */}
        <td className="py-3 pr-4 text-sm text-[#66615d] whitespace-nowrap">
          {claim.prize_position}
        </td>

        {/* Amount */}
        <td className="py-3 pr-4 text-sm font-bold text-[#171717] whitespace-nowrap">
          {formatCurrency(claim.prize_amount)}
        </td>

        {/* Account No */}
        <td className="py-3 pr-4">
          {bank ? (
            <p className="text-xs font-mono text-[#404040]">{bank.account_number}</p>
          ) : (
            <p className="text-xs text-[#918b85]">-</p>
          )}
        </td>

        {/* IFSC */}
        <td className="py-3 pr-4">
          {bank ? (
            <p className="text-xs font-mono text-[#66615d] uppercase">{bank.ifsc_code}</p>
          ) : (
            <p className="text-xs text-[#918b85]">-</p>
          )}
        </td>

        {/* Status */}
        <td className="py-3 pr-4">
          <ClaimStatusBadge status={claim.status as ClaimStatus} />
        </td>

        {/* Actions + expand */}
        <td className="py-3 pl-0" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center gap-2">
            <QueueActions claimId={claim.id} currentStatus={claim.status as ClaimStatus} />
            <button
              className="p-1.5 rounded-lg text-[#77716c] hover:text-[#404040] hover:bg-[#f1efec] transition-colors"
              onClick={(e) => { e.stopPropagation(); setExpanded((v) => !v) }}
              aria-label={expanded ? 'Collapse' : 'Expand bank details'}
            >
              {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          </div>
        </td>
      </tr>

      {/* Expanded bank details row */}
      {expanded && (
        <tr className="border-b border-[#e5e5e5]">
          <td colSpan={8} className="px-4 py-5 bg-white/80">
            <p className="text-xs font-semibold text-[#918b85] uppercase tracking-widest mb-4">
              Full Bank Details
            </p>
            {bank ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                <BankField icon={User} label="Account Holder" value={bank.account_holder} />
                <BankField icon={CreditCard} label="Account Number" value={bank.account_number} mono />
                <BankField icon={Landmark} label="IFSC Code" value={bank.ifsc_code} mono />
                <BankField icon={Building2} label="Bank Name" value={bank.bank_name} />
                <BankField icon={MapPin} label="Branch" value={bank.branch} />
                {bank.upi_id && (
                  <BankField icon={Smartphone} label="UPI ID" value={bank.upi_id} mono />
                )}
              </div>
            ) : (
              <p className="text-sm text-[#77716c]">No bank details on file for this claim.</p>
            )}
          </td>
        </tr>
      )}
    </>
  )
}
