'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
      setError('Erreur lors de la sauvegarde. Réessaie.')
    } finally {
      setLoading(false)
    }
  }

  const handleBrokerConnect = async (payload: BrokerPayload) => {
    setError(null)
    setLoading(true)
    try {
      await connectBroker(payload)
      setBrokerConnected(true)
      setStep('plan')
    } catch {
      setError('Connexion broker échouée. Vérifie tes identifiants.')
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
        const data = await res.json() as { url?: string; error?: string }
        if (data.url) window.location.href = data.url
        else setError('Erreur lors de la redirection vers le paiement.')
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

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
      {/* Logo */}
      <div className="mb-10 text-center">
        <h1 className="text-2xl font-black tracking-tight text-white">
          MERK<span className="text-indigo-400">URE</span>
        </h1>
        <p className="text-sm text-gray-500 mt-1">Configuration de ton espace</p>
      </div>

      {/* Card */}
      <div className={`w-full bg-[#111827] border border-gray-800/60 rounded-2xl shadow-2xl overflow-hidden ${step === 'plan' ? 'max-w-4xl' : 'max-w-lg'}`}>
        {/* Stepper */}
        <div className="px-6 pt-6 pb-5 border-b border-gray-800/60">
          <div className="flex items-center gap-0">
            {STEPS.map((s, i) => {
              const done = s.num < currentNum
              const active = s.id === step
              return (
                <div key={s.id} className="flex items-center flex-1 last:flex-none">
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border transition-all ${
                      done
                        ? 'bg-indigo-600 border-indigo-600 text-white'
                        : active
                        ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10'
                        : 'border-gray-700 text-gray-600'
                    }`}>
                      {done ? '✓' : s.num}
                    </div>
                    <span className={`text-xs font-medium hidden sm:block ${active ? 'text-white' : done ? 'text-gray-400' : 'text-gray-600'}`}>
                      {s.label}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={`flex-1 h-px mx-3 transition-all ${done ? 'bg-indigo-600' : 'bg-gray-800'}`} />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Titre de l'étape */}
        <div className="px-6 pt-6 pb-2">
          {step === 'profile' && (
            <>
              <h2 className="text-base font-bold text-white">Ton profil de trader</h2>
              <p className="text-xs text-gray-500 mt-1">Aide MERKURE à personnaliser tes analytics</p>
            </>
          )}
          {step === 'broker' && (
            <>
              <h2 className="text-base font-bold text-white">Connecter un broker</h2>
              <p className="text-xs text-gray-500 mt-1">Synchronise tes trades automatiquement</p>
            </>
          )}
          {step === 'plan' && (
            <>
              <h2 className="text-base font-bold text-white">Choisissez votre plan</h2>
              <p className="text-xs text-gray-500 mt-1">Commencez gratuitement, upgradez à tout moment.</p>
            </>
          )}
          {step === 'done' && (
            <>
              <h2 className="text-base font-bold text-white">C'est parti !</h2>
              <p className="text-xs text-gray-500 mt-1">Ton espace MERKURE est prêt</p>
            </>
          )}
        </div>

        {/* Contenu */}
        <div className="px-6 py-5">
          {error && (
            <div className="mb-4 px-4 py-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-400">
              {error}
            </div>
          )}

          {step === 'profile' && (
            <StepProfile data={profile} onChange={(patch) => setProfile((p) => ({ ...p, ...patch }))} />
          )}
          {step === 'broker' && (
            <StepBroker onConnect={handleBrokerConnect} onSkip={handleBrokerSkip} />
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

        {/* Footer — uniquement step profile */}
        {step === 'profile' && (
          <div className="px-6 py-4 border-t border-gray-800/60 flex justify-end">
            <button
              onClick={handleProfileNext}
              disabled={loading}
              className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : 'Continuer →'}
            </button>
          </div>
        )}
      </div>

      <p className="text-xs text-gray-700 mt-6">
        Tu peux modifier ces informations à tout moment dans ton profil.
      </p>
    </div>
  )
}
