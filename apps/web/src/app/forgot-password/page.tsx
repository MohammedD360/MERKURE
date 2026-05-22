'use client'

import { useState } from 'react'
import Link from 'next/link'

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
    <main className="min-h-screen bg-[#090d14] px-6 py-12 text-white">
      <div className="mx-auto flex min-h-[calc(100vh-6rem)] max-w-md flex-col items-center justify-center">
        <div className="mb-8 text-center">
          <Link href="/" className="text-2xl font-black tracking-normal">MERKURE</Link>
          <p className="mt-2 text-sm text-gray-400">Réinitialisation du mot de passe</p>
        </div>

        {sent ? (
          <div className="w-full rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-center">
            <p className="text-base font-bold text-emerald-300">Email envoyé ✓</p>
            <p className="mt-2 text-sm text-emerald-500">
              Si un compte existe pour <strong>{email}</strong>, vous recevrez un lien dans quelques minutes.
            </p>
            <Link href="/sign-in" className="mt-4 inline-block text-sm text-slate-400 hover:text-white transition-colors">
              ← Retour à la connexion
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="w-full rounded-xl border border-gray-800 bg-[#111827] p-6 space-y-4">
            <div>
              <h1 className="text-lg font-bold text-white">Mot de passe oublié ?</h1>
              <p className="mt-1 text-sm text-gray-400">Entrez votre email pour recevoir un lien de réinitialisation.</p>
            </div>

            {error && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/30 px-3 py-2 text-sm text-red-400">{error}</div>
            )}

            <div className="space-y-1">
              <label className="text-xs text-gray-400 font-medium">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="vous@example.com"
                className="w-full rounded-lg bg-gray-900 border border-gray-700 px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 px-4 py-2.5 text-sm font-semibold text-white transition-colors"
            >
              {loading ? 'Envoi…' : 'Envoyer le lien'}
            </button>

            <p className="text-center text-xs text-gray-500">
              <Link href="/sign-in" className="text-indigo-400 hover:underline">← Retour à la connexion</Link>
            </p>
          </form>
        )}
      </div>
    </main>
  )
}
