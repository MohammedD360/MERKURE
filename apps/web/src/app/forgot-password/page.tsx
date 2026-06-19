'use client'

import { useState } from 'react'
import Link from 'next/link'
import { AlertCircle, CheckCircle2, Mail } from 'lucide-react'

import { AuthShell } from '@/shared/components/AuthShell'

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

export default function ForgotPasswordPage() {
  const [email, setEmail]     = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent]       = useState(false)
  const [error, setError]     = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await fetch(`${API}/api/v1/auth/forgot-password`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email }),
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
      title="Réinitialisez votre accès."
      description="Indiquez l'email de votre compte MERKURE. Un lien de réinitialisation vous sera envoyé."
    >
      {sent ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6">
          <CheckCircle2 className="h-8 w-8 text-emerald-500" />
          <h2 className="mt-4 text-lg font-semibold text-foreground">Email envoyé</h2>
          <p className="mt-2 text-sm leading-6 text-[hsl(var(--foreground-soft))]">
            Si un compte existe pour <strong className="text-foreground">{email}</strong>, vous recevrez un lien dans quelques minutes.
          </p>
          <Link
            href="/sign-in"
            className="mt-5 inline-flex text-sm font-semibold text-[hsl(var(--primary))] underline-offset-4 hover:underline"
          >
            Retour à la connexion
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="rounded-xl border border-[hsl(var(--border))] bg-white p-5 shadow-sm sm:p-6">
          {error && (
            <div className="mb-5 flex items-start gap-3 rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <label htmlFor="email" className="block mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-[hsl(var(--foreground-soft))]">
            Email
          </label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(var(--foreground-soft)/0.6)]" />
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="vous@exemple.com"
              className="h-12 w-full rounded-lg border border-[hsl(var(--border))] bg-white px-3.5 pl-11 text-sm font-medium text-foreground outline-none transition-all placeholder:text-[hsl(var(--foreground-soft)/0.45)] focus:border-[hsl(var(--primary)/0.5)] focus:ring-2 focus:ring-[hsl(var(--primary)/0.08)]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-md bg-[hsl(var(--primary))] px-5 text-sm font-semibold text-white transition-colors hover:bg-[hsl(244_42%_44%)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />}
            {loading ? 'Envoi en cours…' : 'Envoyer le lien'}
          </button>

          <p className="mt-5 text-center text-sm text-[hsl(var(--foreground-soft))]">
            Vous avez retrouvé votre mot de passe ?{' '}
            <Link href="/sign-in" className="font-semibold text-[hsl(var(--primary))] underline-offset-4 hover:underline">
              Se connecter
            </Link>
          </p>
        </form>
      )}
    </AuthShell>
  )
}
