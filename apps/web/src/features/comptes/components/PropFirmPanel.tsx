'use client'

import { Trophy } from 'lucide-react'

import { StepDashboard } from '@/features/prop-firm/components/StepDashboard'
import type { PropFirmConfig } from '@/features/prop-firm/prop-firm-config'
import { getChallenge, getPropFirm } from '@/features/prop-firm/data/prop-firms'

interface Props {
  accountId: string
  config:    PropFirmConfig | null
  onConfigure: () => void
  onReset:     () => void
}

/** Volet challenge d'un compte prop firm : suivi si configuré, invitation sinon. */
export function PropFirmPanel({ accountId, config, onConfigure, onReset }: Props) {
  if (!config) {
    return (
      <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-secondary text-primary">
            <Trophy className="h-[18px] w-[18px]" />
          </span>
          <div>
            <p className="text-sm font-medium text-foreground">Aucun challenge configuré</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Indiquez la firme, le challenge et la date de départ : le suivi des règles se calcule ensuite
              sur les trades de ce compte.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onConfigure}
          className="inline-flex h-9 shrink-0 items-center gap-2 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Trophy className="h-4 w-4" />
          Configurer
        </button>
      </div>
    )
  }

  return (
    <StepDashboard
      config={{
        firmId:      config.firmId,
        challengeId: config.challengeId,
        accountSize: config.accountSize,
        accountType: config.form.accountType,
        currency:    config.form.currency,
        leverage:    config.form.leverage,
        startDate:   config.form.startDate,
      }}
      accountId={accountId}
      onEdit={onConfigure}
      onReset={onReset}
    />
  )
}

/** Libellé court affiché sur le bouton de la ligne de compte. */
export function propFirmSummary(config: PropFirmConfig | null): string | null {
  if (!config) return null
  const firm = getPropFirm(config.firmId)
  const challenge = getChallenge(config.firmId, config.challengeId)
  if (!firm || !challenge) return null
  const size = config.accountSize
    ? ` · ${(config.accountSize / 1000).toLocaleString('fr-FR', { maximumFractionDigits: 0 })}K`
    : ''
  return `${firm.name} — ${challenge.name}${size}`
}
