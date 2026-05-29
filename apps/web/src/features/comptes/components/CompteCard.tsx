'use client'

import { useState, type ReactNode } from 'react'
import {
  AlertTriangle,
  ArrowLeftRight,
  Clock,
  Loader2,
  RefreshCw,
  Unlink,
  Wifi,
  WifiOff,
} from 'lucide-react'
import { brokerMeta } from '@/lib/mock-comptes'
import {
  useDeleteAccount,
  useSyncAccount,
  type BrokerAccount,
  type BrokerType,
  type SyncStatus,
} from '@/lib/hooks/use-accounts'

const ACCOUNT_TYPE_LABEL: Record<string, string> = {
  LIVE: 'Live',
  DEMO: 'Démo',
  PROP_FUNDED: 'Prop Funded',
  PROP_CHALLENGE: 'Prop Challenge',
}

function formatLastSync(iso: string | null) {
  if (!iso) return 'Jamais synchronisé'

  const date = new Date(iso)
  const diffMinutes = Math.round((Date.now() - date.getTime()) / 60000)

  if (diffMinutes < 1) return 'À l’instant'
  if (diffMinutes < 60) return `Il y a ${diffMinutes} min`
  if (diffMinutes < 1440) return `Il y a ${Math.round(diffMinutes / 60)}h`

  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
}

function SyncBadge({ status, lastSyncAt }: { status: SyncStatus; lastSyncAt: string | null }) {
  const configs: Record<SyncStatus, { icon: ReactNode; text: string; className: string }> = {
    SUCCESS: {
      icon: <Wifi className="h-3.5 w-3.5" />,
      text: formatLastSync(lastSyncAt),
      className: 'border-emerald-400/20 bg-emerald-400/[0.08] text-emerald-300',
    },
    SYNCING: {
      icon: <Loader2 className="h-3.5 w-3.5 animate-spin" />,
      text: 'Synchronisation',
      className: 'border-blue-400/20 bg-blue-400/[0.08] text-blue-300',
    },
    ERROR: {
      icon: <WifiOff className="h-3.5 w-3.5" />,
      text: 'Erreur de sync',
      className: 'border-rose-400/20 bg-rose-400/[0.08] text-rose-300',
    },
    PENDING: {
      icon: <Clock className="h-3.5 w-3.5" />,
      text: 'En attente',
      className: 'border-white/10 bg-white/[0.04] text-slate-400',
    },
  }

  const config = configs[status]

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] font-black ${config.className}`}>
      {config.icon}
      {config.text}
    </span>
  )
}

function ActionButton({
  children,
  title,
  onClick,
  disabled,
  danger,
}: {
  children: ReactNode
  title: string
  onClick: () => void
  disabled?: boolean
  danger?: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`flex h-9 w-9 items-center justify-center rounded-lg border transition-colors disabled:cursor-not-allowed disabled:opacity-45 ${
        danger
          ? 'border-rose-400/30 bg-rose-400/[0.08] text-rose-300 hover:bg-rose-400/[0.14]'
          : 'border-white/10 bg-white/[0.04] text-slate-500 hover:bg-white/[0.07] hover:text-white'
      }`}
    >
      {children}
    </button>
  )
}

function InfoItem({ label, value, helper }: { label: string; value: string; helper: string }) {
  return (
    <div className="rounded-lg border border-white/[0.06] bg-[#071017] p-4">
      <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-600">{label}</p>
      <p className="mt-2 truncate text-sm font-black text-white">{value}</p>
      <p className="mt-1 truncate text-[11px] font-semibold text-slate-500">{helper}</p>
    </div>
  )
}

interface Props {
  compte: BrokerAccount
  onNavigateToTrades?: (accountId: string) => void
}

export function CompteCard({ compte, onNavigateToTrades }: Props) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const meta = brokerMeta[compte.brokerType as BrokerType] ?? brokerMeta.MT5
  const hasError = compte.syncStatus === 'ERROR'

  const { mutate: sync, isPending: syncing } = useSyncAccount()
  const { mutate: remove, isPending: deleting } = useDeleteAccount()

  const handleSync = () => sync(compte.id)
  const handleDelete = () => {
    if (!confirmDelete) {
      setConfirmDelete(true)
      return
    }

    remove(compte.id)
  }

  return (
    <article
      className={`overflow-hidden rounded-xl border bg-[#0b111c] shadow-[0_12px_46px_rgba(0,0,0,0.18)] transition-colors ${
        hasError ? 'border-rose-400/30' : 'border-white/10 hover:border-white/20'
      }`}
    >
      <div className="border-b border-white/[0.06] p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-sm font-black"
              style={{
                backgroundColor: meta.bg,
                color: meta.color,
                border: `1px solid ${meta.color}40`,
              }}
            >
              {compte.brokerType === 'MT4' || compte.brokerType === 'MT5' ? 'MT' : compte.brokerType.slice(0, 2)}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="truncate text-sm font-black text-white">{compte.label}</h3>
                <span className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-1 text-[10px] font-black uppercase tracking-[0.08em] text-slate-500">
                  {ACCOUNT_TYPE_LABEL[compte.accountType] ?? compte.accountType}
                </span>
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs font-semibold">
                <span style={{ color: meta.color }}>{meta.name}</span>
                <span className="text-slate-700">/</span>
                <span className="font-mono text-slate-500">#{compte.accountId}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:justify-end">
            <SyncBadge status={compte.syncStatus} lastSyncAt={compte.lastSyncAt} />
            <ActionButton
              onClick={handleSync}
              disabled={syncing || compte.syncStatus === 'SYNCING'}
              title="Synchroniser maintenant"
            >
              <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
            </ActionButton>
            <ActionButton
              onClick={() => onNavigateToTrades?.(compte.id)}
              title="Voir les trades"
            >
              <ArrowLeftRight className="h-4 w-4" />
            </ActionButton>
            <ActionButton
              onClick={handleDelete}
              disabled={deleting}
              title={confirmDelete ? 'Confirmer la suppression' : 'Déconnecter ce compte'}
              danger={confirmDelete}
            >
              <Unlink className="h-4 w-4" />
            </ActionButton>
          </div>
        </div>

        {confirmDelete && (
          <div className="mt-4 flex flex-col gap-3 rounded-lg border border-rose-400/20 bg-rose-400/[0.08] px-4 py-3 sm:flex-row sm:items-center">
            <AlertTriangle className="h-4 w-4 shrink-0 text-rose-300" />
            <p className="flex-1 text-xs font-semibold leading-6 text-rose-200">
              Cliquez à nouveau sur l’icône de déconnexion pour confirmer la suppression.
            </p>
            <button
              onClick={() => setConfirmDelete(false)}
              className="text-left text-xs font-black text-slate-400 transition-colors hover:text-white sm:text-right"
            >
              Annuler
            </button>
          </div>
        )}

        {hasError && compte.syncError && !confirmDelete && (
          <div className="mt-4 flex flex-col gap-3 rounded-lg border border-rose-400/20 bg-rose-400/[0.08] px-4 py-3 sm:flex-row sm:items-start">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rose-300" />
            <p className="flex-1 text-xs font-semibold leading-6 text-rose-200">{compte.syncError}</p>
            <button
              onClick={handleSync}
              disabled={syncing}
              className="text-left text-xs font-black text-rose-200 transition-colors hover:text-white disabled:opacity-45 sm:text-right"
            >
              Relancer
            </button>
          </div>
        )}
      </div>

      <div className="grid gap-3 p-5 sm:grid-cols-3">
        <InfoItem label="Broker" value={meta.name} helper={meta.desc} />
        <InfoItem label="Compte" value={`#${compte.accountId}`} helper={ACCOUNT_TYPE_LABEL[compte.accountType] ?? compte.accountType} />
        <InfoItem
          label="Connecté le"
          value={new Date(compte.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
          helper={
            compte.syncStatus === 'SUCCESS'
              ? 'Données à jour'
              : compte.syncStatus === 'PENDING'
                ? 'Sync en attente'
                : compte.syncStatus === 'SYNCING'
                  ? 'Sync en cours'
                  : 'Action requise'
          }
        />
      </div>

      {compte.syncStatus === 'PENDING' && (
        <div className="mx-5 mb-5 flex flex-col gap-3 rounded-lg border border-blue-400/20 bg-blue-400/[0.08] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs font-semibold leading-6 text-blue-200">
            Lancez la synchronisation pour importer votre historique de trades.
          </p>
          <button
            onClick={handleSync}
            disabled={syncing}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-xs font-black text-white transition-colors hover:bg-blue-500 disabled:opacity-45"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${syncing ? 'animate-spin' : ''}`} />
            Synchroniser
          </button>
        </div>
      )}
    </article>
  )
}
