import { PlusCircle } from 'lucide-react'
import { ModulePlaceholderPage } from '@/features/navigation/ModulePlaceholderPage'

export default function CreateBotRoute() {
  return (
    <ModulePlaceholderPage
      eyebrow="Bot Trading"
      title="Créer un Bot"
      description="Préparez un bot avec une logique de stratégie, des conditions d’entrée et des limites de risque."
      icon={PlusCircle}
      status="Assistant de création à connecter"
      items={[
        'Choix du compte, instrument et horizon de trading.',
        'Définition des conditions d’entrée, sortie et invalidation.',
        'Limites de pertes, drawdown et nombre de trades par session.',
        'Validation avant activation en réel.',
      ]}
    />
  )
}
