import { History } from 'lucide-react'
import { ModulePlaceholderPage } from '@/features/navigation/ModulePlaceholderPage'

export default function IaHistoryRoute() {
  return (
    <ModulePlaceholderPage
      eyebrow="IA & Analyses"
      title="Historique IA"
      description="Retrouvez les rapports, recommandations et analyses générés sur votre compte."
      icon={History}
      items={[
        'Chronologie des analyses de performance.',
        'Actions prioritaires générées par période.',
        'Évolution du score IA et des biais détectés.',
        'Archivage des rapports hebdomadaires.',
      ]}
    />
  )
}
