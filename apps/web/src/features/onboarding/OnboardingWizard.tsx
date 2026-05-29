'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check } from 'lucide-react'
import { StepProfile } from './steps/StepProfile'
import { StepBroker } from './steps/StepBroker'
import { StepPlan } from './steps/StepPlan'
import { StepDone } from './steps/StepDone'
import { saveProfile, connectBroker, completeOnboarding } from './api'
import type { ProfilePayload, BrokerPayload } from './api'

type Step = 'profile' | 'broker' | 'plan' | 'done'

const STEPS: { id: Step; label: string; num: number }[] = [
  { id: 'profile', label: 'Profil', num: 1 },
  { id: 'broker', label: 'Broker', num: 2 },
  { id: 'plan', label: 'Plan', num: 3 },
  { id: 'done', label: 'Terminé', num: 4 },
]

const STEP_META: Record<Step, { title: string; description: string }> = {
  profile: {
    title: 'Votre profil de trader',
    description: 'Aidez MERKURE à personnaliser vos analyses',
  },
  broker: {
    title: 'Connecter un broker',
    description: 'Synchronisez vos trades automatiquement',
  },
  plan: {
    title: 'Choisissez votre plan',
    description: 'Commencez gratuitement, puis changez de plan à tout moment.',
  },
  done: {
    title: "C'est parti !",
    description: 'Votre espace MERKURE est prêt',
  },
}

function BrandMark() {
  return (
    <div className="flex items-center gap-2.5">
      <svg className="h-8 w-8 text-white" viewBox="0 0 40 40" fill="none">
        <path
          d="M7 9.5L20 4l13 5.5v21L20 36 7 30.5v-21Z"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <path
          d="M12 27V13l8 8 8-8v14"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="text-[22px] font-black tracking-[0.12em] text-white">MERKURE</span>
    </div>
  )
}

export function OnboardingWizard() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('profile')
  const [profile, setProfile] = useState<ProfilePayload>({})
  const [brokerConnected, setBrokerConnected] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const currentNum = STEPS.find((s) => s.id === step)!.num

  const handleProfileNext = async () => {
    setError(null)
    setLoading(true)
    try {
      await saveProfile(profile)
      setStep('broker')
    } catch {
      setError('Erreur lors de la sauvegarde. Veuillez réessayer.')
    } finally {
      setLoading(false)
    }
  }

  const handleBrokerConnect = async (payload: BrokerPayload) => {
    setError(null)
    setLoading(true)
    try {
      const { id: accountId } = await connectBroker(payload)
      setBrokerConnected(true)
      // Sondage du statut sync (max 12s)
      const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'
      const token = typeof window !== 'undefined' ? localStorage.getItem('merkure_token') : null
      let tries = 0
      while (tries < 6) {
        await new Promise((r) => setTimeout(r, 2000))
        try {
          const r = await fetch(`${API}/api/v1/accounts/${accountId}`, {
            headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
          })
          const acc = await r.json() as { syncStatus?: string }
          if (acc.syncStatus === 'SUCCESS' || acc.syncStatus === 'ERROR') break
        } catch { break }
        tries++
      }
      setStep('plan')
    } catch {
      setError('Connexion broker échouée. Vérifiez vos identifiants.')
      setLoading(false)
    }
  }

  const handleBrokerSkip = () => {
    setBrokerConnected(false)
    setStep('plan')
  }

  const handlePlanSelect = async (planId?: string) => {
    setError(null)
    setLoading(true)
    try {
      await completeOnboarding()
      if (!planId || planId === 'FREE') {
        router.push('/app/dashboard')
      } else {
        const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'
        const token = typeof window !== 'undefined' ? localStorage.getItem('merkure_token') : null
        const res = await fetch(`${API}/api/v1/billing/checkout`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
          body: JSON.stringify({ plan: planId }),
        })
        const data = await res.json() as { url?: string; error?: string; detail?: string }
        if (data.url) window.location.href = data.url
        else setError(`Erreur paiement: ${data.detail ?? data.error ?? 'inconnu'}`)
      }
    } catch {
      setError('Erreur. Réessaie.')
    } finally {
      setLoading(false)
    }
  }

  const handleFinish = async () => {
    setLoading(true)
    try {
      await completeOnboarding()
      router.push('/app/dashboard')
    } catch {
      router.push('/app/dashboard')
    }
  }

  const meta = STEP_META[step]
  const isPlan = step === 'plan'

  return (
    <div className="relative min-h-screen bg-[#070b10] flex flex-col items-center justify-center px-4 py-12">
      {/* Background halos */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 h-[600px] w-[600px] rounded-full bg-blue-600/[0.07] blur-[120px]" />
        <div className="absolute -bottom-32 -right-32 h-[500px] w-[500px] rounded-full bg-emerald-600/[0.05] blur-[100px]" />
      </div>

      {/* Logo */}
      <div className="mb-10 text-center">
        <BrandMark />
        <p className="text-sm font-semibold text-slate-500 mt-2">Configuration de votre espace</p>
      </div>

      {/* Card */}
      <div
        className={`relative w-full border border-white/10 bg-[#0b111c] rounded-2xl shadow-[0_32px_80px_rgba(0,0,0,0.40)] overflow-hidden ${
          isPlan ? 'max-w-3xl' : 'max-w-lg'
        }`}
      >
        {/* Stepper */}
        <div className="px-6 pt-6 pb-5 border-b border-white/10">
          <div className="flex items-center">
            {STEPS.map((s, i) => {
              const done = s.num < currentNum
              const active = s.id === step
              return (
                <div key={s.id} className="flex items-center flex-1 last:flex-none">
                  <div className="flex flex-col items-center gap-1 flex-shrink-0">
                    <div
                      className={`h-9 w-9 rounded-full border-2 flex items-center justify-center text-xs font-black transition-all ${
                        done
                          ? 'border-[#56bf6b] bg-[#56bf6b] text-white'
                          : active
                          ? 'border-blue-400 bg-blue-400/10 text-blue-300'
                          : 'border-white/15 bg-white/[0.04] text-slate-600'
                      }`}
                    >
                      {done ? <Check className="h-4 w-4" /> : s.num}
                    </div>
                    <span
                      className={`hidden sm:block text-[10px] font-black uppercase tracking-wider ${
                        active ? 'text-white' : done ? 'text-slate-400' : 'text-slate-700'
                      }`}
                    >
                      {s.label}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div
                      className={`h-px flex-1 mx-3 mb-4 transition-all ${
                        done ? 'bg-[#56bf6b]' : 'bg-white/10'
                      }`}
                    />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Step header */}
        <div className="px-6 pt-6 pb-2">
          <h2 className="text-lg font-black text-white">{meta.title}</h2>
          <p className="text-sm font-medium text-slate-500 mt-1">{meta.description}</p>
        </div>

        {/* Content */}
        <div className="px-6 py-5">
          {error && (
            <div className="mb-4 border border-red-400/25 bg-red-400/[0.08] px-4 py-3 rounded-lg text-sm text-red-200">
              {error}
            </div>
          )}

          {step === 'profile' && (
            <StepProfile data={profile} onChange={(patch) => setProfile((p) => ({ ...p, ...patch }))} />
          )}
          {step === 'broker' && (
            <StepBroker onConnect={handleBrokerConnect} onSkip={handleBrokerSkip} loading={loading} />
          )}
          {step === 'plan' && (
            <StepPlan
              onSelectFree={() => handlePlanSelect(undefined)}
              onSelectPaid={(planId) => handlePlanSelect(planId)}
              loading={loading}
            />
          )}
          {step === 'done' && (
            <StepDone brokerConnected={brokerConnected} onFinish={handleFinish} loading={loading} />
          )}
        </div>

        {/* Footer — profile step only */}
        {step === 'profile' && (
          <div className="flex justify-end border-t border-white/10 px-6 py-4">
            <button
              onClick={handleProfileNext}
              disabled={loading}
              className="px-6 py-2.5 rounded-lg text-sm font-black text-white bg-[#56bf6b] hover:bg-[#49ab5e] disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                'Continuer →'
              )}
            </button>
          </div>
        )}
      </div>

      <p className="text-xs text-slate-700 mt-6">
        Vous pouvez modifier ces informations à tout moment dans votre profil.
      </p>
    </div>
  )
}
