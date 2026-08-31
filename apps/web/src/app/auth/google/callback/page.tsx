'use client'

import { Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { setToken } from '@/lib/api-client'

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

function Callback() {
  const router       = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const code = searchParams.get('code')
    if (!code) {
      router.replace('/sign-in?error=google_failed')
      return
    }

    // Le code est opaque, à usage unique et expire en 60s — le vrai jeton ne
    // transite jamais par l'URL (voir google-oauth.routes.ts).
    fetch(`${API}/api/v1/auth/google/exchange`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ code }),
    })
      .then(res => res.ok ? res.json() as Promise<{ token: string }> : Promise.reject())
      .then(({ token }) => {
        setToken(token)
        router.replace('/app/dashboard')
      })
      .catch(() => {
        router.replace('/sign-in?error=google_failed')
      })
  }, [searchParams, router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-white/10 border-t-white" />
        <p className="text-sm font-semibold text-slate-400">Connexion en cours…</p>
      </div>
    </div>
  )
}

export default function GoogleCallbackPage() {
  return (
    <Suspense>
      <Callback />
    </Suspense>
  )
}
