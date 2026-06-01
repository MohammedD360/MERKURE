'use client'

import { useState } from 'react'
import { FileText, Download, Loader2 } from 'lucide-react'
import { api } from '@/lib/api-client'

export function ReportsPage() {
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState<string | null>(null)

  async function handleDownload() {
    setLoading(true)
    setError(null)
    try {
      const blob = await api.reports.downloadWeekly()
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href     = url
      a.download = `merkure-rapport-${new Date().toISOString().slice(0, 10)}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      setError('Impossible de générer le rapport. Vérifiez votre abonnement.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-5 px-4 py-5 sm:px-6 lg:px-8">
      <div className="border-b border-slate-800/80 pb-4">
        <p className="text-[11px] font-black uppercase tracking-wider text-slate-500">Analyse</p>
        <h1 className="mt-1 text-xl font-black text-white">Rapports</h1>
        <p className="mt-1 text-sm font-medium text-slate-500">Téléchargez votre rapport hebdomadaire au format PDF.</p>
      </div>

      <div className="rounded-lg border border-slate-800 bg-[#0b111c] p-8 shadow-[0_14px_46px_rgba(0,0,0,0.18)]">
        <div className="flex flex-col items-center justify-center gap-4 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-lg border border-blue-400/20 bg-blue-400/[0.08]">
            <FileText className="h-6 w-6 text-blue-300" />
          </div>
          <div>
            <p className="text-base font-bold text-white">Rapport hebdomadaire</p>
            <p className="mt-1 text-sm text-slate-400">
              Synthèse de votre performance, trades clés et axes de travail pour la semaine.
            </p>
          </div>

          {error && (
            <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-2 text-xs text-red-400">{error}</p>
          )}

          <button
            onClick={handleDownload}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg bg-[#56bf6b] px-6 py-3 text-sm font-black text-white shadow-[0_8px_24px_rgba(86,191,107,0.22)] transition-colors hover:bg-[#49ab5e] disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            {loading ? 'Génération…' : 'Télécharger le rapport PDF'}
          </button>

          <p className="text-[11px] text-slate-600">Plan Pro requis · Rapport généré à la demande</p>
        </div>
      </div>
    </div>
  )
}
