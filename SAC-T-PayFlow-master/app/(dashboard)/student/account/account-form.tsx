'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Loader2, User, Hash, Building2, CreditCard, Landmark, MapPin, Smartphone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { updateBankDetails, updateProfile } from '@/actions/user'
import type { BankDetails } from '@/types'

interface AccountFormProps {
  initialName: string
  initialRollNumber: string
  initialBankDetails: BankDetails | null
}

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
        {Icon && <Icon className="h-4 w-4 text-zinc-500 flex-shrink-0" />}
        <Label className="text-base font-semibold text-zinc-300">{label}</Label>
      </div>
      {children}
      {hint && <p className="text-sm text-zinc-600 pl-6">{hint}</p>}
    </div>
  )
}

export function PersonalDetailsForm({
  initialName,
  initialRollNumber,
}: Pick<AccountFormProps, 'initialName' | 'initialRollNumber'>) {
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState(initialName)
  const [rollNumber, setRollNumber] = useState(initialRollNumber)

  async function handleSave() {
    setLoading(true)
    const result = await updateProfile(name, rollNumber)
    setLoading(false)
    if (result?.error) toast.error(result.error)
    else toast.success('Profile updated successfully')
  }

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 overflow-hidden">
      {/* Card header */}
      <div className="px-6 md:px-8 py-6 border-b border-zinc-800">
        <h3 className="text-xl font-bold text-zinc-100">Personal Details</h3>
        <p className="text-base text-zinc-500 mt-1">Update your name and roll number</p>
      </div>

      {/* Fields */}
      <div className="px-6 md:px-8 py-7 space-y-6">
        <FormField label="Full Name" icon={User}>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your full name"
          />
        </FormField>

        <FormField
          label="Roll Number"
          icon={Hash}
          hint="Format: YYYYIPMnnn - e.g. 2025IPM128"
        >
          <Input
            value={rollNumber}
            onChange={(e) => setRollNumber(e.target.value)}
            placeholder="e.g. 2025IPM128"
            className="font-mono tracking-wider"
          />
        </FormField>
      </div>

      {/* Footer */}
      <div className="px-6 md:px-8 py-5 border-t border-zinc-800 bg-zinc-900/50">
        <Button
          onClick={handleSave}
          disabled={loading}
          className="w-full sm:w-auto"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Save Profile
        </Button>
      </div>
    </div>
  )
}

export function BankDetailsForm({
  initialBankDetails,
}: Pick<AccountFormProps, 'initialBankDetails'>) {
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
    else toast.success('Bank details saved successfully')
  }

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 overflow-hidden">
      {/* Card header */}
      <div className="px-6 md:px-8 py-6 border-b border-zinc-800">
        <h3 className="text-xl font-bold text-zinc-100">Bank Details</h3>
        <p className="text-base text-zinc-500 mt-1">
          Must match your bank records exactly - pre-filled on prize claims
        </p>
        <div className="flex items-center gap-2 mt-3 px-3 py-2 rounded-lg bg-emerald-950/40 border border-emerald-900/40">
          <span className="text-base">🔒</span>
          <p className="text-sm text-emerald-600">End-to-end encrypted. Only visible to you and IPM SAC Treasury.</p>
        </div>
      </div>

      {/* Fields */}
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
            placeholder="e.g. IIM Indore Branch"
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

      {/* Footer */}
      <div className="px-6 md:px-8 py-5 border-t border-zinc-800 bg-zinc-900/50">
        <Button
          onClick={handleSave}
          disabled={loading}
          className="w-full sm:w-auto"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Save Bank Details
        </Button>
      </div>
    </div>
  )
}

// Legacy export
export function AccountForm({ initialName, initialRollNumber, initialBankDetails }: AccountFormProps) {
  return (
    <>
      <PersonalDetailsForm initialName={initialName} initialRollNumber={initialRollNumber} />
      <BankDetailsForm initialBankDetails={initialBankDetails} />
    </>
  )
}
