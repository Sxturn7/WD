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
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#fcfbf9]/90 backdrop-blur-xl border-t border-[#e5e5e5] shadow-[0_-8px_30px_rgba(23,23,23,0.04)] flex safe-area-pb">
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
              'flex-1 flex flex-col items-center justify-center py-3 pb-4 gap-1.5 transition-all active:scale-95',
              isActive ? 'text-[#4338ca]' : 'text-[#918b85] active:text-[#404040]'
            )}
          >
            <item.icon className={cn('h-6 w-6', isActive && 'drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]')} />
            <span className={cn('text-[10px] font-semibold tracking-wide', isActive ? 'text-[#4338ca]' : 'text-[#918b85]')}>{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
