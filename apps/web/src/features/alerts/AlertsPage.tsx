'use client'

import { useState } from 'react'
import { AlertTriangle, Bell, BellOff, CheckCheck, Info, ShieldAlert, Trash2 } from 'lucide-react'
import { useAlerts, useDeleteAlert, useMarkAllAlertsRead, useMarkAlertRead } from '@/lib/hooks/use-alerts'
import type { Alert } from '@/lib/api-client'

function severityConfig(severity: Alert['severity']) {
  switch (severity) {
    case 'CRITICAL': return { icon: ShieldAlert, color: 'text-rose-300', bg: 'bg-rose-400/[0.08]', border: 'border-rose-400/25' }
    case 'WARNING':  return { icon: AlertTriangle, color: 'text-amber-300', bg: 'bg-amber-400/[0.08]', border: 'border-amber-400/25' }
    default:         return { icon: Info, color: 'text-blue-300', bg: 'bg-blue-400/[0.08]', border: 'border-blue-400/25' }
  }
}

function AlertCard({ alert }: { alert: Alert }) {
  const markRead = useMarkAlertRead()
  const deleteAlert = useDeleteAlert()
  const { icon: Icon, color, bg, border } = severityConfig(alert.severity)

  return (
    <div
      className={`group relative flex items-start gap-4 rounded-lg border p-4 transition-all ${
        alert.isRead
          ? 'border-slate-800 bg-background/70 opacity-60'
          : `${border} ${bg} cursor-pointer hover:opacity-90`
      }`}
      onClick={() => { if (!alert.isRead) markRead.mutate(alert.id) }}
    >
      {!alert.isRead && (
        <span className="absolute right-4 top-4 h-2 w-2 rounded-full bg-[#56bf6b]" />
      )}

      <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md border ${border} ${bg}`}>
        <Icon className={`h-4 w-4 ${color}`} />
      </div>

      <div className="min-w-0 flex-1 pr-6">
        <p className={`text-sm font-bold ${alert.isRead ? 'text-slate-400' : 'text-white'}`}>{alert.title}</p>
        {alert.body && <p className="mt-1 text-xs text-slate-500 leading-relaxed">{alert.body}</p>}
        <p className="mt-2 text-[11px] text-slate-600">
          {new Date(alert.triggeredAt).toLocaleDateString('fr-FR', {
            day: 'numeric', month: 'long', year: 'numeric',
            hour: '2-digit', minute: '2-digit',
          })}
        </p>
      </div>

      <button
        onClick={(e) => { e.stopPropagation(); deleteAlert.mutate(alert.id) }}
        className="absolute right-4 bottom-4 hidden rounded-lg p-1.5 text-slate-600 transition-colors hover:bg-white/[0.06] hover:text-slate-300 group-hover:flex"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}

function Skeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-20 animate-pulse rounded-lg bg-white/[0.04]" />
      ))}
    </div>
  )
}

export function AlertsPage() {
  const [unreadOnly, setUnreadOnly] = useState(false)
  const { data, isLoading } = useAlerts(unreadOnly)
  const markAll = useMarkAllAlertsRead()

  const alerts = data?.alerts ?? []
  const total = data?.total ?? 0
  const unreadCount = alerts.filter(a => !a.isRead).length

  return (
    <div className="space-y-5 px-4 py-5 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md border border-amber-400/20 bg-amber-400/[0.08]">
            <Bell className="h-5 w-5 text-amber-300" />
          </div>
          <div>
            <p className="text-[11px] font-black uppercase tracking-wider text-slate-500">Compte</p>
            <h1 className="mt-1 text-xl font-black text-white">Alertes</h1>
            <p className="mt-1 text-sm font-medium text-slate-500">{total} alerte{total !== 1 ? 's' : ''} au total</p>
          </div>
          {unreadCount > 0 && (
            <span className="rounded-full bg-[#56bf6b] px-2.5 py-0.5 text-xs font-bold text-white">
              {unreadCount} non lue{unreadCount > 1 ? 's' : ''}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="inline-flex overflow-hidden rounded-md border border-slate-800 bg-[#071017] p-1">
            <button
              onClick={() => setUnreadOnly(false)}
              className={`rounded-lg px-4 py-2 text-xs font-semibold transition-colors ${
                !unreadOnly ? 'bg-[#56bf6b] text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Toutes
            </button>
            <button
              onClick={() => setUnreadOnly(true)}
              className={`rounded-lg px-4 py-2 text-xs font-semibold transition-colors ${
                unreadOnly ? 'bg-[#56bf6b] text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Non lues
            </button>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={() => markAll.mutate()}
              disabled={markAll.isPending}
              className="inline-flex items-center gap-2 rounded-md border border-slate-800 bg-background px-4 py-2 text-xs font-black text-slate-400 transition-colors hover:bg-white/[0.04] hover:text-slate-200 disabled:opacity-50"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Tout marquer comme lu
            </button>
          )}
        </div>
      </div>

      {isLoading ? (
        <Skeleton />
      ) : alerts.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-800 bg-[#071017]/70 py-20 text-center">
          <BellOff className="mb-4 h-10 w-10 text-slate-600" />
          <p className="text-sm font-semibold text-slate-400">
            {unreadOnly ? 'Aucune alerte non lue' : 'Aucune alerte'}
          </p>
          <p className="mt-1 text-xs text-slate-600">
            {unreadOnly
              ? 'Vous êtes à jour !'
              : 'Les alertes drawdown et erreurs de sync apparaîtront ici.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map(alert => <AlertCard key={alert.id} alert={alert} />)}
        </div>
      )}
    </div>
  )
}
