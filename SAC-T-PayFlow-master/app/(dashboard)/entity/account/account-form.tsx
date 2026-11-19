'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Loader2, Building2, User, CreditCard, Landmark, MapPin, Smartphone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { updateEntityProfile, updateBankDetails } from '@/actions/user'
import type { BankDetails } from '@/types'

function FormField({
  label,
  icon: Icon,
  hint,
  children,
}: {
  label: string
  icon?: React.ComponentType<{ className?: string }>
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-2">
        {Icon && <Icon className="h-4 w-4 text-[#77716c] flex-shrink-0" />}
        <Label className="text-base font-semibold text-[#404040]">{label}</Label>
      </div>
      {children}
      {hint && <p className="text-sm text-[#918b85] pl-6">{hint}</p>}
    </div>
  )
}

export function EntityProfileForm({ initialName }: { initialName: string }) {
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState(initialName)

  async function handleSave() {
    setLoading(true)
    const result = await updateEntityProfile(name)
    setLoading(false)
    if (result?.error) toast.error(result.error)
    else toast.success('Profile updated')
  }

  return (
    <div className="rounded-2xl border border-[#e5e5e5] bg-white overflow-hidden">
      <div className="px-6 md:px-8 py-6 border-b border-[#e5e5e5]">
        <h3 className="text-xl font-bold text-[#171717]">Organisation Details</h3>
        <p className="text-base text-[#77716c] mt-1">Your entity/club name</p>
      </div>
      <div className="px-6 md:px-8 py-7 space-y-6">
        <FormField label="Organisation Name" icon={Building2}>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. E-Cell, Consulting Club"
          />
        </FormField>
      </div>
      <div className="px-6 md:px-8 py-5 border-t border-[#e5e5e5] bg-white/70">
        <Button onClick={handleSave} disabled={loading} className="w-full sm:w-auto">
          {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          Save Profile
        </Button>
      </div>
    </div>
  )
}

export function EntityBankDetailsForm({ initialBankDetails }: { initialBankDetails: BankDetails | null }) {
  const [loading, setLoading] = useState(false)
  const [bank, setBank] = useState<BankDetails>(
    initialBankDetails ?? {
      account_holder: '',
      account_number: '',
      ifsc_code: '',
      bank_name: '',
      branch: '',
      upi_id: '',
    }
  )

  async function handleSave() {
    if (!bank.account_number || !bank.ifsc_code || !bank.account_holder) {
      toast.error('Account holder, account number, and IFSC are required')
      return
    }
    setLoading(true)
    const result = await updateBankDetails(bank)
    setLoading(false)
    if (result?.error) toast.error(result.error)
    else toast.success('Bank details saved - encrypted and secured')
  }

  return (
    <div className="rounded-2xl border border-[#e5e5e5] bg-white overflow-hidden">
      <div className="px-6 md:px-8 py-6 border-b border-[#e5e5e5]">
        <h3 className="text-xl font-bold text-[#171717]">Bank Details</h3>
        <p className="text-base text-[#77716c] mt-1">
          Used for reimbursement payments - must match your bank records exactly
        </p>
        <div className="flex items-center gap-2 mt-3 px-3 py-2 rounded-lg bg-emerald-50 border border-emerald-200">
          <span className="text-base">🔒</span>
          <p className="text-sm text-emerald-600">End-to-end encrypted. Only visible to you and IPM SAC Treasury.</p>
        </div>
      </div>
      <div className="px-6 md:px-8 py-7 space-y-6">
        <FormField label="Account Holder Name" icon={User}>
          <Input
            value={bank.account_holder}
            onChange={(e) => setBank((b) => ({ ...b, account_holder: e.target.value }))}
            placeholder="As per bank records"
          />
        </FormField>

        <FormField label="Account Number" icon={CreditCard}>
          <Input
            value={bank.account_number}
            onChange={(e) => setBank((b) => ({ ...b, account_number: e.target.value }))}
            placeholder="Your account number"
            className="font-mono tracking-wider"
          />
        </FormField>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <FormField label="IFSC Code" icon={Landmark}>
            <Input
              value={bank.ifsc_code}
              onChange={(e) => setBank((b) => ({ ...b, ifsc_code: e.target.value.toUpperCase() }))}
              placeholder="SBIN0001234"
              className="font-mono uppercase tracking-widest"
            />
          </FormField>
          <FormField label="Bank Name" icon={Building2}>
            <Input
              value={bank.bank_name}
              onChange={(e) => setBank((b) => ({ ...b, bank_name: e.target.value }))}
              placeholder="State Bank of India"
            />
          </FormField>
        </div>

        <FormField label="Branch" icon={MapPin}>
          <Input
            value={bank.branch}
            onChange={(e) => setBank((b) => ({ ...b, branch: e.target.value }))}
            placeholder="Branch name"
          />
        </FormField>

        <FormField label="UPI ID" icon={Smartphone} hint="Optional - for faster payments">
          <Input
            value={bank.upi_id ?? ''}
            onChange={(e) => setBank((b) => ({ ...b, upi_id: e.target.value }))}
            placeholder="yourname@upi"
            className="font-mono"
          />
        </FormField>
      </div>
      <div className="px-6 md:px-8 py-5 border-t border-[#e5e5e5] bg-white/70">
        <Button onClick={handleSave} disabled={loading} className="w-full sm:w-auto">
          {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          Save Bank Details
        </Button>
      </div>
    </div>
  )
}
