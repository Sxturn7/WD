'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { BankDetails } from '@/types'

interface BankDetailsCardProps {
  details: BankDetails
}

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-6 w-6"
      onClick={handleCopy}
    >
      {copied ? (
        <Check className="h-3 w-3 text-[#4338ca]" />
      ) : (
        <Copy className="h-3 w-3 text-[#77716c]" />
      )}
    </Button>
  )
}

function DetailRow({
  label,
  value,
  copyable,
}: {
  label: string
  value: string
  copyable?: boolean
}) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-[#e5e5e5] last:border-0">
      <span className="text-xs text-[#77716c] w-32 flex-shrink-0">{label}</span>
      <div className="flex items-center gap-1 flex-1 justify-end">
        <span className="text-sm text-[#262626] font-mono">{value}</span>
        {copyable && <CopyButton value={value} />}
      </div>
    </div>
  )
}

export function BankDetailsCard({ details }: BankDetailsCardProps) {
  return (
    <div className="rounded-lg border border-[#e5e5e5] bg-white/70 p-4 space-y-0.5">
      <DetailRow label="Account Holder" value={details.account_holder} />
      <DetailRow
        label="Account Number"
        value={details.account_number}
        copyable
      />
      <DetailRow label="IFSC Code" value={details.ifsc_code} copyable />
      <DetailRow label="Bank" value={details.bank_name} />
      <DetailRow label="Branch" value={details.branch} />
      {details.upi_id && (
        <DetailRow label="UPI ID" value={details.upi_id} copyable />
      )}
    </div>
  )
}
