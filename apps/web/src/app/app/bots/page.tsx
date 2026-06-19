import { Bot } from 'lucide-react'
import { ModulePlaceholderPage } from '@/features/navigation/ModulePlaceholderPage'

export default function BotsRoute() {
  return (
    <ModulePlaceholderPage
      eyebrow="Bot Trading"
      title="Mes Bots"
      description="Pilotez vos automatisations depuis une vue claire: statut, règles, exposition et dernières exécutions."
      icon={Bot}
      primaryAction={{ href: '/app/bots/create', label: 'Créer un bot' }}
      items={[
        'Liste des bots actifs, en pause et en brouillon.',
        'Résumé du capital exposé par stratégie.',
        'Garde-fous de risque appliqués à chaque bot.',
        'Dernières exécutions et alertes opérationnelles.',
      ]}
    />
  )
}
