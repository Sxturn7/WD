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
}

export function Header({ user }: HeaderProps) {
  const router = useRouter()

  return (
    <header className="min-h-[5.5rem] bg-zinc-950 border-b border-zinc-800 flex items-center px-5 md:px-8 justify-between flex-shrink-0 z-10">
      <div className="flex items-center gap-4 md:gap-5">
        <Image src="/logo.png" width={80} height={80} alt="IPM SAC" className="w-16 h-16 md:w-20 md:h-20 rounded-2xl flex-shrink-0" />
        <div>
          <p className="text-lg font-bold text-zinc-100 leading-none tracking-tight">Treasury Portal</p>
          <p className="hidden sm:block text-sm text-zinc-500 mt-1">IPM SAC</p>
        </div>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex items-center gap-2.5 text-zinc-400 hover:bg-zinc-800/80 hover:text-zinc-100 h-11 px-3 md:px-4 rounded-xl border border-transparent hover:border-zinc-700/50"
          >
            <div className="w-8 h-8 rounded-full bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center flex-shrink-0">
              <span className="text-emerald-400 text-sm font-bold">
                {getInitials(user.full_name ?? user.email)}
              </span>
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-sm font-semibold text-zinc-200 leading-none">
                {user.full_name ?? 'User'}
              </p>
              <p className="text-xs text-zinc-500 mt-0.5 capitalize">{user.role}</p>
            </div>
            <ChevronDown className="h-4 w-4 text-zinc-500 hidden sm:block" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuLabel className="font-normal p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center flex-shrink-0">
                <span className="text-emerald-400 text-base font-bold">
                  {getInitials(user.full_name ?? user.email)}
                </span>
              </div>
              <div>
                <p className="text-base font-semibold text-zinc-200 leading-none">
                  {user.full_name ?? 'User'}
                </p>
                <p className="text-sm text-zinc-400 mt-1 truncate">{user.email}</p>
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
