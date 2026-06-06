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

const inputClass =
  'h-11 w-full rounded-md border border-white/10 bg-black px-4 text-sm font-medium text-white outline-none transition-colors placeholder:text-zinc-500 focus:border-white/30'

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
        <div className="grid h-[50px] grid-cols-2 rounded-md bg-[#2a2927] p-1">
          <button
            type="button"
            disabled
            title="Connexion sans mot de passe indisponible pour le moment"
            className="relative rounded-[5px] text-sm font-semibold text-zinc-400"
          >
            Email uniquement
          </button>
          <button
            type="button"
            className="relative rounded-[5px] bg-black text-sm font-semibold text-white shadow-sm"
          >
            <span className="absolute right-2 top-0 -translate-y-1/2 text-[10px] font-bold text-white">
              Nouveau
            </span>
            Mot de passe
          </button>
        </div>

        {error && (
          <div className="flex items-start gap-3 rounded-md border border-red-400/25 bg-red-400/[0.08] px-4 py-3 text-sm font-semibold text-red-200">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label htmlFor="email" className="sr-only">
              Email
            </label>
            <div className="relative">
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="nom@exemple.com"
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between gap-4">
              <label htmlFor="password" className="sr-only">
                Mot de passe
              </label>
              <Link
                href="/forgot-password"
                className="ml-auto text-xs font-semibold text-zinc-400 underline-offset-4 transition-colors hover:text-white hover:underline"
              >
                Oublié ?
              </Link>
            </div>
            <div className="relative mt-2">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Mot de passe"
                className={`${inputClass} pr-11`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-zinc-500 transition-colors hover:bg-white/5 hover:text-white"
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
          className="flex h-11 w-full items-center justify-center gap-2 rounded-md bg-white px-5 text-sm font-semibold text-zinc-900 transition-colors hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading && (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-900 border-t-transparent" />
          )}
          {loading ? 'Connexion en cours...' : 'Se connecter'}
        </button>
      </form>

      <div className="relative py-3">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-white/10" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-black px-3 font-semibold text-zinc-500">Ou continuer avec</span>
        </div>
      </div>

      <GoogleAuthButton label="Google" variant="subtle" />

      <p className="px-4 text-center text-sm font-medium leading-6 text-zinc-400">
        En cliquant sur continuer, vous acceptez nos{' '}
        <Link href="/legal/cgu" className="underline underline-offset-4 hover:text-white">
          Conditions d&apos;utilisation
        </Link>{' '}
        et{' '}
        <Link href="/legal/confidentialite" className="underline underline-offset-4 hover:text-white">
          Politique de confidentialité
        </Link>
        .
      </p>

      <p className="text-center text-sm font-medium text-zinc-500">
        Pas encore de compte ?{' '}
        <Link href="/sign-up" className="font-semibold text-white underline-offset-4 hover:underline">
          Créer un compte
        </Link>
      </p>
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
      title="Authentification"
      description="Entrez votre email et votre mot de passe pour vous connecter à votre espace MERKURE."
    >
      {isClerkEnabled ? <ClerkLogin /> : <PasswordLoginForm />}
    </AuthShell>
  )
}
