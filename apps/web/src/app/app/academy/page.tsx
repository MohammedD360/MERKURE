import { GraduationCap } from 'lucide-react'
import { ModulePlaceholderPage } from '@/features/navigation/ModulePlaceholderPage'

export default function AcademyRoute() {
  return (
    <ModulePlaceholderPage
      eyebrow="Académie"
      title="Académie MERKURE"
      description="Centralisez les parcours, checklists et ressources utiles pour améliorer votre processus de trading."
      icon={GraduationCap}
      items={[
        'Parcours structurés par niveau et objectif.',
        'Ressources associées à vos erreurs récurrentes.',
        'Suivi de progression par module.',
        'Recommandations liées à vos derniers trades.',
      ]}
    />
  )
}
