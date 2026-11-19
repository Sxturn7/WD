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
          placeholder={placeholder ?? 'Search by name, email, or roll no...'}
          className="text-sm pr-8"
        />
        {loading && (
          <Loader2 className="h-3 w-3 animate-spin absolute right-3 top-1/2 -translate-y-1/2 text-[#77716c]" />
        )}
      </div>
      {open && results.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-[#d8d6d2] rounded-lg shadow-xl overflow-hidden">
          {results.map((student) => (
            <button
              key={student.id}
              type="button"
              onClick={() => handleSelect(student)}
              className="w-full flex items-start gap-3 px-3 py-2.5 hover:bg-[#f1efec] transition-colors text-left"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-[#262626] truncate flex items-center gap-1.5">
                  <span>{student.full_name ?? 'Unknown'}</span>
                  {student.roll_number ? (
                    <span className="text-[11px] font-mono font-normal text-[#4338ca] bg-[#4338ca]/10 border border-indigo-200 px-1.5 py-0.2 rounded">
                      {student.roll_number}
                    </span>
                  ) : null}
                </p>
                <p className="text-xs text-[#77716c] truncate">
                  {student.email}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
