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
  1: { label: 'Trop court',  color: 'bg-red-400',      bars: 1 },
  2: { label: 'Faible',      color: 'bg-amber-400',    bars: 2 },
  3: { label: 'Correct',     color: 'bg-blue-400',     bars: 3 },
  4: { label: 'Fort',        color: 'bg-emerald-400',  bars: 4 },
}

const inputCls =
  'h-12 w-full rounded-lg border border-[hsl(var(--border))] bg-white px-3.5 pl-10 text-sm font-medium text-foreground outline-none transition-all placeholder:text-[hsl(var(--foreground-soft)/0.45)] focus:border-[hsl(var(--primary)/0.5)] focus:ring-2 focus:ring-[hsl(var(--primary)/0.08)]'

const labelCls = 'block mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-[hsl(var(--foreground-soft))]'

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

  const strength       = getPasswordStrength(password)
  const strengthInfo   = strength > 0 ? strengthConfig[strength as 1 | 2 | 3 | 4] : null
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
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email, password, firstName, lastName }),
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
      title="Créez votre espace."
      description="Connectez vos données et gardez une lecture claire de votre trading dès le premier jour."
      contentClassName="sm:w-[520px]"
    >
      <div className="space-y-4">
        {/* Google — option principale */}
        <GoogleAuthButton label="S'inscrire avec Google" variant="prominent" />

        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-[hsl(var(--border))]" />
          <span className="text-xs font-semibold text-[hsl(var(--foreground-soft))]">ou avec votre email</span>
          <div className="h-px flex-1 bg-[hsl(var(--border))]" />
        </div>

        {/* Formulaire email */}
        <form onSubmit={handleSubmit} className="rounded-xl border border-[hsl(var(--border))] bg-white p-5 shadow-sm sm:p-6">
          {error && (
            <div className="mb-5 flex items-start gap-3 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          {/* Prénom / Nom */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="firstName" className={labelCls}>Prénom</label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[hsl(var(--foreground-soft)/0.6)]" />
                <input
                  id="firstName"
                  type="text"
                  required
                  autoComplete="given-name"
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  placeholder="Jean"
                  className={inputCls}
                />
              </div>
            </div>
            <div>
              <label htmlFor="lastName" className={labelCls}>Nom</label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[hsl(var(--foreground-soft)/0.6)]" />
                <input
                  id="lastName"
                  type="text"
                  required
                  autoComplete="family-name"
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  placeholder="Dupont"
                  className={inputCls}
                />
              </div>
            </div>
          </div>

          {/* Email */}
          <div className="mt-4">
            <label htmlFor="email" className={labelCls}>Email</label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[hsl(var(--foreground-soft)/0.6)]" />
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="vous@exemple.com"
                className={inputCls}
              />
            </div>
          </div>

          {/* Mot de passe */}
          <div className="mt-4">
            <label htmlFor="password" className={labelCls}>Mot de passe</label>
            <div className="relative">
              <LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[hsl(var(--foreground-soft)/0.6)]" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                required
                minLength={8}
                autoComplete="new-password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Minimum 8 caractères"
                className={`${inputCls} pr-11`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-[hsl(var(--foreground-soft))] transition-colors hover:bg-[hsl(var(--accent))] hover:text-foreground"
                aria-label={showPassword ? 'Masquer' : 'Afficher'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            {password.length > 0 && (
              <div className="mt-2.5 space-y-1.5">
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4].map(bar => (
                    <div
                      key={bar}
                      className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                        strengthInfo && bar <= strengthInfo.bars
                          ? strengthInfo.color
                          : 'bg-[hsl(var(--border))]'
                      }`}
                    />
                  ))}
                </div>
                {strengthInfo && (
                  <p className={`text-[11px] font-semibold ${
                    strength === 1 ? 'text-red-500'
                    : strength === 2 ? 'text-amber-500'
                    : strength === 3 ? 'text-blue-500'
                    : 'text-emerald-600'
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
            <label htmlFor="confirm" className={labelCls}>Confirmer le mot de passe</label>
            <div className="relative">
              <LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[hsl(var(--foreground-soft)/0.6)]" />
              <input
                id="confirm"
                type={showConfirm ? 'text' : 'password'}
                required
                autoComplete="new-password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                placeholder="Confirmez votre mot de passe"
                className={`${inputCls} pr-11 ${!passwordsMatch ? 'border-red-300 focus:border-red-400 focus:ring-red-100' : ''}`}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(v => !v)}
                className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-[hsl(var(--foreground-soft))] transition-colors hover:bg-[hsl(var(--accent))] hover:text-foreground"
                aria-label={showConfirm ? 'Masquer' : 'Afficher'}
              >
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {!passwordsMatch && (
              <p className="mt-1.5 text-[11px] font-semibold text-red-500">Les mots de passe ne correspondent pas.</p>
            )}
          </div>

          {/* RGPD */}
          <p className="mt-5 text-[11px] leading-5 text-[hsl(var(--foreground-soft))]">
            En créant un compte, vous acceptez nos{' '}
            <Link href="/legal/cgu" className="text-foreground underline underline-offset-2 hover:text-[hsl(var(--primary))]">
              Conditions d&apos;utilisation
            </Link>{' '}
            et notre{' '}
            <Link href="/legal/confidentialite" className="text-foreground underline underline-offset-2 hover:text-[hsl(var(--primary))]">
              Politique de confidentialité
            </Link>
            .
          </p>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !passwordsMatch}
            className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[hsl(var(--primary))] px-5 text-sm font-semibold text-white transition-all hover:bg-[hsl(244_42%_44%)] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-55"
          >
            {loading && (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            )}
            {loading ? 'Création du compte…' : 'Créer mon compte →'}
          </button>

          <p className="mt-5 text-center text-sm text-[hsl(var(--foreground-soft))]">
            Déjà un compte ?{' '}
            <Link href="/sign-in" className="font-semibold text-[hsl(var(--primary))] underline-offset-4 hover:underline">
              Se connecter
            </Link>
          </p>
        </form>
      </div>
    </AuthShell>
  )
}
