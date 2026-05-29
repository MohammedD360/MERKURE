'use client'

import { useState } from 'react'
import { AlertTriangle, Bell, BellOff, CheckCheck, Info, ShieldAlert, Trash2 } from 'lucide-react'
import { useAlerts, useDeleteAlert, useMarkAllAlertsRead, useMarkAlertRead } from '@/lib/hooks/use-alerts'
import type { Alert } from '@/lib/api-client'

function severityConfig(severity: Alert['severity']) {
  switch (severity) {
    case 'CRITICAL': return { icon: ShieldAlert, color: 'text-[#ff5e70]', bg: 'bg-[#ff5e70]/10', border: 'border-[#ff5e70]/25' }
    case 'WARNING':  return { icon: AlertTriangle, color: 'text-[#f7b84b]', bg: 'bg-[#f7b84b]/10', border: 'border-[#f7b84b]/25' }
    default:         return { icon: Info, color: 'text-[#18c7ff]', bg: 'bg-[#18c7ff]/10', border: 'border-[#18c7ff]/25' }
  }
}

function AlertCard({ alert }: { alert: Alert }) {
  const markRead = useMarkAlertRead()
  const deleteAlert = useDeleteAlert()
  const { icon: Icon, color, bg, border } = severityConfig(alert.severity)

  return (
    <div
      className={`group relative flex items-start gap-4 rounded-2xl border p-4 transition-all ${
        alert.isRead
          ? 'border-[#1e2f4a] bg-[#0b1527]/60 opacity-60'
          : `${border} ${bg} cursor-pointer hover:opacity-90`
      }`}
      onClick={() => { if (!alert.isRead) markRead.mutate(alert.id) }}
    >
      {!alert.isRead && (
        <span className="absolute right-4 top-4 h-2 w-2 rounded-full bg-[#7c5cff]" />
      )}

      <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border ${border} ${bg}`}>
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
        <div key={i} className="h-20 animate-pulse rounded-2xl bg-white/[0.04]" />
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
    <div className="space-y-6 px-6 py-5">
      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[#1b2a42] pt-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#f7b84b]/30 bg-[#f7b84b]/10">
            <Bell className="h-5 w-5 text-[#f7b84b]" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Alertes</h2>
            <p className="text-xs text-slate-500">{total} alerte{total !== 1 ? 's' : ''} au total</p>
          </div>
          {unreadCount > 0 && (
            <span className="rounded-full bg-[#7c5cff] px-2.5 py-0.5 text-xs font-bold text-white">
              {unreadCount} non lue{unreadCount > 1 ? 's' : ''}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="inline-flex overflow-hidden rounded-xl border border-[#20314d] bg-[#07101f] p-1">
            <button
              onClick={() => setUnreadOnly(false)}
              className={`rounded-lg px-4 py-2 text-xs font-semibold transition-colors ${
                !unreadOnly ? 'bg-[#6d4cff] text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Toutes
            </button>
            <button
              onClick={() => setUnreadOnly(true)}
              className={`rounded-lg px-4 py-2 text-xs font-semibold transition-colors ${
                unreadOnly ? 'bg-[#6d4cff] text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Non lues
            </button>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={() => markAll.mutate()}
              disabled={markAll.isPending}
              className="inline-flex items-center gap-2 rounded-xl border border-[#1e2f4a] px-4 py-2 text-xs font-semibold text-slate-400 transition-colors hover:bg-white/[0.04] hover:text-slate-200 disabled:opacity-50"
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
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#1e2f4a] bg-[#07101f]/50 py-20 text-center">
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
