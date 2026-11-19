'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  CreditCard,
  FileText,
  CalendarPlus,
  Receipt,
  Settings,
  TrendingUp,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { UserRole } from '@/types'

interface NavItem {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

const studentNav: NavItem[] = [
  { label: 'Dashboard', href: '/student', icon: LayoutDashboard },
  { label: 'Claims', href: '/student/claims', icon: FileText },
  { label: 'Tracker', href: '/student/tracker', icon: TrendingUp },
  { label: 'Account', href: '/student/account', icon: Settings },
]

const entityNav: NavItem[] = [
  { label: 'Dashboard', href: '/entity', icon: LayoutDashboard },
  { label: 'Reimburse', href: '/entity/reimbursement', icon: Receipt },
  { label: 'Events', href: '/entity/proposals', icon: CalendarPlus },
  { label: 'Account', href: '/entity/account', icon: Settings },
]

const treasuryNav: NavItem[] = [
  { label: 'Dashboard', href: '/treasury', icon: LayoutDashboard },
  { label: 'Proposals', href: '/treasury/proposals', icon: CalendarPlus },
  { label: 'Queue', href: '/treasury/queue', icon: CreditCard },
  { label: 'Reimbursements', href: '/treasury/reimbursements', icon: Receipt },
  { label: 'Account', href: '/treasury/account', icon: Settings },
]

const navByRole: Record<UserRole, NavItem[]> = {
  student: studentNav,
  entity: entityNav,
  treasury: treasuryNav,
}

export function MobileNav({ role }: { role: UserRole }) {
  const pathname = usePathname()
  const items = navByRole[role]

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-zinc-950/95 backdrop-blur-sm border-t border-zinc-800 flex safe-area-pb">
      {items.map((item) => {
        const isActive =
          pathname === item.href ||
          (item.href !== `/${role}` && pathname.startsWith(item.href))
        return (
          <Link
            key={item.href}
            href={item.href}
            prefetch={true}
            className={cn(
              'flex-1 flex flex-col items-center justify-center py-3.5 pb-5 gap-1.5 transition-all active:scale-95',
              isActive ? 'text-emerald-400' : 'text-zinc-600 active:text-zinc-300'
            )}
          >
            <item.icon className={cn('h-6 w-6', isActive && 'drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]')} />
            <span className={cn('text-xs font-semibold', isActive ? 'text-emerald-400' : 'text-zinc-600')}>{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
