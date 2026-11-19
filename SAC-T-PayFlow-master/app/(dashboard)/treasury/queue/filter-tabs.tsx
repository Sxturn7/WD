'use client'

import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

const tabs = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Processing', value: 'processing' },
  { label: 'Completed', value: 'completed' },
]

export function FilterTabs({ current }: { current: string }) {
  const router = useRouter()

  return (
    <div className="flex gap-1 bg-[#f1efec] rounded-lg p-1 w-fit">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() =>
            router.push(
              tab.value === 'all'
                ? '/treasury/queue'
                : `/treasury/queue?filter=${tab.value}`
            )
          }
          className={cn(
            'px-4 py-1.5 rounded-md text-sm font-medium transition-colors',
            current === tab.value
              ? 'bg-white text-[#171717] shadow-sm'
              : 'text-[#66615d] hover:text-[#404040]'
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
