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
      <div className="border-b border-border pb-4">
        <p className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">Analyse</p>
        <h1 className="mt-1 text-xl font-black text-foreground">Rapports</h1>
        <p className="mt-1 text-sm font-medium text-muted-foreground">Téléchargez votre rapport hebdomadaire au format PDF.</p>
      </div>

      <div className="rounded-lg border border-border bg-background p-8 shadow-sm">
        <div className="flex flex-col items-center justify-center gap-4 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-lg border border-[hsl(var(--primary)/0.2)] bg-[hsl(var(--primary)/0.08)]">
            <FileText className="h-6 w-6 text-[hsl(var(--primary))]" />
          </div>
          <div>
            <p className="text-base font-bold text-foreground">Rapport hebdomadaire</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Synthèse de votre performance, trades clés et axes de travail pour la semaine.
            </p>
          </div>

          {error && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-xs text-red-500">{error}</p>
          )}

          <button
            onClick={handleDownload}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg bg-[hsl(var(--primary))] px-6 py-3 text-sm font-black text-white shadow-sm transition-colors hover:bg-[hsl(244_42%_44%)] disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            {loading ? 'Génération…' : 'Télécharger le rapport PDF'}
          </button>

          <p className="text-[11px] text-muted-foreground/60">Plan Pro requis · Rapport généré à la demande</p>
        </div>
      </div>
    </div>
  )
}
