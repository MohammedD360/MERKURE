'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'

export default function VerifyEmailPage() {
  const params = useSearchParams()
  const token = params.get('token')
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')

  useEffect(() => {
    if (!token) { setStatus('error'); return }
    const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'
    fetch(`${API}/api/v1/auth/verify-email?token=${encodeURIComponent(token)}`)
      .then((r) => { setStatus(r.ok ? 'success' : 'error') })
      .catch(() => setStatus('error'))
  }, [token])

  return (
    <div className="min-h-screen bg-[#070b10] flex items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#0b111c] p-8 text-center space-y-5">
        {status === 'loading' && (
          <>
            <Loader2 className="mx-auto h-10 w-10 text-blue-400 animate-spin" />
            <p className="text-white font-bold">Vérification en cours…</p>
          </>
        )}
        {status === 'success' && (
          <>
            <CheckCircle className="mx-auto h-10 w-10 text-[#56bf6b]" />
            <div>
              <p className="text-lg font-black text-white">Email vérifié !</p>
              <p className="text-sm text-slate-400 mt-1">Votre adresse email a été confirmée avec succès.</p>
            </div>
            <Link href="/app/dashboard" className="inline-block rounded-xl bg-[#56bf6b] hover:bg-[#49ab5e] px-6 py-2.5 text-sm font-black text-white transition-colors">
              Accéder au dashboard →
            </Link>
          </>
        )}
        {status === 'error' && (
          <>
            <XCircle className="mx-auto h-10 w-10 text-red-400" />
            <div>
              <p className="text-lg font-black text-white">Lien invalide</p>
              <p className="text-sm text-slate-400 mt-1">Ce lien est invalide ou a déjà été utilisé.</p>
            </div>
            <Link href="/app/dashboard" className="inline-block rounded-xl border border-white/10 bg-white/[0.05] px-6 py-2.5 text-sm font-black text-white transition-colors hover:bg-white/[0.08]">
              Retour au dashboard
            </Link>
          </>
        )}
      </div>
    </div>
  )
}
