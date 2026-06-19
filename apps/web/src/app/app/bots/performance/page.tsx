import { LineChart } from 'lucide-react'
import { ModulePlaceholderPage } from '@/features/navigation/ModulePlaceholderPage'

export default function BotPerformanceRoute() {
  return (
    <ModulePlaceholderPage
      eyebrow="Bot Trading"
      title="Performance des Bots"
      description="Comparez vos bots sur le P&L, le drawdown, la stabilité, l’exposition et la qualité d’exécution."
      icon={LineChart}
      items={[
        'Courbe equity par bot et par stratégie.',
        'Drawdown, win rate, profit factor et expectancy.',
        'Comparaison manuel versus automatique.',
        'Alertes de dégradation de performance.',
      ]}
    />
  )
}
