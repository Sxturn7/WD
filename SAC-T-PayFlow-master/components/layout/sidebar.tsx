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
    <aside className="hidden md:flex w-72 bg-[#fcfbf9] border-r border-[#e5e5e5] flex-col flex-shrink-0">
      <nav className="flex-1 py-6 px-4 space-y-1">
        <p className="font-mono-ui text-[9px] font-semibold text-[#918b85] tracking-[.28em] px-4 pb-4">
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
                'group relative flex items-center gap-3.5 rounded-xl px-4 py-3 text-[13px] font-medium transition-all duration-300 premium-ease active:scale-[0.99]',
                isActive
                  ? 'bg-[#4338ca]/10 text-[#4338ca] border border-indigo-200 shadow-sm'
                  : 'text-[#77716c] hover:bg-[#f4f2ef] hover:text-[#171717]'
              )}
            >
              <item.icon
                className={cn(
                  'h-[18px] w-[18px] flex-shrink-0 transition-transform duration-300 group-hover:scale-105',
                  isActive ? 'text-[#4338ca]' : 'text-[#918b85]'
                )}
              />
              {item.label}
            </Link>
          )
        })}
      </nav>
      <div className="p-5 border-t border-[#e5e5e5]">
        <p className="font-mono-ui text-[9px] text-[#a7a19a] text-center tracking-[.12em]">IPM SAC Treasury - {new Date().getFullYear()}</p>
      </div>
    </aside>
  )
}
