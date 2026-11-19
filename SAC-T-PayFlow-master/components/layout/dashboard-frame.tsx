'use client'

import { useEffect, useState } from 'react'
import { Header } from '@/components/layout/header'
import { Sidebar } from '@/components/layout/sidebar'
import { MobileNav } from '@/components/layout/mobile-nav'
import type { User, UserRole } from '@/types'

export function DashboardFrame({ user, role, children }: { user: User; role: UserRole; children: React.ReactNode }) {
  const [compact, setCompact] = useState(false)

  useEffect(() => {
    const root = document.querySelector('main')
    if (!root) return
    const nodes = root.querySelectorAll<HTMLElement>('[data-reveal]')
    if (!('IntersectionObserver' in window)) { nodes.forEach((node) => node.classList.add('is-visible')); return }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target) }
      })
    }, { root, threshold: 0.08 })
    nodes.forEach((node) => observer.observe(node))
    return () => observer.disconnect()
  }, [])

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#fcfbf9] text-[#171717]">
      <Header user={user} compact={compact} />
      <div className="flex min-h-0 flex-1 overflow-hidden">
        <Sidebar role={role} />
        <main
          onScroll={(event) => setCompact(event.currentTarget.scrollTop > 100)}
          className="relative min-w-0 flex-1 overflow-y-auto bg-[#fcfbf9] px-5 py-7 pb-28 md:px-9 md:py-9 md:pb-10"
        >
          <div className="pointer-events-none fixed inset-x-72 top-20 -z-0 h-72 bg-[radial-gradient(ellipse_at_top,rgba(199,210,254,0.18),transparent_68%)]" />
          <div className="relative z-10 mx-auto w-full max-w-[1600px] animate-fade-in">{children}</div>
        </main>
      </div>
      <MobileNav role={role} />
    </div>
  )
}
