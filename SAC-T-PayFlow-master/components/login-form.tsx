'use client'

import Image from 'next/image'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { isIIMEmail } from '@/lib/utils'

interface LoginFormProps {
  error?: string
}

export function LoginForm({ error: initialError }: LoginFormProps = {}) {
  const router = useRouter()
  const supabase = createClient()

  const [tab, setTab] = useState<'signin' | 'signup'>('signin')
  const [loading, setLoading] = useState(false)
  const [showPw, setShowPw] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault()
    if (!isIIMEmail(email)) {
      toast.error('Only @iimidr.ac.in emails are allowed.')
      return
    }
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) { toast.error(error.message); return }
    router.push('/')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex bg-[#0d0d0f]">

      {/* Left panel - branding */}
      <div className="hidden lg:flex lg:w-[52%] flex-col justify-between p-12 bg-zinc-950 border-r border-zinc-800/60 relative overflow-hidden">
        {/* Background grid */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />
        {/* Glow */}
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2 pointer-events-none" />

        {/* Top - logo */}
        <div className="relative">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" width={80} height={80} alt="IPM SAC" className="w-20 h-20 rounded-xl" />
            <div>
              <p className="text-base font-semibold text-zinc-100">IPM SAC Treasury</p>
              <p className="text-xs text-zinc-500">IPM · IIM Indore</p>
            </div>
          </div>
        </div>

        {/* Middle - headline */}
        <div className="relative space-y-6">
          <h1 className="text-4xl font-bold text-zinc-100 leading-tight">
            Student prize payments,<br />
            <span className="text-emerald-400">done right.</span>
          </h1>
          <p className="text-zinc-400 text-lg leading-relaxed max-w-sm">
            A centralised portal for tracking prize claims, verifying bank details, and processing payments - all in one place.
          </p>

          {/* Feature list */}
          <ul className="space-y-3">
            {[
              'One-time bank detail entry',
              'Transparent payment status tracker',
              'Role-based access for students, entities & treasury',
            ].map((f) => (
              <li key={f} className="flex items-center gap-2.5 text-sm text-zinc-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                {f}
              </li>
            ))}
          </ul>
        </div>

        {/* Bottom */}
        <p className="relative text-xs text-zinc-600">
          © {new Date().getFullYear()} IPM Student Activities Council
        </p>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md animate-fade-up">

          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-10 lg:hidden">
            <Image src="/logo.png" width={72} height={72} alt="IPM SAC" className="w-16 h-16 rounded-xl" />
            <div>
              <p className="text-sm font-semibold text-zinc-100">IPM SAC Treasury</p>
              <p className="text-xs text-zinc-500">IPM · IIM Indore</p>
            </div>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-zinc-100">
              {tab === 'signin' ? 'Welcome back' : 'Coming soon'}
            </h2>
            <p className="text-zinc-500 mt-1.5">
              {tab === 'signin'
                ? 'Sign in to your treasury account'
                : 'Self-registration is not yet available'}
            </p>
          </div>

          {/* Error banner */}
          {initialError && (
            <div className="mb-6 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3.5">
              <p className="text-sm text-red-400">{initialError}</p>
            </div>
          )}

          {/* Tab toggle */}
          <div className="flex rounded-xl bg-zinc-900 border border-zinc-800 p-1 mb-8">
            {(['signin', 'signup'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                  tab === t
                    ? 'bg-zinc-800 text-zinc-100 shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {t === 'signin' ? 'Sign In' : 'Sign Up'}
              </button>
            ))}
          </div>

          {/* Sign In */}
          {tab === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-zinc-300">
                  Email address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@iimidr.ac.in"
                    className="pl-10 h-11 text-base bg-zinc-900 border-zinc-800 focus:border-emerald-500/50"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-zinc-300">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none" />
                  <Input
                    id="password"
                    type={showPw ? 'text' : 'password'}
                    placeholder="Enter your password"
                    className="pl-10 pr-10 h-11 text-base bg-zinc-900 border-zinc-800 focus:border-emerald-500/50"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPw((v) => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                  >
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-11 text-base font-medium mt-2"
                disabled={loading}
              >
                {loading
                  ? <Loader2 className="h-4 w-4 animate-spin" />
                  : <>Sign In <ArrowRight className="h-4 w-4 ml-1" /></>
                }
              </Button>

              <p className="text-sm text-zinc-600 text-center pt-1">
                Restricted to{' '}
                <span className="text-zinc-400 font-medium">@iimidr.ac.in</span> emails only
              </p>
            </form>
          )}

          {/* Sign Up - Coming Soon */}
          {tab === 'signup' && (
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-8 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-zinc-800 flex items-center justify-center mx-auto">
                <span className="text-2xl">🔒</span>
              </div>
              <div>
                <p className="text-base font-semibold text-zinc-200">Sign Up Coming Soon</p>
                <p className="text-sm text-zinc-500 mt-2 leading-relaxed">
                  Self-registration is under development.<br />
                  Elect the ideal JT to speed up the work.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setTab('signin')}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                Back to Sign In <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
