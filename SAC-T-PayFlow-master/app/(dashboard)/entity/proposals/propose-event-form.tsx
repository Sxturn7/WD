'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Loader2, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { proposeEvent } from '@/actions/events'

interface PrizeTier {
  position: string
  amount: string
}

export function ProposeEventForm() {
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [prizes, setPrizes] = useState<PrizeTier[]>([
    { position: '1st Place', amount: '' },
    { position: '2nd Place', amount: '' },
  ])

  function addPrize() {
    setPrizes((p) => [...p, { position: '', amount: '' }])
  }

  function removePrize(index: number) {
    setPrizes((p) => p.filter((_, i) => i !== index))
  }

  function updatePrize(index: number, field: keyof PrizeTier, value: string) {
    setPrizes((p) =>
      p.map((prize, i) => (i === index ? { ...prize, [field]: value } : prize))
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) {
      toast.error('Event name is required')
      return
    }

    const parsedPrizes = prizes
      .filter((p) => p.position && p.amount)
      .map((p) => ({
        position: p.position,
        amount: parseFloat(p.amount),
      }))

    if (parsedPrizes.length === 0) {
      toast.error('Add at least one prize')
      return
    }

    setLoading(true)
    const result = await proposeEvent(name, description, parsedPrizes.length, parsedPrizes)
    setLoading(false)

    if (result?.error) {
      toast.error(result.error)
    } else {
      toast.success(`Event proposal submitted to SAC Treasury! Code: ${result.code}`)
      setName('')
      setDescription('')
      setPrizes([
        { position: '1st Place', amount: '' },
        { position: '2nd Place', amount: '' },
      ])
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Propose Event</CardTitle>
        <CardDescription>Submit an event proposal to SAC Treasury for approval</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>Event Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Fresher's Quiz 2025"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label>Description (optional)</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the event..."
              rows={3}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Prize Tiers</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={addPrize}
                className="h-7 text-xs"
              >
                <Plus className="h-3 w-3 mr-1" />
                Add Prize
              </Button>
            </div>
            <div className="space-y-2">
              {prizes.map((prize, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <Input
                    value={prize.position}
                    onChange={(e) =>
                      updatePrize(index, 'position', e.target.value)
                    }
                    placeholder="Position"
                    className="flex-1"
                  />
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">₹</span>
                    <Input
                      value={prize.amount}
                      onChange={(e) =>
                        updatePrize(index, 'amount', e.target.value)
                      }
                      placeholder="Amount"
                      type="number"
                      className="pl-7"
                    />
                  </div>
                  {prizes.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 text-zinc-500 hover:text-red-400"
                      onClick={() => removePrize(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Submit Proposal
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
