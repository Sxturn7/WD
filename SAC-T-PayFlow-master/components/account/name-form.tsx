'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Loader2, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { updateDisplayName } from '@/actions/user'

interface NameFormProps {
  initialName: string
  revalidatePath: string
}

export function NameForm({ initialName, revalidatePath }: NameFormProps) {
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState(initialName)

  async function handleSave() {
    if (!name.trim()) {
      toast.error('Name cannot be empty')
      return
    }
    setLoading(true)
    const result = await updateDisplayName(name.trim(), revalidatePath)
    setLoading(false)
    if (result?.error) toast.error(result.error)
    else toast.success('Name updated successfully')
  }

  return (
    <div className="rounded-2xl border border-[#e5e5e5] bg-white overflow-hidden">
      <div className="px-6 md:px-8 py-6 border-b border-[#e5e5e5]">
        <h3 className="text-xl font-bold text-[#171717]">Display Name</h3>
        <p className="text-base text-[#77716c] mt-1">
          This name appears across the portal
        </p>
      </div>

      <div className="px-6 md:px-8 py-7">
        <div className="space-y-2.5">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-[#77716c]" />
            <Label className="text-base font-semibold text-[#404040]">Full Name / Organisation Name</Label>
          </div>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Entrepreneurship Cell"
          />
          <p className="text-sm text-[#918b85] pl-6">
            For clubs/bodies use the full official name
          </p>
        </div>
      </div>

      <div className="px-6 md:px-8 py-5 border-t border-[#e5e5e5] bg-white/70">
        <Button onClick={handleSave} disabled={loading} className="w-full sm:w-auto">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Save Name
        </Button>
      </div>
    </div>
  )
}
