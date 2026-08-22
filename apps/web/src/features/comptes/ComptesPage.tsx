'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertTriangle, Link2, Plus, RefreshCw } from 'lucide-react'

import { useAccounts, useSyncAccount } from '@/lib/hooks/use-accounts'
import { CompteRow } from './components/CompteRow'
import { PropFirmPanel, propFirmSummary } from './components/PropFirmPanel'
import { PropFirmWizard } from '@/features/prop-firm/PropFirmWizard'
import {
  clearPropFirmConfig, loadPropFirmConfig, migrateLegacyConfig, savePropFirmConfig,
  type PropFirmConfig,
} from '@/features/prop-firm/prop-firm-config'
import { ConnectBrokerModal } from './components/ConnectBrokerModal'
import { CsvImportModal } from '@/features/trades/components/CsvImportModal'
import { cn } from '@/lib/utils'

export function ComptesPage() {
  const router = useRouter()
  const [modalOpen, setModalOpen] = useState(false)
  const [csvAccountId, setCsvAccountId] = useState<string | undefined>(undefined)

  const { data: comptes = [], isLoading, error } = useAccounts()
  const { mutate: sync, isPending: syncingAll } = useSyncAccount()

  // ── Challenges prop firm, rattachés au compte concerné ──────────────────
  const [openPropFirm, setOpenPropFirm] = useState<string | null>(null)
  const [wizardFor, setWizardFor] = useState<string | null>(null)
  const [configs, setConfigs] = useState<Record<string, PropFirmConfig | null>>({})

  const isPropAccount = (type: string) => type === 'PROP_CHALLENGE' || type === 'PROP_FUNDED'

  useEffect(() => {
    if (comptes.length === 0) return
    const propAccounts = comptes.filter(c => isPropAccount(c.accountType))
    migrateLegacyConfig(propAccounts[0]?.id)
    setConfigs(Object.fromEntries(propAccounts.map(c => [c.id, loadPropFirmConfig(c.id)])))
  }, [comptes])

  const handleSaveConfig = (accountId: string, config: PropFirmConfig) => {
    savePropFirmConfig(accountId, config)
    setConfigs(c => ({ ...c, [accountId]: config }))
    setWizardFor(null)
    setOpenPropFirm(accountId)
  }

  const handleResetConfig = (accountId: string) => {
    clearPropFirmConfig(accountId)
    setConfigs(c => ({ ...c, [accountId]: null }))
  }

  const wizardAccount = comptes.find(c => c.id === wizardFor)

  const enErreur = comptes.filter(c => c.syncStatus === 'ERROR')
  const actifs   = comptes.filter(c => c.syncStatus !== 'ERROR')

  const btnSecondary =
    'inline-flex h-9 items-center gap-2 rounded-md border border-input bg-background px-3 text-sm font-medium text-foreground transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50'
  const btnPrimary =
    'inline-flex h-9 items-center gap-2 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90'

  return (
    <>
      <div className="space-y-4">

        {/* Ligne d'état + actions — pas de bandeau marketing dans un outil */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
            <span className="flex items-center gap-2">
              <span className={cn(
                'h-2 w-2 rounded-full',
                comptes.length === 0 ? 'bg-muted-foreground' : enErreur.length > 0 ? 'bg-amber-500' : 'bg-green-500',
              )} />
              <span className="font-medium text-foreground">
                {isLoading ? '…' : `${comptes.length} compte${comptes.length > 1 ? 's' : ''}`}
              </span>
            </span>
            {!isLoading && comptes.length > 0 && (
              <>
                <span className="hidden h-4 w-px bg-border sm:block" />
                <span className="text-muted-foreground">
                  {actifs.length} opérationnel{actifs.length > 1 ? 's' : ''}
                  {enErreur.length > 0 && (
                    <>
                      <span className="mx-2">·</span>
                      <span className="font-medium text-red-500">
                        {enErreur.length} en erreur
                      </span>
                    </>
                  )}
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => actifs.forEach(c => sync(c.id))}
              disabled={syncingAll || isLoading || actifs.length === 0}
              className={btnSecondary}
            >
              <RefreshCw className={cn('h-4 w-4', syncingAll && 'animate-spin')} />
              Tout synchroniser
            </button>
            <button type="button" onClick={() => setModalOpen(true)} className={btnPrimary}>
              <Plus className="h-4 w-4" />
              Connecter un broker
            </button>
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-3 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
            <div>
              <p className="text-sm font-medium text-red-500">Impossible de charger les comptes</p>
              <p className="mt-1 text-sm text-red-500/80">Vérifiez que l'API est démarrée, puis réessayez.</p>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="overflow-hidden rounded-lg border border-border bg-card">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center gap-4 border-b border-border p-4 last:border-0">
                <div className="h-9 w-9 animate-pulse rounded-md bg-secondary" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-48 animate-pulse rounded bg-secondary" />
                  <div className="h-3 w-32 animate-pulse rounded bg-secondary" />
                </div>
                <div className="h-4 w-40 animate-pulse rounded bg-secondary" />
              </div>
            ))}
          </div>
        ) : comptes.length > 0 ? (
          <div className="overflow-hidden rounded-lg border border-border bg-card">
            {comptes.map(compte => {
              const prop = isPropAccount(compte.accountType)
              const config = configs[compte.id] ?? null
              return (
                <CompteRow
                  key={compte.id}
                  compte={compte}
                  onNavigateToTrades={id => router.push(`/app/trades?accountId=${id}`)}
                  onImportCsv={id => setCsvAccountId(id)}
                  onDeleted={id => {
                    setConfigs(c => { const next = { ...c }; delete next[id]; return next })
                    setOpenPropFirm(current => (current === id ? null : current))
                  }}
                  {...(prop ? {
                    propFirmSummary: propFirmSummary(config),
                    propFirmOpen: openPropFirm === compte.id,
                    onTogglePropFirm: () => setOpenPropFirm(id => (id === compte.id ? null : compte.id)),
                    propFirmPanel: (
                      <PropFirmPanel
                        accountId={compte.id}
                        config={config}
                        onConfigure={() => setWizardFor(compte.id)}
                        onReset={() => handleResetConfig(compte.id)}
                      />
                    ),
                  } : {})}
                />
              )
            })}
          </div>
        ) : !error && (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border px-6 py-16 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-md bg-secondary text-muted-foreground">
              <Link2 className="h-5 w-5" />
            </span>
            <p className="mt-4 text-sm font-medium text-foreground">Aucun compte connecté</p>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Connectez un broker en lecture seule pour importer votre historique et suivre vos performances.
            </p>
            <button type="button" onClick={() => setModalOpen(true)} className={cn(btnPrimary, 'mt-5')}>
              <Plus className="h-4 w-4" />
              Connecter un broker
            </button>
          </div>
        )}
      </div>

      <PropFirmWizard
        open={wizardFor !== null}
        accountName={wizardAccount?.label ?? ''}
        initial={wizardFor ? configs[wizardFor] ?? null : null}
        onClose={() => setWizardFor(null)}
        onSubmit={config => { if (wizardFor) handleSaveConfig(wizardFor, config) }}
      />

      <ConnectBrokerModal open={modalOpen} onClose={() => setModalOpen(false)} />
      <CsvImportModal
        open={csvAccountId !== undefined}
        preselectedAccountId={csvAccountId}
        onClose={() => setCsvAccountId(undefined)}
      />
    </>
  )
}
