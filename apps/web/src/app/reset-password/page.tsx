'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

function ResetPasswordForm() {
  const router        = useRouter()
  const searchParams  = useSearchParams()
  const token         = searchParams.get('token') ?? ''

  const [password,  setPassword]  = useState('')
  const [confirm,   setConfirm]   = useState('')
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState<string | null>(null)
  const [done,      setDone]      = useState(false)

  useEffect(() => {
    if (!token) setError('Lien invalide ou expiré.')
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirm) { setError('Les mots de passe ne correspondent pas.'); return }
    if (password.length < 8) { setError('Minimum 8 caractères.'); return }
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
    <main className="min-h-screen bg-[#090d14] px-6 py-12 text-white">
      <div className="mx-auto flex min-h-[calc(100vh-6rem)] max-w-md flex-col items-center justify-center">
        <div className="mb-8 text-center">
          <Link href="/" className="text-2xl font-black tracking-normal">MERKURE</Link>
          <p className="mt-2 text-sm text-gray-400">Nouveau mot de passe</p>
        </div>

        {done ? (
          <div className="w-full rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-center">
            <p className="text-base font-bold text-emerald-300">Mot de passe mis à jour ✓</p>
            <p className="mt-2 text-sm text-emerald-500">Redirection vers la connexion…</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="w-full rounded-xl border border-gray-800 bg-[#111827] p-6 space-y-4">
            <h1 className="text-lg font-bold text-white">Nouveau mot de passe</h1>

            {error && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/30 px-3 py-2 text-sm text-red-400">{error}</div>
            )}

            <div className="space-y-1">
              <label className="text-xs text-gray-400 font-medium">Nouveau mot de passe</label>
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg bg-gray-900 border border-gray-700 px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-gray-400 font-medium">Confirmer le mot de passe</label>
              <input
                type="password"
                required
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg bg-gray-900 border border-gray-700 px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !token}
              className="w-full rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 px-4 py-2.5 text-sm font-semibold text-white transition-colors"
            >
              {loading ? 'Mise à jour…' : 'Mettre à jour le mot de passe'}
            </button>
          </form>
        )}
      </div>
    </main>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  )
}
