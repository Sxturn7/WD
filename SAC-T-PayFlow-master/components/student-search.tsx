'use client'

import { useState, useEffect, useRef } from 'react'
import { Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { searchStudents } from '@/actions/students'

interface Student {
  id: string
  full_name: string | null
  email: string
  roll_number: string | null
}

interface Props {
  onSelect: (student: Student) => void
  placeholder?: string
  defaultEmail?: string
}

export function StudentSearch({ onSelect, placeholder, defaultEmail }: Props) {
  const [query, setQuery] = useState(defaultEmail ?? '')
  const [results, setResults] = useState<Student[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [locked, setLocked] = useState(!!defaultEmail)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    if (locked || query.trim().length < 2) return

    let active = true
    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const data = await searchStudents(query.trim())
        if (active) {
          setResults(data)
          setOpen(data.length > 0)
        }
      } finally {
        if (active) setLoading(false)
      }
    }, 300)

    return () => {
      active = false
      clearTimeout(timer)
    }
  }, [query, locked])

  function handleSelect(student: Student) {
    setQuery(student.email)
    setLocked(true)
    setOpen(false)
    setResults([])
    onSelect(student)
  }

  return (
    <div ref={ref} className="relative">
      <div className="relative">
        <Input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setLocked(false)
          }}
          placeholder={placeholder ?? 'Search by name or email...'}
          className="text-sm pr-8"
        />
        {loading && (
          <Loader2 className="h-3 w-3 animate-spin absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500" />
        )}
      </div>
      {open && results.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl overflow-hidden">
          {results.map((student) => (
            <button
              key={student.id}
              type="button"
              onClick={() => handleSelect(student)}
              className="w-full flex items-start gap-3 px-3 py-2.5 hover:bg-zinc-800 transition-colors text-left"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-zinc-200 truncate">
                  {student.full_name ?? 'Unknown'}
                </p>
                <p className="text-xs text-zinc-500 truncate">
                  {student.email}
                  {student.roll_number ? ` · ${student.roll_number}` : ''}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
