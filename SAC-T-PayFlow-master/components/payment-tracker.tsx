'use client'

import {
  FileCheck,
  ShieldCheck,
  Building2,
  CircleDollarSign,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ClaimStatus } from '@/types'

const steps: {
  key: ClaimStatus
  label: string
  description: string
  icon: React.ComponentType<{ className?: string }>
}[] = [
  {
    key: 'winners_announced',
    label: 'Winners Announced',
    description: 'Claim created for treasury review',
    icon: FileCheck,
  },
  {
    key: 'treasury_verified',
    label: 'Treasury Verified',
    description: 'Checked by SAC Treasury',
    icon: ShieldCheck,
  },
  {
    key: 'bank_details_shared',
    label: 'Bank Details Shared',
    description: 'Payment info confirmed',
    icon: Building2,
  },
  {
    key: 'payment_completed',
    label: 'Payment Completed',
    description: 'Funds transferred',
    icon: CircleDollarSign,
  },
]

const statusOrder: Record<ClaimStatus, number> = {
  winners_announced: 0,
  treasury_verified: 1,
  bank_details_shared: 2,
  payment_completed: 3,
}

interface PaymentTrackerProps {
  status: ClaimStatus
}

export function PaymentTracker({ status }: PaymentTrackerProps) {
  const currentIndex = statusOrder[status]

  return (
    <div className="w-full overflow-x-auto">
      <div className="flex items-start min-w-max px-4 py-2">
        {steps.map((step, index) => {
          const isCompleted = index < currentIndex
          const isCurrent = index === currentIndex
          const Icon = step.icon

          return (
            <div key={step.key} className="flex items-start">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all',
                    isCompleted
                      ? 'bg-emerald-600 border-emerald-600'
                      : isCurrent
                      ? 'bg-emerald-600/20 border-emerald-500'
                      : 'bg-zinc-800 border-zinc-700'
                  )}
                >
                  <Icon
                    className={cn(
                      'h-4 w-4',
                      isCompleted
                        ? 'text-white'
                        : isCurrent
                        ? 'text-emerald-400'
                        : 'text-zinc-500'
                    )}
                  />
                </div>
                <div className="mt-2 text-center w-28">
                  <p
                    className={cn(
                      'text-xs font-medium leading-tight',
                      isCompleted
                        ? 'text-emerald-400'
                        : isCurrent
                        ? 'text-zinc-100'
                        : 'text-zinc-500'
                    )}
                  >
                    {step.label}
                  </p>
                  <p className="text-[10px] text-zinc-600 mt-0.5">
                    {step.description}
                  </p>
                </div>
              </div>

              {index < steps.length - 1 && (
                <div
                  className={cn(
                    'w-16 h-0.5 mt-5 mx-1 transition-all',
                    index < currentIndex ? 'bg-emerald-600' : 'bg-zinc-700'
                  )}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
