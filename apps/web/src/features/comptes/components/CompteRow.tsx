'use client'

import { useState } from 'react'
import {
  AlertTriangle, ArrowLeftRight, Check, ChevronDown, Loader2, RefreshCw, Trophy, Unlink, Upload, Wallet, X,
} from 'lucide-react'
import { brokerMeta } from '@/lib/broker-config'
import {
  useDeleteAccount,
  useSyncAccount,
  useUpdateAccount,
  type BrokerAccount,
  type SyncStatus,
} from '@/lib/hooks/use-accounts'
import { clearPropFirmConfig } from '@/features/prop-firm/prop-firm-config'
import { cn } from '@/lib/utils'

const ACCOUNT_TYPE_LABEL: Record<string, string> = {
  LIVE: 'Live',
  DEMO: 'Démo',
  PROP_FUNDED: 'Prop Funded',
  PROP_CHALLENGE: 'Prop Challenge',
}

function formatLastSync(iso: string | null) {
  if (!iso) return 'jamais synchronisé'
  const minutes = Math.round((Date.now() - new Date(iso).getTime()) / 60000)
  if (minutes < 1) return "à l'instant"
  if (minutes < 60) return `il y a ${minutes} min`
  if (minutes < 1440) return `il y a ${Math.round(minutes / 60)} h`
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
}

/** État de synchro : un point de couleur + un texte, pas une pastille de plus. */
function SyncState({ status, lastSyncAt }: { status: SyncStatus; lastSyncAt: string | null }) {
  const config: Record<SyncStatus, { dot: string; text: string; tone: string }> = {
    SUCCESS: { dot: 'bg-green-500',  text: `Synchronisé ${formatLastSync(lastSyncAt)}`, tone: 'text-muted-foreground' },
    SYNCING: { dot: 'bg-primary',    text: 'Synchronisation en cours',                  tone: 'text-muted-foreground' },
    PENDING: { dot: 'bg-amber-500',  text: 'En attente de première synchro',            tone: 'text-muted-foreground' },
    ERROR:   { dot: 'bg-red-500',    text: 'Erreur de synchronisation',                 tone: 'text-red-500' },
  }
  const c = config[status]
  return (
    <span className={cn('flex items-center gap-2 text-sm', c.tone)}>
      <span className={cn('h-2 w-2 shrink-0 rounded-full', c.dot)} />
      <span className="truncate">{c.text}</span>
    </span>
  )
}

/** Un compte manuel n'a pas de synchro : pas de pastille d'erreur/attente trompeuse. */
function ManualState() {
  return (
    <span className="flex items-center gap-2 text-sm text-muted-foreground">
      <span className="h-2 w-2 shrink-0 rounded-full bg-muted-foreground/40" />
      <span className="truncate">Alimenté par import CSV</span>
    </span>
  )
}

/**
 * Capital de départ, éditable en ligne. C'est la seule source de solde pour
 * un compte MANUAL (pas de sync broker) — sans lui, "Valeur du portefeuille"
 * reste à 0 sur la vue d'ensemble.
 */
function StartingBalanceEditor({ accountId, startingBalance }: { accountId: string; startingBalance: string | null }) {
  const { mutate: update, isPending } = useUpdateAccount()
  const [editing, setEditing] = useState(false)
  const [value, setValue]     = useState(startingBalance ?? '')

  const save = () => {
    const trimmed = value.trim()
    const parsed  = trimmed ? Number(trimmed) : null
    if (trimmed && (parsed === null || Number.isNaN(parsed) || parsed < 0)) return
    update({ id: accountId, startingBalance: parsed }, { onSuccess: () => setEditing(false) })
  }

  if (editing) {
    return (
      <div className="flex items-center gap-1">
        <input
          type="number"
          min="0"
          autoFocus
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') save()
            if (e.key === 'Escape') { setValue(startingBalance ?? ''); setEditing(false) }
          }}
          placeholder="Ex : 25000"
          className="h-7 w-28 rounded-md border border-input bg-background px-2 text-xs text-foreground outline-none focus:border-[hsl(var(--primary))]"
        />
        <button type="button" onClick={save} disabled={isPending} title="Enregistrer"
          className="flex h-7 w-7 items-center justify-center rounded-md text-green-500 hover:bg-green-500/10 disabled:opacity-50">
          {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
        </button>
        <button type="button" onClick={() => { setValue(startingBalance ?? ''); setEditing(false) }} title="Annuler"
          className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-accent">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={() => setEditing(true)}
      title="Définir le capital de départ (base du calcul de la valeur du portefeuille)"
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-medium transition-colors',
        startingBalance
          ? 'border-transparent text-muted-foreground hover:border-border hover:bg-accent'
          : 'border-dashed border-amber-500/40 text-amber-600 hover:bg-amber-500/10',
      )}
    >
      <Wallet className="h-3 w-3" />
      {startingBalance
        ? `Capital : $${Number(startingBalance).toLocaleString('fr-FR')}`
        : 'Capital non défini'}
    </button>
  )
}

function IconAction({
  onClick, title, disabled, danger, children,
}: {
  onClick: () => void
  title: string
  disabled?: boolean
  danger?: boolean
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={title}
      className={cn(
        'flex h-9 w-9 items-center justify-center rounded-md border border-input bg-background transition-colors disabled:cursor-not-allowed disabled:opacity-50',
        danger
          ? 'border-red-500/40 text-red-500 hover:bg-red-500/10'
          : 'text-muted-foreground hover:bg-accent hover:text-foreground',
      )}
    >
      {children}
    </button>
  )
}

interface Props {
  compte:              BrokerAccount
  onNavigateToTrades:  (id: string) => void
  onImportCsv:         (id: string) => void
  /** Volet challenge — rendu par la page pour les comptes prop firm. */
  propFirmPanel?:      React.ReactNode
  propFirmSummary?:    string | null
  propFirmOpen?:       boolean
  onTogglePropFirm?:   () => void
  onDeleted?:          (id: string) => void
}

/** Une ligne = un compte. Toutes les infos utiles tiennent sur une seule ligne. */
export function CompteRow({
  compte, onNavigateToTrades, onImportCsv,
  propFirmPanel, propFirmSummary, propFirmOpen = false, onTogglePropFirm, onDeleted,
}: Props) {
  // Repli neutre si l'enum backend gagne une valeur que le front ne connaît pas encore :
  // afficher le code brut vaut mieux que le nom d'un autre broker.
  const meta = brokerMeta[compte.brokerType] ?? {
    name: compte.brokerType, color: 'hsl(var(--muted-foreground))', bg: 'hsl(var(--secondary))', desc: '',
  }
  const { mutate: sync, isPending: syncing } = useSyncAccount()
  const { mutate: remove, isPending: deleting } = useDeleteAccount()
  const [confirmDelete, setConfirmDelete] = useState(false)

  const isManual = compte.brokerType === 'MANUAL'
  const hasError = !isManual && compte.syncStatus === 'ERROR'
  const initials = compte.brokerType.startsWith('MT') ? 'MT' : compte.brokerType.slice(0, 2)

  const handleDelete = () => {
    if (!confirmDelete) { setConfirmDelete(true); return }
    remove(compte.id, {
      onSuccess: () => {
        // Sinon la configuration du challenge survivrait au compte et serait
        // réattribuée au prochain compte prop firm portant le même identifiant.
        clearPropFirmConfig(compte.id)
        onDeleted?.(compte.id)
      },
      onSettled: () => setConfirmDelete(false),
    })
  }

  return (
    <div className="border-b border-border last:border-0">
      <div className="flex flex-wrap items-center gap-4 px-4 py-3">
        {/* Identité */}
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-xs font-semibold"
            style={{ backgroundColor: meta.bg, color: meta.color }}
          >
            {initials}
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="truncate text-sm font-medium text-foreground">{compte.label}</span>
              <span className="shrink-0 rounded-md border border-border px-1.5 py-0.5 text-xs text-muted-foreground">
                {ACCOUNT_TYPE_LABEL[compte.accountType] ?? compte.accountType}
              </span>
            </div>
            <p className="truncate text-sm text-muted-foreground">
              {meta.name} · #{compte.accountId}
            </p>
          </div>
        </div>

        {/* État */}
        <div className="min-w-[220px] shrink-0 space-y-1.5">
          {isManual
            ? <ManualState />
            : <SyncState status={compte.syncStatus} lastSyncAt={compte.lastSyncAt} />}
          <StartingBalanceEditor accountId={compte.id} startingBalance={compte.startingBalance} />
        </div>

        {/* Actions */}
        <div className="flex shrink-0 items-center gap-2">
          {onTogglePropFirm && (
            <button
              type="button"
              onClick={onTogglePropFirm}
              aria-expanded={propFirmOpen}
              className={cn(
                'inline-flex h-9 items-center gap-2 rounded-md border px-3 text-sm font-medium transition-colors',
                propFirmSummary
                  ? 'border-input bg-background text-foreground hover:bg-accent'
                  : 'border-dashed border-border text-muted-foreground hover:bg-accent hover:text-foreground',
              )}
            >
              <Trophy className="h-4 w-4" />
              <span className="max-w-[180px] truncate">{propFirmSummary ?? 'Configurer le challenge'}</span>
              <ChevronDown className={cn('h-4 w-4 transition-transform', propFirmOpen && 'rotate-180')} />
            </button>
          )}
          {!isManual && (
            <IconAction
              onClick={() => sync(compte.id)}
              disabled={syncing || compte.syncStatus === 'SYNCING'}
              title="Synchroniser maintenant"
            >
              {syncing || compte.syncStatus === 'SYNCING'
                ? <Loader2 className="h-4 w-4 animate-spin" />
                : <RefreshCw className="h-4 w-4" />}
            </IconAction>
          )}
          <IconAction onClick={() => onNavigateToTrades(compte.id)} title="Voir les trades de ce compte">
            <ArrowLeftRight className="h-4 w-4" />
          </IconAction>
          <IconAction onClick={() => onImportCsv(compte.id)} title="Importer un CSV sur ce compte">
            <Upload className="h-4 w-4" />
          </IconAction>
          <IconAction
            onClick={handleDelete}
            disabled={deleting}
            danger={confirmDelete}
            title={confirmDelete ? 'Cliquer à nouveau pour confirmer' : 'Déconnecter ce compte'}
          >
            <Unlink className="h-4 w-4" />
          </IconAction>
        </div>
      </div>

      {confirmDelete && (
        <div className="flex flex-wrap items-center gap-3 border-t border-red-500/30 bg-red-500/10 px-4 py-2.5">
          <AlertTriangle className="h-4 w-4 shrink-0 text-red-500" />
          <p className="flex-1 text-sm text-red-500">
            Déconnecter « {compte.label} » ? Les trades déjà importés sont conservés.
          </p>
          <button
            type="button"
            onClick={handleDelete}
            className="h-8 rounded-md border border-red-500/40 px-3 text-sm font-medium text-red-500 transition-colors hover:bg-red-500/10"
          >
            Confirmer
          </button>
          <button
            type="button"
            onClick={() => setConfirmDelete(false)}
            className="h-8 rounded-md px-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Annuler
          </button>
        </div>
      )}

      {propFirmOpen && propFirmPanel && (
        <div className="border-t border-border bg-background/40 p-4">{propFirmPanel}</div>
      )}

      {hasError && compte.syncError && !confirmDelete && (
        <div className="flex flex-wrap items-center gap-3 border-t border-red-500/30 bg-red-500/10 px-4 py-2.5">
          <AlertTriangle className="h-4 w-4 shrink-0 text-red-500" />
          <p className="min-w-0 flex-1 text-sm text-red-500">{compte.syncError}</p>
          <button
            type="button"
            onClick={() => sync(compte.id)}
            disabled={syncing}
            className="h-8 rounded-md border border-red-500/40 px-3 text-sm font-medium text-red-500 transition-colors hover:bg-red-500/10 disabled:opacity-50"
          >
            Relancer
          </button>
        </div>
      )}
    </div>
  )
}
