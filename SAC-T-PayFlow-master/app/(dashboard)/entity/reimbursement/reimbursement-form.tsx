'use client'

import { useState, useRef } from 'react'
import { toast } from 'sonner'
import { Loader2, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { submitReimbursement } from '@/actions/reimbursements'

export function ReimbursementForm() {
  const [loading, setLoading] = useState(false)
  const [eventName, setEventName] = useState('')
  const [amount, setAmount] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!file) {
      toast.error('Please attach proof of expense')
      return
    }
    if (!eventName || !amount) {
      toast.error('Please fill all fields')
      return
    }

    const formData = new FormData()
    formData.append('proof', file)

    setLoading(true)
    const result = await submitReimbursement(
      eventName,
      parseFloat(amount),
      formData
    )
    setLoading(false)

    if (result?.error) {
      toast.error(result.error)
    } else {
      toast.success('Reimbursement request submitted')
      setEventName('')
      setAmount('')
      setFile(null)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>New Request</CardTitle>
        <CardDescription>Submit expense for reimbursement</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>Event Name</Label>
            <Input
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              placeholder="Event this expense is for"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label>Amount (₹)</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">₹</span>
              <Input
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                type="number"
                className="pl-7"
                min="0"
                required
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Proof of Expense</Label>
            <div
              className="border-2 border-dashed border-zinc-700 rounded-lg p-4 text-center cursor-pointer hover:border-zinc-600 transition-colors"
              onClick={() => fileRef.current?.click()}
            >
              {file ? (
                <div>
                  <p className="text-sm text-zinc-300">{file.name}</p>
                  <p className="text-xs text-zinc-500 mt-1">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              ) : (
                <div>
                  <Upload className="h-8 w-8 text-zinc-600 mx-auto mb-2" />
                  <p className="text-sm text-zinc-400">
                    Click to upload receipt/invoice
                  </p>
                  <p className="text-xs text-zinc-600 mt-1">
                    PDF, PNG, JPG up to 10MB
                  </p>
                </div>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Submit Request
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
