'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { isClerkEnabled } from '@/lib/auth-mode'
import { SignIn } from '@clerk/nextjs'
import { setToken } from '@/lib/api-client'

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

function DemoLoginForm() {
  const router = useRouter()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState<string | null>(null)
  const [loading, setLoading]   = useState(false)

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
        setError(data.error === 'invalid_credentials'
          ? 'Email ou mot de passe incorrect.'
          : 'Erreur de connexion. Veuillez réessayer.')
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
    <form onSubmit={handleSubmit} className="w-full rounded-xl border border-gray-800 bg-[#111827] p-6 space-y-4">
      <h1 className="text-lg font-bold text-white">Connexion</h1>

      {error && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/30 px-3 py-2 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="space-y-1">
        <label className="text-xs text-gray-400 font-medium">Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="demo@merkure.app"
          className="w-full rounded-lg bg-gray-900 border border-gray-700 px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors"
        />
      </div>

      <div className="space-y-1">
        <label className="text-xs text-gray-400 font-medium">Mot de passe</label>
        <input
          type="password"
          required
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="••••••••"
          className="w-full rounded-lg bg-gray-900 border border-gray-700 px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2.5 text-sm font-semibold text-white transition-colors"
      >
        {loading ? 'Connexion…' : 'Se connecter'}
      </button>
    </form>
  )
}

export default function SignInPage() {
  return (
    <main className="min-h-screen bg-[#090d14] px-6 py-12 text-white">
      <div className="mx-auto flex min-h-[calc(100vh-6rem)] max-w-md flex-col items-center justify-center">
        <div className="mb-8 text-center">
          <Link href="/" className="text-2xl font-black tracking-normal">
            MERKURE
          </Link>
          <p className="mt-2 text-sm text-gray-400">Connexion au cockpit trading.</p>
        </div>

        {isClerkEnabled ? <SignIn /> : <DemoLoginForm />}
      </div>
    </main>
  )
}
