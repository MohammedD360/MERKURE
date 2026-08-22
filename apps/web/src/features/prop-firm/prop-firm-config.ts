'use client'

import { getChallenge, getPropFirm } from './data/prop-firms'

export interface PropFirmForm {
  accountType:   string
  currency:      string
  leverage:      string
  accountNumber: string
  startDate:     string
}

export interface PropFirmConfig {
  firmId:      string
  challengeId: string
  accountSize: number
  form:        PropFirmForm
}

export const EMPTY_FORM: PropFirmForm = {
  accountType: '', currency: '', leverage: '', accountNumber: '', startDate: '',
}

/**
 * La configuration est désormais rattachée à un compte broker.
 * Avant, une seule config globale existait pour tout l'utilisateur — impossible
 * de suivre deux challenges à la fois, et la conformité était calculée sur les
 * trades de tous les comptes confondus.
 */
const KEY_PREFIX = 'merkure_propfirm_config:'
const LEGACY_KEY = 'merkure_propfirm_config'

function isUsable(config: PropFirmConfig | null): config is PropFirmConfig {
  if (!config?.firmId || !config.challengeId) return false
  return Boolean(getPropFirm(config.firmId) && getChallenge(config.firmId, config.challengeId))
}

function read(key: string): PropFirmConfig | null {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    const parsed = JSON.parse(raw) as PropFirmConfig
    return isUsable(parsed) ? parsed : null
  } catch {
    localStorage.removeItem(key)
    return null
  }
}

export function loadPropFirmConfig(accountId: string): PropFirmConfig | null {
  if (typeof window === 'undefined') return null
  return read(KEY_PREFIX + accountId)
}

export function savePropFirmConfig(accountId: string, config: PropFirmConfig): void {
  localStorage.setItem(KEY_PREFIX + accountId, JSON.stringify(config))
}

export function clearPropFirmConfig(accountId: string): void {
  localStorage.removeItem(KEY_PREFIX + accountId)
}

/**
 * Reprend l'ancienne configuration globale et la rattache au premier compte
 * prop firm connu, pour ne pas perdre un challenge déjà paramétré.
 * Ne fait rien si ce compte a déjà sa propre configuration.
 */
export function migrateLegacyConfig(firstPropAccountId: string | undefined): void {
  if (typeof window === 'undefined' || !firstPropAccountId) return
  const legacy = read(LEGACY_KEY)
  if (!legacy) return
  if (!loadPropFirmConfig(firstPropAccountId)) {
    savePropFirmConfig(firstPropAccountId, legacy)
  }
  localStorage.removeItem(LEGACY_KEY)
}
