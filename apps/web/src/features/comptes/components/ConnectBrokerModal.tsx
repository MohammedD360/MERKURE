'use client'

import { useState } from 'react'
import { X, ChevronRight, ArrowLeft, Eye, EyeOff, Check, Lock } from 'lucide-react'
import { brokerMeta, type BrokerType } from '@/lib/mock-comptes'

interface Props {
  open: boolean
  onClose: () => void
}

type Step = 'choose' | 'form' | 'success'

const brokers: BrokerType[] = ['MT5', 'MT4', 'BINANCE', 'IB', 'CTRADER']

function BrokerIcon({ broker }: { broker: BrokerType }) {
  const meta = brokerMeta[broker]
  return (
    <div
      className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0"
      style={{ backgroundColor: meta.bg, color: meta.color, border: `1px solid ${meta.color}40` }}
    >
      {broker === 'MT4' || broker === 'MT5' ? 'MT' : broker.slice(0, 2)}
    </div>
  )
}

// Champs de formulaire selon le broker choisi
function BrokerForm({ broker }: { broker: BrokerType }) {
  const [show, setShow] = useState(false)

  const Field = ({
    label, placeholder, type = 'text', hint,
  }: { label: string; placeholder: string; type?: string; hint?: string }) => (
    <div>
      <label className="block text-xs font-medium text-gray-400 mb-1.5">{label}</label>
      <div className="relative">
        <input
          type={type === 'password' ? (show ? 'text' : 'password') : type}
          placeholder={placeholder}
          className="w-full bg-gray-800/60 border border-gray-700/60 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/30 transition-all"
        />
        {type === 'password' && (
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
          >
            {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>
      {hint && <p className="text-[10px] text-gray-600 mt-1">{hint}</p>}
    </div>
  )

  if (broker === 'MT4' || broker === 'MT5') {
    return (
      <div className="space-y-4">
        <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-lg p-3">
          <p className="text-xs text-indigo-300 leading-relaxed">
            MERKURE se connecte à {brokerMeta[broker].name} via{' '}
            <span className="font-semibold">MetaAPI</span>. Renseigne tes identifiants MetaTrader
            — ils sont chiffrés et ne servent qu'à lire ton historique.
          </p>
        </div>
        <Field label="Libellé du compte" placeholder="Ex : Compte Principal Forex" />
        <Field label="Numéro de compte MT" placeholder="Ex : 1234567" />
        <Field
          label="Mot de passe (lecture seule recommandé)"
          placeholder="••••••••"
          type="password"
          hint="Utilise le mot de passe en lecture seule de ton compte MT pour plus de sécurité."
        />
        <Field label="Serveur MetaTrader" placeholder="Ex : Pepperstone-MT5" />
      </div>
    )
  }

  if (broker === 'BINANCE') {
    return (
      <div className="space-y-4">
        <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-3">
          <p className="text-xs text-amber-300 leading-relaxed">
            Crée une clé API Binance en <span className="font-semibold">lecture seule</span> depuis{' '}
            Paramètres → Gestion des API. N'active jamais les permissions de trading.
          </p>
        </div>
        <Field label="Libellé du compte" placeholder="Ex : Compte Crypto Binance" />
        <Field label="API Key" placeholder="Colle ta clé API ici" />
        <Field label="API Secret" placeholder="Colle ton secret API ici" type="password" />
      </div>
    )
  }

  if (broker === 'IB') {
    return (
      <div className="space-y-4">
        <div className="bg-green-500/5 border border-green-500/20 rounded-lg p-3">
          <p className="text-xs text-green-300 leading-relaxed">
            Connexion via l'API TWS d'Interactive Brokers. Assure-toi que TWS ou IB Gateway
            est ouvert et que l'accès API est activé.
          </p>
        </div>
        <Field label="Libellé du compte" placeholder="Ex : Compte IB Principale" />
        <Field label="Numéro de compte IB" placeholder="Ex : U1234567" />
        <Field label="Port TWS" placeholder="7497 (live) ou 7496 (paper)" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Field label="Libellé du compte" placeholder="Ex : Compte cTrader" />
      <Field label="Client ID" placeholder="Ton identifiant cTrader Open API" />
      <Field label="Client Secret" placeholder="••••••••" type="password" />
    </div>
  )
}

export function ConnectBrokerModal({ open, onClose }: Props) {
  const [step, setStep] = useState<Step>('choose')
  const [selected, setSelected] = useState<BrokerType | null>(null)
  const [loading, setLoading] = useState(false)

  if (!open) return null

  const handleClose = () => {
    setStep('choose')
    setSelected(null)
    onClose()
  }

  const handleConnect = () => {
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setStep('success')
    }, 1800)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-[#111827] border border-gray-700/60 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800/60">
          <div className="flex items-center gap-2">
            {step === 'form' && (
              <button
                onClick={() => setStep('choose')}
                className="w-7 h-7 rounded-lg hover:bg-gray-800 flex items-center justify-center text-gray-500 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <div>
              <h2 className="text-sm font-bold text-white">
                {step === 'choose' && 'Connecter un broker'}
                {step === 'form' && selected && `Connexion ${brokerMeta[selected].name}`}
                {step === 'success' && 'Compte connecté !'}
              </h2>
              <p className="text-[11px] text-gray-500 mt-0.5">
                {step === 'choose' && 'Choisis ton broker pour commencer'}
                {step === 'form' && 'Renseigne tes identifiants'}
                {step === 'success' && 'La synchronisation démarre…'}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-7 h-7 rounded-lg hover:bg-gray-800 flex items-center justify-center text-gray-500 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Corps */}
        <div className="px-6 py-5">
          {/* Étape 1 — Choix du broker */}
          {step === 'choose' && (
            <div className="space-y-2">
              {brokers.map((broker) => {
                const meta = brokerMeta[broker]
                return (
                  <button
                    key={broker}
                    onClick={() => { setSelected(broker); setStep('form') }}
                    className="w-full flex items-center gap-4 p-3.5 rounded-xl border border-gray-700/40 hover:border-indigo-500/30 hover:bg-indigo-500/5 transition-all group text-left"
                  >
                    <BrokerIcon broker={broker} />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-white">{meta.name}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{meta.desc}</div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-indigo-400 transition-colors" />
                  </button>
                )
              })}
            </div>
          )}

          {/* Étape 2 — Formulaire */}
          {step === 'form' && selected && (
            <div className="space-y-5">
              {/* Broker sélectionné */}
              <div className="flex items-center gap-3 p-3 bg-gray-800/40 rounded-xl border border-gray-700/40">
                <BrokerIcon broker={selected} />
                <div>
                  <p className="text-sm font-semibold text-white">{brokerMeta[selected].name}</p>
                  <p className="text-[11px] text-gray-500">{brokerMeta[selected].desc}</p>
                </div>
              </div>

              <BrokerForm broker={selected} />

              {/* Sécurité */}
              <div className="flex items-start gap-2 text-[11px] text-gray-600">
                <Lock className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-green-500" />
                Tes identifiants sont chiffrés avec AES-256. MERKURE ne peut
                jamais placer d'ordres en ton nom.
              </div>
            </div>
          )}

          {/* Étape 3 — Succès */}
          {step === 'success' && (
            <div className="flex flex-col items-center gap-4 py-6 text-center">
              <div className="w-16 h-16 rounded-full bg-green-500/15 border border-green-500/30 flex items-center justify-center">
                <Check className="w-8 h-8 text-green-400" />
              </div>
              <div>
                <p className="text-base font-bold text-white mb-1">Compte connecté !</p>
                <p className="text-sm text-gray-400">
                  La synchronisation de l'historique est en cours.<br />
                  Cela peut prendre 1 à 2 minutes.
                </p>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-1.5 overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full animate-pulse w-1/2" />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {step === 'form' && (
          <div className="px-6 py-4 border-t border-gray-800/60 flex gap-3">
            <button
              onClick={() => setStep('choose')}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium text-gray-400 bg-gray-800/60 hover:bg-gray-700/60 border border-gray-700/40 transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleConnect}
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Connexion…
                </>
              ) : 'Connecter le compte'}
            </button>
          </div>
        )}

        {step === 'success' && (
          <div className="px-6 py-4 border-t border-gray-800/60">
            <button
              onClick={handleClose}
              className="w-full py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors"
            >
              Voir mes comptes
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
