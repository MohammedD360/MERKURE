import { MessageSquare } from 'lucide-react'
import { ModulePlaceholderPage } from '@/features/navigation/ModulePlaceholderPage'

export default function IaChatRoute() {
  return (
    <ModulePlaceholderPage
      eyebrow="IA & Analyses"
      title="Chat IA"
      description="Interrogez votre historique de trading, vos erreurs récurrentes et vos plans d’amélioration."
      icon={MessageSquare}
      status="Réservé au plan Elite"
      items={[
        'Questions sur vos trades, sessions et instruments.',
        'Synthèses contextualisées à partir de vos données.',
        'Plan d’action demandé en langage naturel.',
        'Historique des conversations et décisions associées.',
      ]}
    />
  )
}
