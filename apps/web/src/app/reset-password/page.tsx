'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { AlertCircle, CheckCircle2, Eye, EyeOff, LockKeyhole } from 'lucide-react'

import { AuthShell } from '@/shared/components/AuthShell'

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

const inputCls =
  'h-12 w-full rounded-lg border border-[hsl(var(--border))] bg-white px-3.5 pl-11 pr-11 text-sm font-medium text-foreground outline-none transition-all placeholder:text-[hsl(var(--foreground-soft)/0.45)] focus:border-[hsl(var(--primary)/0.5)] focus:ring-2 focus:ring-[hsl(var(--primary)/0.08)]'

function ResetPasswordForm() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const token        = searchParams.get('token') ?? ''

  const [password, setPassword]         = useState('')
  const [confirm, setConfirm]           = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm]   = useState(false)
  const [loading, setLoading]           = useState(false)
  const [error, setError]               = useState<string | null>(null)
  const [done, setDone]                 = useState(false)

  useEffect(() => {
    if (!token) setError('Lien invalide ou expiré.')
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirm) { setError('Les mots de passe ne correspondent pas.'); return }
    if (password.length < 8) { setError('Le mot de passe doit contenir au moins 8 caractères.'); return }
    setError(null)
    setLoading(true)
    try {
      const res  = await fetch(`${API}/api/v1/auth/reset-password`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ token, password }),
      })
      const data = await res.json() as { ok?: boolean; error?: string }
      if (!res.ok) {
        setError(data.error === 'token_invalid_or_expired'
          ? 'Ce lien est expiré ou déjà utilisé. Refaites une demande.'
          : 'Une erreur est survenue.')
        return
      }
      setDone(true)
      setTimeout(() => router.push('/sign-in'), 2500)
    } catch {
      setError('Impossible de joindre le serveur.')
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <AuthShell
        title="Mot de passe mis à jour."
        description="Votre nouveau mot de passe est actif. Redirection en cours…"
      >
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center">
          <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-500" />
          <p className="mt-4 text-sm font-medium text-[hsl(var(--foreground-soft))]">
            Redirection vers la connexion…
          </p>
        </div>
      </AuthShell>
    )
  }

  return (
    <AuthShell
      title="Nouveau mot de passe."
      description="Choisissez un mot de passe solide pour sécuriser votre accès MERKURE."
    >
      <form onSubmit={handleSubmit} className="rounded-xl border border-[hsl(var(--border))] bg-white p-5 shadow-sm sm:p-6">
        {error && (
          <div className="mb-5 flex items-start gap-3 rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        <div>
          <label htmlFor="password" className="block mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-[hsl(var(--foreground-soft))]">
            Nouveau mot de passe
          </label>
          <div className="relative">
            <LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(var(--foreground-soft)/0.6)]" />
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              required
              minLength={8}
              autoComplete="new-password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Minimum 8 caractères"
              className={inputCls}
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
        </div>

        <div className="mt-4">
          <label htmlFor="confirm" className="block mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-[hsl(var(--foreground-soft))]">
            Confirmation
          </label>
          <div className="relative">
            <LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(var(--foreground-soft)/0.6)]" />
            <input
              id="confirm"
              type={showConfirm ? 'text' : 'password'}
              required
              autoComplete="new-password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              placeholder="Confirmez le mot de passe"
              className={inputCls}
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
        </div>

        <button
          type="submit"
          disabled={loading || !token}
          className="mt-6 flex h-11 w-full items-center justify-center gap-2 rounded-md bg-[hsl(var(--primary))] px-5 text-sm font-semibold text-white transition-colors hover:bg-[hsl(244_42%_44%)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />}
          {loading ? 'Mise à jour…' : 'Mettre à jour le mot de passe'}
        </button>

        <p className="mt-5 text-center text-sm text-[hsl(var(--foreground-soft))]">
          <Link href="/sign-in" className="font-semibold text-[hsl(var(--primary))] underline-offset-4 hover:underline">
            Retour à la connexion
          </Link>
        </p>
      </form>
    </AuthShell>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  )
}
