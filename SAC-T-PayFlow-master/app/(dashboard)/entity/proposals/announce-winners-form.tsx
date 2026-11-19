'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StudentSearch } from '@/components/student-search'
import { announceWinners } from '@/actions/events'
import { formatCurrency } from '@/lib/utils'
import type { Event, EventWinner } from '@/types'

interface Props {
  event: Event
  existingWinners: EventWinner[]
}

interface Selection {
  email: string
  name: string
}

export function AnnounceWinnersForm({ event, existingWinners }: Props) {
  const [editing, setEditing] = useState(existingWinners.length === 0)
  const [loading, setLoading] = useState(false)

  const initial = existingWinners.reduce<Record<string, Selection>>((acc, w) => {
    acc[w.prize_position] = {
      email: w.student_email,
      name: w.student?.full_name ?? w.student_email,
    }
    return acc
  }, {})

  const [selections, setSelections] = useState<Record<string, Selection>>(initial)

  async function handleSave() {
    const prizes = event.prizes ?? []
    const missing = prizes.filter((p) => !selections[p.position]?.email)
    if (missing.length > 0) {
      toast.error(`Please assign a winner for: ${missing.map((p) => p.position).join(', ')}`)
      return
    }

    const winners = prizes.map((p) => ({
      student_email: selections[p.position].email,
      prize_position: p.position,
      prize_amount: p.amount,
    }))

    setLoading(true)
    const result = await announceWinners(event.id, winners)
    setLoading(false)

    if (result?.error) {
      toast.error(result.error)
    } else {
      toast.success('Winners announced!')
      setEditing(false)
    }
  }

  // Summary view (after saving)
  if (!editing && existingWinners.length > 0) {
    return (
      <div className="mt-3 border-t border-[#e5e5e5] pt-3">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold text-[#4338ca] uppercase tracking-wider">
            Winners Announced
          </p>
          <button
            onClick={() => setEditing(true)}
            className="text-xs text-[#77716c] hover:text-[#404040] transition-colors"
          >
            Edit
          </button>
        </div>
        <div className="space-y-1">
          {existingWinners.map((w) => (
            <div key={w.id} className="flex justify-between text-xs">
              <span className="text-[#77716c]">{w.prize_position}</span>
              <span className="text-[#404040]">
                {w.student?.full_name ?? w.student_email}
              </span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="mt-3 border-t border-[#e5e5e5] pt-3">
      <p className="text-xs font-semibold text-[#66615d] uppercase tracking-wider mb-3">
        Announce Winners
      </p>
      <div className="space-y-3">
        {(event.prizes ?? []).map((prize) => (
          <div key={prize.position} className="space-y-1.5">
            <p className="text-xs text-[#66615d]">
              {prize.position} - {formatCurrency(prize.amount)}
            </p>
            <StudentSearch
              placeholder={`Search student for ${prize.position}...`}
              defaultEmail={selections[prize.position]?.email}
              onSelect={(student) =>
                setSelections((prev) => ({
                  ...prev,
                  [prize.position]: {
                    email: student.email,
                    name: student.full_name ?? student.email,
                  },
                }))
              }
            />
            {selections[prize.position] && (
              <p className="text-xs text-[#4338ca]">
                {selections[prize.position].name}
              </p>
            )}
          </div>
        ))}
      </div>
      <div className="flex gap-2 mt-4">
        {existingWinners.length > 0 && (
          <Button variant="ghost" size="sm" onClick={() => setEditing(false)}>
            Cancel
          </Button>
        )}
        <Button size="sm" onClick={handleSave} disabled={loading}>
          {loading && <Loader2 className="h-3 w-3 animate-spin mr-1" />}
          Save Winners
        </Button>
      </div>
    </div>
  )
}
