'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { LogOut, User, ChevronDown } from 'lucide-react'
import { signOut } from '@/actions/auth'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { getInitials } from '@/lib/utils'
import type { User as UserType } from '@/types'

interface HeaderProps {
  user: UserType
  compact?: boolean
}

export function Header({ user, compact = false }: HeaderProps) {
  const router = useRouter()

  return (
    <header className={`relative z-30 flex flex-shrink-0 items-center justify-between border-b border-[#e5e5e5]/80 bg-[#fcfbf9]/85 px-5 md:px-8 backdrop-blur-xl transition-[height,padding] duration-500 premium-ease ${compact ? 'h-16' : 'h-20'}`}>
      <div className="flex items-center gap-4 md:gap-5">
        <Image src="/logo.png" width={80} height={80} alt="IPM SAC" className={`rounded-xl flex-shrink-0 transition-all duration-500 premium-ease ${compact ? 'h-11 w-11' : 'h-14 w-14'}`} />
        <div>
          <p className="font-display text-xl italic font-bold text-[#171717] leading-none tracking-tight">Treasury Portal</p>
          <p className="hidden sm:block mt-1 font-mono-ui text-[9px] text-[#77716c] tracking-[.24em]">IPM SAC · TREASURY</p>
        </div>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex items-center gap-2.5 text-[#66615d] hover:bg-[#f1efec] hover:text-[#171717] h-11 px-3 md:px-4 rounded-xl border border-transparent hover:border-[#e5e5e5]"
          >
            <div className="w-8 h-8 rounded-full bg-[#4338ca]/20 border border-indigo-300 flex items-center justify-center flex-shrink-0">
              <span className="text-[#4338ca] text-sm font-bold">
                {getInitials(user.full_name ?? user.email)}
              </span>
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-sm font-semibold text-[#262626] leading-none">
                {user.full_name ?? 'User'}
              </p>
              <p className="text-xs text-[#77716c] mt-0.5 capitalize">{user.role}</p>
            </div>
            <ChevronDown className="h-4 w-4 text-[#77716c] hidden sm:block" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuLabel className="font-normal p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#4338ca]/20 border border-indigo-300 flex items-center justify-center flex-shrink-0">
                <span className="text-[#4338ca] text-base font-bold">
                  {getInitials(user.full_name ?? user.email)}
                </span>
              </div>
              <div>
                <p className="text-base font-semibold text-[#262626] leading-none">
                  {user.full_name ?? 'User'}
                </p>
                <p className="text-sm text-[#66615d] mt-1 truncate">{user.email}</p>
              </div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-base py-3 px-4 gap-3" onClick={() => router.push(`/${user.role}/account`)}>
            <User className="h-4 w-4" />
            Account Settings
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => signOut()}
            className="text-base py-3 px-4 gap-3 text-red-400 focus:text-red-400 focus:bg-red-500/10"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
