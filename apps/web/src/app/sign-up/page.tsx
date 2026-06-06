'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AlertCircle, Eye, EyeOff, LockKeyhole, Mail, User } from 'lucide-react'

import { setToken } from '@/lib/api-client'
import { AuthShell } from '@/shared/components/AuthShell'
import { GoogleAuthButton } from '@/shared/components/GoogleAuthButton'

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

function getPasswordStrength(pwd: string): 0 | 1 | 2 | 3 | 4 {
  if (!pwd) return 0
  if (pwd.length < 8) return 1
  let score = 2
  if (/[A-Z]/.test(pwd) && /[0-9]/.test(pwd)) score++
  if (/[^A-Za-z0-9]/.test(pwd)) score++
  return score as 2 | 3 | 4
}

const strengthConfig: Record<1 | 2 | 3 | 4, { label: string; color: string; bars: number }> = {
  1: { label: 'Trop court',  color: 'bg-red-400',    bars: 1 },
  2: { label: 'Faible',      color: 'bg-amber-400',  bars: 2 },
  3: { label: 'Correct',     color: 'bg-blue-400',   bars: 3 },
  4: { label: 'Fort',        color: 'bg-emerald-400', bars: 4 },
}

const inputClass =
  'h-12 w-full rounded-lg border border-white/10 bg-[#0a0f18] px-3.5 pl-10 text-sm font-semibold text-white outline-none transition-all placeholder:text-slate-600 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/15'

export default function SignUpPage() {
  const router = useRouter()
  const [firstName, setFirstName]       = useState('')
  const [lastName, setLastName]         = useState('')
  const [email, setEmail]               = useState('')
  const [password, setPassword]         = useState('')
  const [confirm, setConfirm]           = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm]   = useState(false)
  const [error, setError]               = useState<string | null>(null)
  const [loading, setLoading]           = useState(false)

  const strength     = getPasswordStrength(password)
  const strengthInfo = strength > 0 ? strengthConfig[strength as 1 | 2 | 3 | 4] : null
  const passwordsMatch = confirm.length === 0 || password === confirm

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password !== confirm) {
      setError('Les mots de passe ne correspondent pas.')
      return
    }
    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`${API}/api/v1/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, firstName, lastName }),
      })

      const data = await res.json() as { token?: string; user?: unknown; error?: string }

      if (!res.ok || !data.token) {
        setError(
          data.error === 'email_already_exists'
            ? 'Un compte existe déjà avec cet email.'
            : 'Erreur lors de la création du compte. Veuillez réessayer.',
        )
        return
      }

      setToken(data.token)
      router.push('/onboarding')
    } catch {
      setError('Impossible de joindre le serveur.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell
      eyebrow="Inscription"
      title="Créez votre espace d'analyse."
      description="Connectez vos données progressivement et gardez une lecture claire de votre trading dès le premier jour."
      contentClassName="sm:w-[520px]"
    >
      <div className="space-y-4">
        {/* Google — option principale, friction réduite */}
        <GoogleAuthButton label="S'inscrire avec Google" variant="prominent" />

        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-white/10" />
          <span className="text-xs font-semibold text-slate-500">ou avec votre email</span>
          <div className="h-px flex-1 bg-white/10" />
        </div>

        {/* Email form */}
        <form onSubmit={handleSubmit} className="rounded-xl border border-white/10 bg-white/[0.04] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.22)] backdrop-blur-sm sm:p-6">
          {error && (
            <div className="mb-5 flex items-start gap-3 rounded-lg border border-red-400/25 bg-red-400/[0.08] px-4 py-3 text-sm font-semibold text-red-200">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          {/* Prénom / Nom */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="firstName" className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                Prénom
              </label>
              <div className="relative mt-2">
                <User className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
                <input
                  id="firstName"
                  type="text"
                  required
                  autoComplete="given-name"
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  placeholder="Jean"
                  className={inputClass}
                />
              </div>
            </div>
            <div>
              <label htmlFor="lastName" className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                Nom
              </label>
              <div className="relative mt-2">
                <User className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
                <input
                  id="lastName"
                  type="text"
                  required
                  autoComplete="family-name"
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  placeholder="Dupont"
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          {/* Email */}
          <div className="mt-4">
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

          {/* Mot de passe + force */}
          <div className="mt-4">
            <label htmlFor="password" className="text-[11px] font-black uppercase tracking-wider text-slate-400">
              Mot de passe
            </label>
            <div className="relative mt-2">
              <LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                required
                minLength={8}
                autoComplete="new-password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Minimum 8 caractères"
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

            {/* Strength bars */}
            {password.length > 0 && (
              <div className="mt-2.5 space-y-1.5">
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4].map(bar => (
                    <div
                      key={bar}
                      className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                        strengthInfo && bar <= strengthInfo.bars
                          ? strengthInfo.color
                          : 'bg-white/10'
                      }`}
                    />
                  ))}
                </div>
                {strengthInfo && (
                  <p className={`text-[11px] font-semibold ${
                    strength === 1 ? 'text-red-400'
                    : strength === 2 ? 'text-amber-400'
                    : strength === 3 ? 'text-blue-400'
                    : 'text-emerald-400'
                  }`}>
                    {strengthInfo.label}
                    {strength >= 3 && ' — ajoutez un caractère spécial pour le maximum'}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Confirmation */}
          <div className="mt-4">
            <label htmlFor="confirm" className="text-[11px] font-black uppercase tracking-wider text-slate-400">
              Confirmer le mot de passe
            </label>
            <div className="relative mt-2">
              <LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
              <input
                id="confirm"
                type={showConfirm ? 'text' : 'password'}
                required
                autoComplete="new-password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                placeholder="Confirmez votre mot de passe"
                className={`${inputClass} pr-11 ${!passwordsMatch ? 'border-red-400/50 focus:border-red-400/50' : ''}`}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(v => !v)}
                className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-white/5 hover:text-white"
                aria-label={showConfirm ? 'Masquer' : 'Afficher'}
              >
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {!passwordsMatch && (
              <p className="mt-1.5 text-[11px] font-semibold text-red-300">Les mots de passe ne correspondent pas.</p>
            )}
          </div>

          {/* Consentement RGPD */}
          <p className="mt-5 text-[11px] font-medium leading-5 text-slate-500">
            En créant un compte, vous acceptez nos{' '}
            <Link href="/legal/cgu" className="text-slate-400 underline underline-offset-2 hover:text-white">
              Conditions d&apos;utilisation
            </Link>{' '}
            et notre{' '}
            <Link href="/legal/confidentialite" className="text-slate-400 underline underline-offset-2 hover:text-white">
              Politique de confidentialité
            </Link>
            .
          </p>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !passwordsMatch}
            className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#56bf6b] px-5 text-sm font-black text-white shadow-[0_8px_24px_rgba(86,191,107,0.22)] transition-all hover:bg-[#49ab5e] hover:shadow-[0_10px_28px_rgba(86,191,107,0.30)] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-55"
          >
            {loading && (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            )}
            {loading ? 'Création du compte…' : 'Créer mon compte'}
          </button>

          <p className="mt-5 text-center text-sm font-semibold text-slate-500">
            Déjà un compte ?{' '}
            <Link href="/sign-in" className="font-black text-white transition-colors hover:text-blue-200">
              Se connecter
            </Link>
          </p>
        </form>
      </div>
    </AuthShell>
  )
}
