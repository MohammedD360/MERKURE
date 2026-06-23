'use client'

import { useState, useEffect } from 'react'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { StepFirmSelect } from './components/StepFirmSelect'
import { StepChallengeSelect } from './components/StepChallengeSelect'
import { StepQuestionnaire } from './components/StepQuestionnaire'
import { StepDashboard } from './components/StepDashboard'
import { getPropFirm, getChallenge } from './data/prop-firms'

type Step = 1 | 2 | 3 | 4

const STORAGE_KEY = 'merkure_propfirm_config'

interface FormState {
  accountType:   string
  currency:      string
  leverage:      string
  accountNumber: string
  startDate:     string
}

interface SavedConfig {
  firmId:      string
  challengeId: string
  accountSize: number
  form:        FormState
}

const STEPS = [
  { label: 'Prop Firm',    description: 'Choisissez votre firme' },
  { label: 'Challenge',    description: 'Sélectionnez votre challenge' },
  { label: 'Questionnaire', description: 'Répondez au questionnaire' },
  { label: 'Règles & Suivi', description: 'Suivi en temps réel' },
]

function Stepper({ current }: { current: Step }) {
  return (
    <nav className="flex items-center gap-0 overflow-x-auto pb-1">
      {STEPS.map((s, i) => {
        const num    = (i + 1) as Step
        const done   = num < current
        const active = num === current

        return (
          <div key={s.label} className="flex items-center">
            <div className="flex min-w-0 items-center gap-2.5 px-3 py-2 first:pl-0">
              <div className={cn(
                'flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 text-xs font-black transition-colors',
                done   ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))] text-white' :
                active ? 'border-[hsl(var(--primary))] bg-white text-[hsl(var(--primary))]' :
                         'border-border bg-white text-muted-foreground',
              )}>
                {done ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : num}
              </div>
              <div className="hidden sm:block">
                <p className={cn('text-xs font-bold leading-none', active ? 'text-foreground' : 'text-muted-foreground')}>
                  {s.label}
                </p>
                <p className="mt-0.5 text-[10px] text-muted-foreground">{s.description}</p>
              </div>
            </div>

            {i < STEPS.length - 1 && (
              <div className={cn(
                'mx-1 h-px w-8 shrink-0 transition-colors',
                done ? 'bg-[hsl(var(--primary))]' : 'bg-border',
              )} />
            )}
          </div>
        )
      })}
    </nav>
  )
}

export function PropFirmPage() {
  const [step, setStep]               = useState<Step>(1)
  const [hydrated, setHydrated]       = useState(false)
  const [firmId, setFirmId]           = useState<string | null>(null)
  const [challengeId, setChallengeId] = useState<string | null>(null)
  const [accountSize, setAccountSize] = useState<number>(0)
  const [form, setForm]               = useState<FormState>({
    accountType:   '',
    currency:      '',
    leverage:      '',
    accountNumber: '',
    startDate:     '',
  })

  // Charger la config sauvegardée au montage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const saved = JSON.parse(raw) as SavedConfig
        // Vérifier que la firm + challenge existent toujours dans les données statiques
        if (getPropFirm(saved.firmId) && getChallenge(saved.firmId, saved.challengeId)) {
          setFirmId(saved.firmId)
          setChallengeId(saved.challengeId)
          setAccountSize(saved.accountSize)
          setForm(saved.form)
          setStep(4)
        }
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY)
    }
    setHydrated(true)
  }, [])

  const saveConfig = () => {
    if (!firmId || !challengeId) return
    const config: SavedConfig = { firmId, challengeId, accountSize, form }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
  }

  const handleReset = () => {
    localStorage.removeItem(STORAGE_KEY)
    setFirmId(null)
    setChallengeId(null)
    setAccountSize(0)
    setForm({ accountType: '', currency: '', leverage: '', accountNumber: '', startDate: '' })
    setStep(1)
  }

  const handleSelectFirm = (id: string) => {
    setFirmId(id)
    setChallengeId(null)
    setAccountSize(0)
    setForm({ accountType: '', currency: '', leverage: '', accountNumber: '', startDate: '' })
  }

  const handleSelectChallenge = (id: string) => {
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

  const handleGoToDashboard = () => {
    saveConfig()
    setStep(4)
  }

  if (!hydrated) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[hsl(var(--primary))] border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f6f7f9] px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1300px] space-y-6">

        {/* Stepper */}
        <div className="rounded-xl border border-border bg-white p-4 shadow-sm">
          <Stepper current={step} />
        </div>

        {/* Step content */}
        <div className="rounded-xl border border-border bg-[#f6f7f9] p-0">
          {step === 1 && (
            <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
              <StepFirmSelect
                selectedFirmId={firmId}
                onSelect={handleSelectFirm}
                onNext={() => setStep(2)}
              />
            </div>
          )}

          {step === 2 && firmId && (
            <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
              <StepChallengeSelect
                firmId={firmId}
                selectedChallengeId={challengeId}
                selectedSize={accountSize}
                onSelectChallenge={handleSelectChallenge}
                onSelectSize={setAccountSize}
                onNext={() => setStep(3)}
                onBack={() => setStep(1)}
              />
            </div>
          )}

          {step === 3 && firmId && challengeId && (
            <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
              <StepQuestionnaire
                firmId={firmId}
                challengeId={challengeId}
                accountSize={accountSize}
                form={form}
                onFormChange={patch => setForm(f => ({ ...f, ...patch }))}
                onNext={handleGoToDashboard}
                onBack={() => setStep(2)}
              />
            </div>
          )}

          {step === 4 && firmId && challengeId && (
            <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
              <StepDashboard
                config={{
                  firmId,
                  challengeId,
                  accountSize,
                  accountType:  form.accountType,
                  currency:     form.currency,
                  leverage:     form.leverage,
                  startDate:    form.startDate,
                }}
                onEdit={() => setStep(3)}
                onReset={handleReset}
              />
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
