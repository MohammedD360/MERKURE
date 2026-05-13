'use client'

import { CheckCircle, ArrowRight, Zap } from 'lucide-react'

interface Props {
  brokerConnected: boolean
  onFinish: () => void
  loading: boolean
}

export function StepDone({ brokerConnected, onFinish, loading }: Props) {
  return (
    <div className="flex flex-col items-center text-center gap-6 py-4">
      <div className="w-20 h-20 rounded-full bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center">
        <CheckCircle className="w-10 h-10 text-indigo-400" />
      </div>

      <div>
        <h3 className="text-xl font-bold text-white mb-2">Tout est prêt !</h3>
        <p className="text-sm text-gray-400 leading-relaxed max-w-xs mx-auto">
          Ton profil est configuré.{' '}
          {brokerConnected
            ? 'La synchronisation de l\'historique démarre en arrière-plan.'
            : 'Tu pourras connecter un broker depuis le dashboard.'}
        </p>
      </div>

      <div className="w-full space-y-2.5 text-left">
        {[
          brokerConnected ? 'Synchronisation broker en cours' : 'Connecter un broker plus tard',
          'KPIs calculés automatiquement',
          'Coach IA disponible dans le journal',
          'Alertes de risque configurables',
        ].map((item) => (
          <div key={item} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-800/40 border border-gray-700/30">
            <Zap className="w-4 h-4 text-indigo-400 flex-shrink-0" />
            <span className="text-sm text-gray-300">{item}</span>
          </div>
        ))}
      </div>

      <button
        onClick={onFinish}
        disabled={loading}
        className="w-full py-3.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 mt-2"
      >
        {loading ? (
          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <>Accéder au dashboard <ArrowRight className="w-4 h-4" /></>
        )}
      </button>
    </div>
  )
}
