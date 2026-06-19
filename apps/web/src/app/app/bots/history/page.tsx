import { History } from 'lucide-react'
import { ModulePlaceholderPage } from '@/features/navigation/ModulePlaceholderPage'

export default function BotHistoryRoute() {
  return (
    <ModulePlaceholderPage
      eyebrow="Bot Trading"
      title="Historique des Trades Auto"
      description="Auditez chaque exécution automatisée avec le contexte, la règle déclenchée et le résultat."
      icon={History}
      items={[
        'Journal détaillé des trades ouverts et clôturés par bot.',
        'Règle ou signal ayant déclenché l’exécution.',
        'Statut de l’ordre, latence et éventuelles erreurs.',
        'Filtrage par bot, compte, instrument et période.',
      ]}
    />
  )
}
