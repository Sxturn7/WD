'use client'

import Image from 'next/image'
import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile'
import { useRef, useState } from 'react'
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
  const [fullName, setFullName] = useState('')
  const [password, setPassword] = useState('')
  const [captchaToken, setCaptchaToken] = useState('')
  const [captchaError, setCaptchaError] = useState(false)
  const widget = useRef<TurnstileInstance>(null)
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY

  function changeTab(next: typeof tab) {
    if (next === tab) return
    setCaptchaToken('')
    setCaptchaError(false)
    setTab(next)
  }

  function resetCaptcha() {
    setCaptchaToken('')
    widget.current?.reset()
  }

  function verificationFailed() {
    setCaptchaToken('')
    setCaptchaError(true)
  }

  const captcha = siteKey ? (
    <div className="space-y-2">
      <Turnstile key={tab} ref={widget} siteKey={siteKey}
        options={{ action: tab, theme: 'light', size: 'flexible' }}
        onSuccess={(token) => { setCaptchaToken(token); setCaptchaError(false) }}
        onExpire={() => setCaptchaToken('')} onTimeout={() => setCaptchaToken('')}
        onError={verificationFailed} onUnsupported={verificationFailed}
        scriptOptions={{ onError: verificationFailed }}
      />
      {captchaError && <p role="alert" className="text-sm text-red-400">Verification could not finish. Refresh the page to try again.</p>}
    </div>
  ) : <p role="alert" className="text-sm text-red-400">Verification is unavailable. Please contact the treasury administrator.</p>

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault()
    if (loading || !captchaToken) return
    if (!isIIMEmail(email)) {
      toast.error('Only @iimidr.ac.in emails are allowed.')
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password, options: { captchaToken } })
      if (error) {
        toast.error(error.code === 'invalid_credentials' ? 'Invalid email or password.' : 'Unable to sign in right now. Please try again.')
        return
      }
      router.push('/')
      router.refresh()
    } catch {
      toast.error('Unable to sign in right now. Please try again.')
    } finally {
      resetCaptcha()
      setLoading(false)
    }
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault()
    if (loading || !captchaToken) return
    const normalizedEmail = email.trim().toLowerCase()
    if (!isIIMEmail(normalizedEmail)) {
      toast.error('Only @iimidr.ac.in emails are allowed.')
      return
    }
    if (fullName.trim().length < 2 || fullName.trim().length > 100) {
      toast.error('Enter your full name (2–100 characters).')
      return
    }
    if (password.length < 8) {
      toast.error('Use a password with at least 8 characters.')
      return
    }

    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          captchaToken,
          data: { full_name: fullName.trim() },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) {
        toast.error('Unable to create this account. Check your details or try signing in.')
        return
      }
      if (data.session) {
        router.push('/')
        router.refresh()
      } else {
        toast.success('Account request received. Check your email to confirm your address.')
        changeTab('signin')
      }
    } catch {
      toast.error('Unable to create this account right now. Please try again.')
    } finally {
      resetCaptcha()
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-[#fcfbf9]">

      {/* Left panel - branding */}
      <div className="mesh-background hidden lg:flex lg:w-[52%] flex-col justify-between p-12 bg-[#fcfbf9] border-r border-[#e5e5e5] relative overflow-hidden">
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
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#4338ca]/10 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2 pointer-events-none" />
        {/* Soft editorial wave transition */}
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-24 left-[-10%] h-44 w-[120%] rounded-[50%_50%_0_0] border-t border-indigo-100/80 bg-gradient-to-b from-[#fcfbf9]/70 to-[#fcfbf9]/0 opacity-80" />

        {/* Top - logo */}
        <div className="relative">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" width={80} height={80} alt="IPM SAC" className="w-20 h-20 rounded-xl" />
            <div>
              <p className="text-base font-semibold text-[#171717]">IPM SAC Treasury</p>
              <p className="text-xs text-[#77716c]">IPM · IIM Indore</p>
            </div>
          </div>
        </div>

        {/* Middle - headline */}
        <div className="relative space-y-6">
          <h1 className="font-display text-5xl font-normal text-[#171717] leading-[1.02] tracking-tight">
            Student prize payments,<br />
            <span className="font-display italic font-normal text-[#4338ca]">done right.</span>
          </h1>
          <p className="text-[#66615d] text-lg leading-relaxed max-w-sm">
            A centralised portal for tracking prize claims, verifying bank details, and processing payments - all in one place.
          </p>

          {/* Feature list */}
          <ul className="space-y-3">
            {[
              'One-time bank detail entry',
              'Transparent payment status tracker',
              'Role-based access for students, entities & treasury',
            ].map((f) => (
              <li key={f} className="flex items-center gap-2.5 text-sm text-[#66615d]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#4338ca] flex-shrink-0" />
                {f}
              </li>
            ))}
          </ul>
        </div>

        {/* Bottom */}
        <p className="relative text-xs text-[#918b85]">
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
              <p className="text-sm font-semibold text-[#171717]">IPM SAC Treasury</p>
              <p className="text-xs text-[#77716c]">IPM · IIM Indore</p>
            </div>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-[#171717]">
              {tab === 'signin' ? 'Welcome back' : 'Create your account'}
            </h2>
            <p className="text-[#77716c] mt-1.5">
              {tab === 'signin'
                ? 'Sign in to your treasury account'
                : 'Use your IIM Indore email to register as a student'}
            </p>
          </div>

          {/* Error banner */}
          {initialError && (
            <div className="mb-6 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3.5">
              <p className="text-sm text-red-400">{initialError}</p>
            </div>
          )}

          {/* Tab toggle */}
          <div className="flex rounded-xl bg-white border border-[#e5e5e5] p-1 mb-8">
            {(['signin', 'signup'] as const).map((t) => (
              <button
                key={t}
                type="button"
                disabled={loading}
                onClick={() => changeTab(t)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                  tab === t
                    ? 'bg-[#f1efec] text-[#171717] shadow-sm'
                    : 'text-[#77716c] hover:text-[#404040]'
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
                <Label htmlFor="email" className="text-sm font-medium text-[#404040]">
                  Email address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#77716c] pointer-events-none" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@iimidr.ac.in"
                    className="pl-10 h-11 text-base bg-white border-[#e5e5e5] focus:border-indigo-400"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-[#404040]">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#77716c] pointer-events-none" />
                  <Input
                    id="password"
                    type={showPw ? 'text' : 'password'}
                    placeholder="Enter your password"
                    className="pl-10 pr-10 h-11 text-base bg-white border-[#e5e5e5] focus:border-indigo-400"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPw((v) => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#77716c] hover:text-[#404040] transition-colors"
                  >
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {captcha}

              <Button
                type="submit"
                className="w-full h-11 text-base font-medium mt-2"
                disabled={loading || !captchaToken}
              >
                {loading
                  ? <Loader2 className="h-4 w-4 animate-spin" />
                  : <>Sign In <ArrowRight className="h-4 w-4 ml-1" /></>
                }
              </Button>

              <p className="text-sm text-[#918b85] text-center pt-1">
                Restricted to{' '}
                <span className="text-[#66615d] font-medium">@iimidr.ac.in</span> emails only
              </p>
            </form>
          )}

          {tab === 'signup' && (
            <form onSubmit={handleSignUp} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="signup-name" className="text-sm font-medium text-[#404040]">Full name</Label>
                <Input id="signup-name" value={fullName} onChange={(event) => setFullName(event.target.value)} autoComplete="name" maxLength={100} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-email" className="text-sm font-medium text-[#404040]">IIM Indore email</Label>
                <Input id="signup-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" placeholder="you@iimidr.ac.in" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-password" className="text-sm font-medium text-[#404040]">Password</Label>
                <Input id="signup-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="new-password" minLength={8} required />
                <p className="text-xs text-[#77716c]">At least 8 characters.</p>
              </div>
              {captcha}
              <Button type="submit" className="w-full h-11" disabled={loading || !captchaToken}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Create account <ArrowRight className="h-4 w-4 ml-1" /></>}
              </Button>
              <p className="text-xs text-[#77716c] text-center">New accounts are assigned the student role. Entity and treasury access is managed by administrators.</p>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
