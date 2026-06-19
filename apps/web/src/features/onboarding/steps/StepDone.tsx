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
      <div className="w-20 h-20 rounded-full border border-[hsl(var(--primary)/0.25)] bg-[hsl(var(--primary)/0.1)] flex items-center justify-center">
        <CheckCircle className="w-10 h-10 text-[hsl(var(--primary))]" />
      </div>

      <div>
        <h3 className="text-xl font-black text-foreground mb-2">Tout est prêt !</h3>
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
          <div key={item} className="flex items-center gap-3 bg-[hsl(var(--accent))] border border-[hsl(var(--border))] rounded-xl px-4 py-3">
            <Check className="h-4 w-4 text-[hsl(var(--primary))] shrink-0" />
            <span className="text-sm font-semibold text-muted-foreground">{item}</span>
          </div>
        ))}
      </div>

      <button
        onClick={onFinish}
        disabled={loading}
        className="bg-[hsl(var(--primary))] hover:bg-[hsl(244_42%_44%)] text-white font-black rounded-lg h-12 w-full text-sm shadow-sm flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed transition-colors mt-2"
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
