'use client'

import { useEffect, useState } from 'react'
import { Check, X } from 'lucide-react'

import { cn } from '@/lib/utils'
import { StepFirmSelect } from './components/StepFirmSelect'
import { StepChallengeSelect } from './components/StepChallengeSelect'
import { StepQuestionnaire } from './components/StepQuestionnaire'
import { getChallenge } from './data/prop-firms'
import { EMPTY_FORM, type PropFirmConfig, type PropFirmForm } from './prop-firm-config'

type Step = 1 | 2 | 3

const STEPS = ['Prop firm', 'Challenge', 'Paramètres']

interface Props {
  open:        boolean
  accountName: string
  initial?:    PropFirmConfig | null
  onClose:     () => void
  onSubmit:    (config: PropFirmConfig) => void
}

/**
 * Assistant de configuration d'un challenge, ouvert depuis la ligne du compte
 * concerné. L'ancien parcours occupait une page entière ; ici il ne sert qu'à
 * renseigner ce que l'API de conformité ne peut pas deviner.
 */
export function PropFirmWizard({ open, accountName, initial, onClose, onSubmit }: Props) {
  const [step, setStep]               = useState<Step>(1)
  const [firmId, setFirmId]           = useState<string | null>(null)
  const [challengeId, setChallengeId] = useState<string | null>(null)
  const [accountSize, setAccountSize] = useState(0)
  const [form, setForm]               = useState<PropFirmForm>(EMPTY_FORM)

  // À chaque ouverture, on repart de la configuration existante s'il y en a une
  useEffect(() => {
    if (!open) return
    setFirmId(initial?.firmId ?? null)
    setChallengeId(initial?.challengeId ?? null)
    setAccountSize(initial?.accountSize ?? 0)
    setForm(initial?.form ?? EMPTY_FORM)
    setStep(initial ? 3 : 1)
  }, [open, initial])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  const selectFirm = (id: string) => {
    setFirmId(id)
    setChallengeId(null)
    setAccountSize(0)
    setForm(EMPTY_FORM)
  }

  const selectChallenge = (id: string) => {
    setChallengeId(id)
    const c = firmId ? getChallenge(firmId, id) : null
    if (c) {
      setForm(f => ({
        ...f,
        accountType: c.accountTypes[0] ?? '',
        currency:    c.currencies[0]    ?? '',
        leverage:    c.leverages[0]     ?? '',
      }))
    }
  }

  const submit = () => {
    if (!firmId || !challengeId) return
    onSubmit({ firmId, challengeId, accountSize, form })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-4 sm:p-8">
      <div className="w-full max-w-4xl rounded-lg border border-border bg-card shadow-lg">

        <div className="flex items-start justify-between gap-4 border-b border-border p-6">
          <div className="min-w-0 space-y-1.5">
            <h2 className="text-2xl font-semibold leading-none tracking-tight text-foreground">
              Challenge prop firm
            </h2>
            <p className="truncate text-sm text-muted-foreground">Compte : {accountName}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-input bg-background text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Étapes */}
        <div className="flex flex-wrap items-center gap-2 border-b border-border px-6 py-4">
          {STEPS.map((label, i) => {
            const num = (i + 1) as Step
            const done = num < step
            const active = num === step
            return (
              <div key={label} className="flex items-center gap-2">
                <span className={cn(
                  'flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium',
                  done ? 'bg-primary text-primary-foreground'
                       : active ? 'border border-primary text-primary'
                                : 'border border-border text-muted-foreground',
                )}>
                  {done ? <Check className="h-3.5 w-3.5" /> : num}
                </span>
                <span className={cn('text-sm', active ? 'font-medium text-foreground' : 'text-muted-foreground')}>
                  {label}
                </span>
                {i < STEPS.length - 1 && <span className="mx-2 h-px w-6 bg-border" />}
              </div>
            )
          })}
        </div>

        <div className="p-6">
          {step === 1 && (
            <StepFirmSelect
              selectedFirmId={firmId}
              onSelect={selectFirm}
              onNext={() => setStep(2)}
            />
          )}

          {step === 2 && firmId && (
            <StepChallengeSelect
              firmId={firmId}
              selectedChallengeId={challengeId}
              selectedSize={accountSize}
              onSelectChallenge={selectChallenge}
              onSelectSize={setAccountSize}
              onNext={() => setStep(3)}
              onBack={() => setStep(1)}
            />
          )}

          {step === 3 && firmId && challengeId && (
            <StepQuestionnaire
              firmId={firmId}
              challengeId={challengeId}
              accountSize={accountSize}
              form={form}
              onFormChange={patch => setForm(f => ({ ...f, ...patch }))}
              onNext={submit}
              onBack={() => setStep(2)}
            />
          )}
        </div>
      </div>
    </div>
  )
}
