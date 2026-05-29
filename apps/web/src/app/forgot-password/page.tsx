'use client'

import { useState } from 'react'
import Link from 'next/link'
import { AlertCircle, CheckCircle2, Mail } from 'lucide-react'

import { AuthShell } from '@/shared/components/AuthShell'

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

export default function ForgotPasswordPage() {
  const [email, setEmail]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [sent, setSent]         = useState(false)
  const [error, setError]       = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await fetch(`${API}/api/v1/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      setSent(true)
    } catch {
      setError('Impossible de joindre le serveur.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell
      eyebrow="Récupération"
      title="Réinitialisez votre accès sans perdre vos repères."
      description="Indiquez l’email associé à votre compte MERKURE. Si le compte existe, un lien de réinitialisation vous sera envoyé."
    >
      {sent ? (
        <div className="rounded-xl border border-emerald-400/25 bg-emerald-400/10 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
          <CheckCircle2 className="h-8 w-8 text-emerald-300" />
          <h2 className="mt-5 text-xl font-black text-white">Email envoyé</h2>
          <p className="mt-3 text-sm font-medium leading-7 text-emerald-100/80">
            Si un compte existe pour <strong>{email}</strong>, vous recevrez un lien dans quelques minutes.
          </p>
          <Link href="/sign-in" className="mt-6 inline-flex text-sm font-black text-white transition-colors hover:text-blue-200">
            Retour à la connexion
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="rounded-xl border border-white/10 bg-white/[0.04] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.25)] sm:p-6">
          <div className="mb-6">
            <h2 className="text-xl font-black text-white">Mot de passe oublié</h2>
            <p className="mt-2 text-sm font-medium text-slate-400">Recevez un lien sécurisé pour définir un nouveau mot de passe.</p>
          </div>

          {error && (
            <div className="mb-5 flex items-start gap-3 rounded-md border border-red-400/25 bg-red-400/10 px-3 py-3 text-sm font-semibold text-red-200">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <label htmlFor="email" className="text-xs font-black uppercase tracking-wider text-slate-400">Email</label>
          <div className="relative mt-2">
            <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="vous@exemple.com"
              className="h-12 w-full rounded-md border border-white/10 bg-[#0b1118] px-3.5 pl-11 text-sm font-semibold text-white outline-none transition-colors placeholder:text-slate-600 focus:border-blue-400/70"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-6 flex h-12 w-full items-center justify-center rounded-md bg-[#56bf6b] px-5 text-sm font-black text-white transition-colors hover:bg-[#49ab5e] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Envoi en cours…' : 'Envoyer le lien'}
          </button>

          <p className="mt-6 text-center text-sm font-semibold text-slate-500">
            Vous avez retrouvé votre mot de passe ?{' '}
            <Link href="/sign-in" className="font-black text-white transition-colors hover:text-blue-200">
              Se connecter
            </Link>
          </p>
        </form>
      )}
    </AuthShell>
  )
}
