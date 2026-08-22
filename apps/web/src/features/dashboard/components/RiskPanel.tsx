'use client'

import Link from 'next/link'
import { ShieldAlert, AlertTriangle, Settings2 } from 'lucide-react'
import { useRiskStatus } from '@/lib/hooks/use-risk'

function Skeleton() {
  return (
    <div className="animate-pulse space-y-3">
      <div className="grid grid-cols-2 gap-3">
        {[0, 1].map((i) => (
          <div key={i} className="h-16 rounded-lg bg-[hsl(var(--accent))]" />
        ))}
      </div>
      <div className="h-9 w-56 rounded-lg bg-[hsl(var(--accent))]" />
    </div>
  )
}

export function RiskPanel() {
  const { data, isLoading } = useRiskStatus()
  const currentRisk = data?.riskPerTrade ?? 1

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-2xl font-semibold leading-none tracking-tight text-foreground">Gestion du risque</h3>
          <p className="mt-1.5 text-sm text-muted-foreground">Garde-fous et exposition du jour</p>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-md border border-red-500/30 bg-red-500/10 text-red-500">
          <ShieldAlert className="h-4 w-4" />
        </div>
      </div>

      {isLoading || !data ? (
        <Skeleton />
      ) : (
        <div className="space-y-4">
          {/* P&L du jour, P&L 7 jours et pertes consécutives sont déjà dans le
              bandeau d'en-tête : on ne garde ici que ce qui lui est propre. */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-md border border-border p-3">
              <p className="mb-1 text-xs text-muted-foreground">Trades aujourd&apos;hui</p>
              <p className="text-lg font-semibold text-foreground">{data.todayTrades}</p>
            </div>

            <div className="rounded-md border border-border p-3">
              <p className="mb-1 text-xs text-muted-foreground">Risque par trade</p>
              <p className="text-lg font-semibold text-foreground">{currentRisk.toFixed(1)} %</p>
            </div>
          </div>

          {/* Le réglage vit dans Paramètres › Cadre de risque — un seul endroit. */}
          <Link
            href="/app/settings"
            className="inline-flex h-9 items-center gap-2 rounded-md border border-input bg-background px-3 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            <Settings2 className="h-4 w-4" />
            Ajuster le cadre de risque
          </Link>

          {/* Alertes de risque — la carte « Alertes » de la page a été retirée,
              c'est ici que remontent les dépassements. */}
          {data.alerts.length > 0 ? (
            <div className="space-y-2">
              {data.alerts.map((alert, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 rounded-md border border-red-500/30 bg-red-500/10 p-3"
                >
                  <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-500" />
                  <p className="text-sm text-red-500">{alert}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 rounded-md border border-green-500/30 bg-green-500/10 px-2.5 py-1">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
              <span className="text-xs font-medium text-green-500">Aucun dépassement</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
