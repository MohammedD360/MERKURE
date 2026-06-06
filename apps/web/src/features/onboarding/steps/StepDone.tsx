'use client'

import { CheckCircle, ArrowRight, Check } from 'lucide-react'

interface Props {
  brokerConnected: boolean
  onFinish: () => void
  loading: boolean
}

export function StepDone({ brokerConnected, onFinish, loading }: Props) {
  return (
    <div className="flex flex-col items-center text-center gap-6 py-4">
      <div className="w-20 h-20 rounded-full border border-[#56bf6b]/30 bg-[#56bf6b]/10 flex items-center justify-center">
        <CheckCircle className="w-10 h-10 text-[#56bf6b]" />
      </div>

      <div>
        <h3 className="text-xl font-black text-white mb-2">Tout est prêt !</h3>
        <p className="text-sm font-semibold text-muted-foreground leading-relaxed max-w-xs mx-auto">
          Votre profil est configuré.{' '}
          {brokerConnected
            ? "La synchronisation de l'historique démarre en arrière-plan."
            : 'Vous pourrez connecter un broker depuis le dashboard.'}
        </p>
      </div>

      <div className="w-full space-y-2.5 text-left">
        {[
          brokerConnected ? 'Synchronisation broker en cours' : 'Connecter un broker plus tard',
          'KPIs calculés automatiquement',
          'Journal assisté disponible',
          'Alertes de risque configurables',
        ].map((item) => (
          <div key={item} className="flex items-center gap-3 bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3">
            <Check className="h-4 w-4 text-[#56bf6b] shrink-0" />
            <span className="text-sm font-semibold text-muted-foreground">{item}</span>
          </div>
        ))}
      </div>

      <button
        onClick={onFinish}
        disabled={loading}
        className="bg-[#56bf6b] hover:bg-[#49ab5e] text-white font-black rounded-lg h-12 w-full text-sm shadow-[0_6px_20px_rgba(86,191,107,0.22)] flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed transition-colors mt-2"
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
