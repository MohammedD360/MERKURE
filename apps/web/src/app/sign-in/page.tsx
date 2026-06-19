'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AlertCircle, Eye, EyeOff } from 'lucide-react'
import { SignIn } from '@clerk/nextjs'

import { isClerkEnabled } from '@/lib/auth-mode'
import { setToken } from '@/lib/api-client'
import { AuthShell } from '@/shared/components/AuthShell'
import { GoogleAuthButton } from '@/shared/components/GoogleAuthButton'

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

const inputCls =
  'h-11 w-full rounded-md border border-[hsl(var(--border))] bg-white px-4 text-sm font-medium text-foreground outline-none transition-all placeholder:text-[hsl(var(--foreground-soft)/0.5)] focus:border-[hsl(var(--primary)/0.5)] focus:ring-2 focus:ring-[hsl(var(--primary)/0.08)]'

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
      <form onSubmit={handleSubmit} className="space-y-3">
        {error && (
          <div className="flex items-start gap-3 rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        <div className="space-y-3">
          <div>
            <label htmlFor="email" className="block mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-[hsl(var(--foreground-soft))]">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="nom@exemple.com"
              className={inputCls}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="password" className="text-[11px] font-semibold uppercase tracking-wider text-[hsl(var(--foreground-soft))]">
                Mot de passe
              </label>
              <Link
                href="/forgot-password"
                className="text-xs font-medium text-[hsl(var(--primary))] underline-offset-4 hover:underline"
              >
                Oublié ?
              </Link>
            </div>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Mot de passe"
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
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-md bg-[hsl(var(--primary))] px-5 text-sm font-semibold text-white transition-colors hover:bg-[hsl(244_42%_44%)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading && (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          )}
          {loading ? 'Connexion…' : 'Se connecter'}
        </button>
      </form>

      <div className="relative py-3">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-[hsl(var(--border))]" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-3 font-semibold text-[hsl(var(--foreground-soft))]">Ou continuer avec</span>
        </div>
      </div>

      <GoogleAuthButton label="Google" />

      <p className="px-2 text-center text-[13px] leading-5 text-[hsl(var(--foreground-soft))]">
        En cliquant sur continuer, vous acceptez nos{' '}
        <Link href="/legal/cgu" className="text-foreground underline underline-offset-4 hover:text-[hsl(var(--primary))]">
          Conditions d&apos;utilisation
        </Link>{' '}
        et{' '}
        <Link href="/legal/confidentialite" className="text-foreground underline underline-offset-4 hover:text-[hsl(var(--primary))]">
          Politique de confidentialité
        </Link>
        .
      </p>

      <p className="text-center text-sm text-[hsl(var(--foreground-soft))]">
        Pas encore de compte ?{' '}
        <Link href="/sign-up" className="font-semibold text-[hsl(var(--primary))] underline-offset-4 hover:underline">
          Créer un compte
        </Link>
      </p>
    </div>
  )
}

function ClerkLogin() {
  return (
    <div className="rounded-xl border border-[hsl(var(--border))] bg-white p-3 shadow-sm">
      <SignIn />
    </div>
  )
}

export default function SignInPage() {
  return (
    <AuthShell
      title="Bon retour."
      description="Entrez vos identifiants pour accéder à votre espace MERKURE."
    >
      {isClerkEnabled ? <ClerkLogin /> : <PasswordLoginForm />}
    </AuthShell>
  )
}
