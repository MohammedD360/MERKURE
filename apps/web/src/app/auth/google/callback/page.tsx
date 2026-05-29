'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { setToken } from '@/lib/api-client'

export default function GoogleCallbackPage() {
  const router       = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const token = searchParams.get('token')
    if (token) {
      setToken(token)
      router.replace('/app/dashboard')
    } else {
      router.replace('/sign-in?error=google_failed')
    }
  }, [searchParams, router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#070b12]">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-white/10 border-t-white" />
        <p className="text-sm font-semibold text-slate-400">Connexion en cours…</p>
      </div>
    </div>
  )
}
