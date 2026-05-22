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
    <div className="space-y-6 px-6 py-5">
      <div className="border-t border-[#1b2a42] pt-4">
        <h2 className="text-base font-bold text-white">Rapports</h2>
        <p className="mt-1 text-xs text-slate-500">Téléchargez votre rapport hebdomadaire au format PDF.</p>
      </div>

      <div className="rounded-2xl border border-[#1e2f4a] bg-[#0b1527] p-8">
        <div className="flex flex-col items-center justify-center gap-4 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#7c5cff]/30 bg-[#7c5cff]/10">
            <FileText className="h-6 w-6 text-[#b9a8ff]" />
          </div>
          <div>
            <p className="text-base font-bold text-white">Rapport hebdomadaire</p>
            <p className="mt-1 text-sm text-slate-400">
              Synthèse de votre performance, trades clés et recommandations IA pour la semaine.
            </p>
          </div>

          {error && (
            <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-2 text-xs text-red-400">{error}</p>
          )}

          <button
            onClick={handleDownload}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl bg-[#7c5cff] px-6 py-3 text-sm font-bold text-white shadow-[0_12px_32px_rgba(124,92,255,0.32)] transition-colors hover:bg-[#8d72ff] disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            {loading ? 'Génération…' : 'Télécharger le rapport PDF'}
          </button>

          <p className="text-[11px] text-slate-600">Plan Elite requis · Rapport généré à la demande</p>
        </div>
      </div>
    </div>
  )
}
