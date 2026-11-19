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
  { label: 'My Claims', href: '/student/claims', icon: FileText },
  { label: 'Payment Tracker', href: '/student/tracker', icon: TrendingUp },
  { label: 'Account', href: '/student/account', icon: Settings },
]

const entityNav: NavItem[] = [
  { label: 'Dashboard', href: '/entity', icon: LayoutDashboard },
  { label: 'Event Proposals', href: '/entity/proposals', icon: CalendarPlus },
  { label: 'Reimbursement', href: '/entity/reimbursement', icon: Receipt },
  { label: 'Account', href: '/entity/account', icon: Settings },
]

const treasuryNav: NavItem[] = [
  { label: 'Dashboard', href: '/treasury', icon: LayoutDashboard },
  { label: 'Event Proposals', href: '/treasury/proposals', icon: CalendarPlus },
  { label: 'Payment Queue', href: '/treasury/queue', icon: CreditCard },
  { label: 'Reimbursements', href: '/treasury/reimbursements', icon: Receipt },
  { label: 'Account', href: '/treasury/account', icon: Settings },
]

const navByRole: Record<UserRole, NavItem[]> = {
  student: studentNav,
  entity: entityNav,
  treasury: treasuryNav,
}

interface SidebarProps {
  role: UserRole
}

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname()
  const items = navByRole[role]

  return (
    <aside className="hidden md:flex w-72 bg-zinc-950 border-r border-zinc-800/60 flex-col flex-shrink-0">
      <nav className="flex-1 py-6 px-4 space-y-1">
        <p className="text-xs font-semibold text-zinc-600 uppercase tracking-widest px-4 pb-3">
          Navigation
        </p>
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
                'flex items-center gap-3.5 px-4 py-3 rounded-xl text-base font-medium transition-all active:scale-[0.98]',
                isActive
                  ? 'bg-emerald-600/10 text-emerald-400 border border-emerald-600/15 shadow-sm'
                  : 'text-zinc-500 hover:bg-zinc-800/70 hover:text-zinc-200'
              )}
            >
              <item.icon
                className={cn(
                  'h-5 w-5 flex-shrink-0',
                  isActive ? 'text-emerald-400' : 'text-zinc-600'
                )}
              />
              {item.label}
            </Link>
          )
        })}
      </nav>
      <div className="p-5 border-t border-zinc-800/60">
        <p className="text-sm text-zinc-700 text-center font-medium">IPM SAC Treasury - {new Date().getFullYear()}</p>
      </div>
    </aside>
  )
}
