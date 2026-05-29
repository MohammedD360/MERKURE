'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { AlertCircle, CheckCircle2, Eye, EyeOff, LockKeyhole } from 'lucide-react'

import { AuthShell } from '@/shared/components/AuthShell'

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

function ResetPasswordForm() {
  const router        = useRouter()
  const searchParams  = useSearchParams()
  const token         = searchParams.get('token') ?? ''

  const [password, setPassword]           = useState('')
  const [confirm, setConfirm]             = useState('')
  const [showPassword, setShowPassword]   = useState(false)
  const [showConfirm, setShowConfirm]     = useState(false)
  const [loading, setLoading]             = useState(false)
  const [error, setError]                 = useState<string | null>(null)
  const [done, setDone]                   = useState(false)

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
      const res = await fetch(`${API}/api/v1/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
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

  return (
    <AuthShell
      eyebrow="Sécurité"
      title="Définissez un nouveau mot de passe."
      description="Choisissez un mot de passe solide pour sécuriser votre accès à l’espace MERKURE."
    >
      {done ? (
        <div className="rounded-xl border border-emerald-400/25 bg-emerald-400/10 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
          <CheckCircle2 className="h-8 w-8 text-emerald-300" />
          <h2 className="mt-5 text-xl font-black text-white">Mot de passe mis à jour</h2>
          <p className="mt-3 text-sm font-medium leading-7 text-emerald-100/80">Redirection vers la connexion…</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="rounded-xl border border-white/10 bg-white/[0.04] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.25)] sm:p-6">
          <div className="mb-6">
            <h2 className="text-xl font-black text-white">Nouveau mot de passe</h2>
            <p className="mt-2 text-sm font-medium text-slate-400">Minimum 8 caractères. Utilisez un mot de passe unique.</p>
          </div>

          {error && (
            <div className="mb-5 flex items-start gap-3 rounded-md border border-red-400/25 bg-red-400/10 px-3 py-3 text-sm font-semibold text-red-200">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <div>
            <label htmlFor="password" className="text-xs font-black uppercase tracking-wider text-slate-400">Nouveau mot de passe</label>
            <div className="relative mt-2">
              <LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                required
                minLength={8}
                autoComplete="new-password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Minimum 8 caractères"
                className="h-12 w-full rounded-md border border-white/10 bg-[#0b1118] px-3.5 pl-11 pr-11 text-sm font-semibold text-white outline-none transition-colors placeholder:text-slate-600 focus:border-blue-400/70"
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-white/5 hover:text-white"
                aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="mt-5">
            <label htmlFor="confirm" className="text-xs font-black uppercase tracking-wider text-slate-400">Confirmation</label>
            <div className="relative mt-2">
              <LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                id="confirm"
                type={showConfirm ? 'text' : 'password'}
                required
                autoComplete="new-password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                placeholder="Confirmez le mot de passe"
                className="h-12 w-full rounded-md border border-white/10 bg-[#0b1118] px-3.5 pl-11 pr-11 text-sm font-semibold text-white outline-none transition-colors placeholder:text-slate-600 focus:border-blue-400/70"
              />
              <button
                type="button"
                onClick={() => setShowConfirm((value) => !value)}
                className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-white/5 hover:text-white"
                aria-label={showConfirm ? 'Masquer la confirmation' : 'Afficher la confirmation'}
              >
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !token}
            className="mt-6 flex h-12 w-full items-center justify-center rounded-md bg-[#56bf6b] px-5 text-sm font-black text-white transition-colors hover:bg-[#49ab5e] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Mise à jour…' : 'Mettre à jour le mot de passe'}
          </button>

          <p className="mt-6 text-center text-sm font-semibold text-slate-500">
            <Link href="/sign-in" className="font-black text-white transition-colors hover:text-blue-200">
              Retour à la connexion
            </Link>
          </p>
        </form>
      )}
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
