'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Loader2, Trophy } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { submitPrizeClaim } from '@/actions/claims'
import { formatCurrency } from '@/lib/utils'
import type { BankDetails, Claim } from '@/types'

interface ClaimPrizeDialogProps {
  claim: Claim
  savedBankDetails?: BankDetails | null
  defaultAccountHolder?: string
  buttonText?: string
  triggerClassName?: string
}

export function ClaimPrizeDialog({
  claim,
  savedBankDetails,
  defaultAccountHolder,
  buttonText = 'Claim Prize',
  triggerClassName,
}: ClaimPrizeDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  // Use claim's existing snapshot first, or global saved bank details, or defaults
  const initialDetails = claim.bank_details_snapshot || savedBankDetails

  const [form, setForm] = useState<BankDetails>({
    account_holder: initialDetails?.account_holder || defaultAccountHolder || '',
    account_number: initialDetails?.account_number || '',
    ifsc_code: initialDetails?.ifsc_code || '',
    bank_name: initialDetails?.bank_name || '',
    branch: initialDetails?.branch || '',
    upi_id: initialDetails?.upi_id || '',
  })

  // Re-sync if dialog opens
  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      const currentDetails = claim.bank_details_snapshot || savedBankDetails
      setForm({
        account_holder: currentDetails?.account_holder || defaultAccountHolder || '',
        account_number: currentDetails?.account_number || '',
        ifsc_code: currentDetails?.ifsc_code || '',
        bank_name: currentDetails?.bank_name || '',
        branch: currentDetails?.branch || '',
        upi_id: currentDetails?.upi_id || '',
      })
    }
    setOpen(nextOpen)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!form.account_holder?.trim()) {
      toast.error('Account holder name is required')
      return
    }
    if (!form.account_number?.trim()) {
      toast.error('Account number is required')
      return
    }
    if (!form.ifsc_code?.trim()) {
      toast.error('IFSC code is required')
      return
    }
    if (!form.bank_name?.trim()) {
      toast.error('Bank name is required')
      return
    }
    if (!form.branch?.trim()) {
      toast.error('Branch is required')
      return
    }

    setLoading(true)
    const res = await submitPrizeClaim({
      claimId: claim.id,
      bankDetails: form,
    })
    setLoading(false)

    if (res?.error) {
      toast.error(res.error)
    } else {
      toast.success('Claim submitted successfully! Sent to Treasury for verification.')
      setOpen(false)
    }
  }

  return (
    <>
      <Button
        onClick={() => handleOpenChange(true)}
        className={triggerClassName ?? 'bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm px-4 py-2 rounded-xl transition-all active:scale-[0.98] shadow-sm flex items-center gap-1.5'}
        size="sm"
      >
        <Trophy className="h-3.5 w-3.5" />
        {buttonText}
      </Button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-md w-full bg-zinc-950 border border-zinc-800 text-zinc-100 p-6 rounded-2xl shadow-2xl">
          <DialogHeader className="space-y-1">
            <DialogTitle className="text-xl font-bold text-zinc-100">
              Submit Prize Claim
            </DialogTitle>
            <DialogDescription className="text-sm text-zinc-400">
              {claim.event?.name ?? 'Event'} - Verify your details before submitting
            </DialogDescription>
          </DialogHeader>

          {/* Your Prize Card */}
          <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-4 space-y-1 mt-1">
            <p className="text-xs uppercase font-medium text-zinc-400">Your Prize</p>
            <p className="text-base font-bold text-zinc-100">{claim.prize_position}</p>
            <p className="text-emerald-400 font-bold text-lg">
              {formatCurrency(claim.prize_amount)}
            </p>
          </div>

          {/* Bank Details Form */}
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div>
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">
                BANK DETAILS
              </p>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-zinc-300">
                Account Holder Name
              </Label>
              <Input
                value={form.account_holder}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, account_holder: e.target.value }))
                }
                placeholder="Name as per bank records"
                className="bg-zinc-900/90 border-zinc-700/80 focus:border-emerald-500 text-zinc-100 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-zinc-300">
                Account Number
              </Label>
              <Input
                value={form.account_number}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, account_number: e.target.value }))
                }
                placeholder="Bank account number"
                className="bg-zinc-900/90 border-zinc-700/80 focus:border-emerald-500 text-zinc-100 text-sm font-mono tracking-wider"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-zinc-300">
                  IFSC Code
                </Label>
                <Input
                  value={form.ifsc_code}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      ifsc_code: e.target.value.toUpperCase(),
                    }))
                  }
                  placeholder="e.g. SBIN0001234"
                  className="bg-zinc-900/90 border-zinc-700/80 focus:border-emerald-500 text-zinc-100 text-sm font-mono uppercase tracking-wider"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-zinc-300">
                  Bank Name
                </Label>
                <Input
                  value={form.bank_name}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, bank_name: e.target.value }))
                  }
                  placeholder="e.g. State Bank of India"
                  className="bg-zinc-900/90 border-zinc-700/80 focus:border-emerald-500 text-zinc-100 text-sm"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-zinc-300">Branch</Label>
              <Input
                value={form.branch}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, branch: e.target.value }))
                }
                placeholder="Branch name / City"
                className="bg-zinc-900/90 border-zinc-700/80 focus:border-emerald-500 text-zinc-100 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-zinc-300">
                UPI ID (optional)
              </Label>
              <Input
                value={form.upi_id ?? ''}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, upi_id: e.target.value }))
                }
                placeholder="e.g. 9340556826@ybl"
                className="bg-zinc-900/90 border-zinc-700/80 focus:border-emerald-500 text-zinc-100 text-sm font-mono"
              />
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setOpen(false)}
                className="border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-xl"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-xl px-5 transition-all active:scale-[0.98]"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin mr-1.5" />}
                Submit Claim
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
