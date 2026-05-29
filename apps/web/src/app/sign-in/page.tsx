'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AlertCircle, Eye, EyeOff, LockKeyhole, Mail } from 'lucide-react'
import { SignIn } from '@clerk/nextjs'

import { isClerkEnabled } from '@/lib/auth-mode'
import { setToken } from '@/lib/api-client'
import { AuthShell } from '@/shared/components/AuthShell'
import { GoogleAuthButton } from '@/shared/components/GoogleAuthButton'

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

const inputClass =
  'h-12 w-full rounded-lg border border-white/10 bg-[#0a0f18] px-3.5 pl-10 text-sm font-semibold text-white outline-none transition-all placeholder:text-slate-600 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/15'

function PasswordLoginForm() {
  const router = useRouter()
  const [email, setEmail]               = useState('')
  const [password, setPassword]         = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError]               = useState<string | null>(null)
  const [loading, setLoading]           = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const res = await fetch(`${API}/api/v1/auth/login`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email, password }),
      })

      const data = await res.json() as { token?: string; error?: string }

      if (!res.ok || !data.token) {
        setError(
          data.error === 'invalid_credentials'
            ? 'Email ou mot de passe incorrect.'
            : 'Erreur de connexion. Veuillez réessayer.',
        )
        return
      }

      setToken(data.token)
      router.push('/app/dashboard')
    } catch {
      setError('Impossible de joindre le serveur.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Google — option principale */}
      <GoogleAuthButton label="Se connecter avec Google" variant="prominent" />

      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-white/10" />
        <span className="text-xs font-semibold text-slate-500">ou avec votre email</span>
        <div className="h-px flex-1 bg-white/10" />
      </div>

      <form onSubmit={handleSubmit} className="rounded-xl border border-white/10 bg-white/[0.04] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.22)] backdrop-blur-sm sm:p-6">
        {error && (
          <div className="mb-5 flex items-start gap-3 rounded-lg border border-red-400/25 bg-red-400/[0.08] px-4 py-3 text-sm font-semibold text-red-200">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label htmlFor="email" className="text-[11px] font-black uppercase tracking-wider text-slate-400">
              Email
            </label>
            <div className="relative mt-2">
              <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="vous@exemple.com"
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between gap-4">
              <label htmlFor="password" className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                Mot de passe
              </label>
              <Link
                href="/forgot-password"
                className="text-[11px] font-black text-blue-300 transition-colors hover:text-blue-200"
              >
                Oublié ?
              </Link>
            </div>
            <div className="relative mt-2">
              <LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Votre mot de passe"
                className={`${inputClass} pr-11`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-white/5 hover:text-white"
                aria-label={showPassword ? 'Masquer' : 'Afficher'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#56bf6b] px-5 text-sm font-black text-white shadow-[0_8px_24px_rgba(86,191,107,0.22)] transition-all hover:bg-[#49ab5e] hover:shadow-[0_10px_28px_rgba(86,191,107,0.30)] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-55"
        >
          {loading && (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          )}
          {loading ? 'Connexion en cours…' : 'Se connecter'}
        </button>

        <p className="mt-5 text-center text-sm font-semibold text-slate-500">
          Nouveau sur MERKURE ?{' '}
          <Link href="/sign-up" className="font-black text-white transition-colors hover:text-blue-200">
            Créer un compte
          </Link>
        </p>
      </form>
    </div>
  )
}

function ClerkLogin() {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3 shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
      <SignIn />
    </div>
  )
}

export default function SignInPage() {
  return (
    <AuthShell
      eyebrow="Connexion"
      title="Reprenez là où vous en étiez."
      description="Accédez à votre journal, vos performances et vos revues sans distraction."
    >
      {isClerkEnabled ? <ClerkLogin /> : <PasswordLoginForm />}
    </AuthShell>
  )
}
