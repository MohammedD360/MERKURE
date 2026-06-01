import type { Metadata } from 'next'

import { LegalCard, LegalGrid, LegalList, LegalPage, LegalSection } from '../_components/LegalPage'

export const metadata: Metadata = {
  title: 'Mentions légales | MERKURE',
  description: 'Informations légales relatives au site et à l’application MERKURE.',
}

export default function MentionsLegalesPage() {
  return (
    <LegalPage
      eyebrow="Informations légales"
      title="Mentions légales"
      description="Cette page présente l’éditeur du service MERKURE, ses hébergeurs, les règles de propriété intellectuelle et les informations utiles pour contacter l’équipe."
      updatedAt="29 mai 2026"
    >
      <LegalSection title="Éditeur du service">
        <p>
          Le site et l’application MERKURE sont édités par MERKURE, service SaaS d’analyse de performance, de journalisation et de suivi du risque pour traders particuliers.
        </p>
        <LegalGrid>
          <LegalCard title="Contact éditeur">
            <p>Email : support@merkure.app</p>
            <p>Demandes relatives aux données personnelles : privacy@merkure.app</p>
          </LegalCard>
          <LegalCard title="Direction de publication">
            <p>La direction de publication est assurée par le représentant légal de l’entité éditrice de MERKURE.</p>
          </LegalCard>
        </LegalGrid>
        <p>
          MERKURE ne fournit pas de conseil en investissement, ne gère pas de portefeuille pour le compte de ses utilisateurs et ne permet pas de passer des ordres de marché.
        </p>
      </LegalSection>

      <LegalSection title="Hébergement et infrastructure">
        <p>
          L’application s’appuie sur des prestataires techniques professionnels pour l’hébergement, l’exploitation, la sécurité, le paiement et l’observabilité du service.
        </p>
        <LegalGrid>
          <LegalCard title="Application web">
            <p>Vercel Inc.</p>
            <p>440 N Barranca Ave #4133, Covina, CA 91723, États-Unis</p>
            <p>Site : vercel.com</p>
          </LegalCard>
          <LegalCard title="API et services applicatifs">
            <p>Railway Corp.</p>
            <p>548 Market St PMB 68956, San Francisco, CA 94104, États-Unis</p>
            <p>Site : railway.com</p>
          </LegalCard>
        </LegalGrid>
        <p>
          Des sous-traitants complémentaires peuvent intervenir pour la base de données, l’authentification, l’email, le paiement, le monitoring, l’IA ou la synchronisation broker. Ils sont détaillés dans la politique de confidentialité.
        </p>
      </LegalSection>

      <LegalSection title="Propriété intellectuelle">
        <LegalList
          items={[
            'La marque MERKURE, les interfaces, textes, composants, éléments graphiques, logos et contenus du site sont protégés par le droit de la propriété intellectuelle.',
            'Toute reproduction, extraction, distribution, modification ou réutilisation non autorisée de ces éléments est interdite.',
            'Les marques, logos ou noms de brokers et partenaires éventuellement cités restent la propriété de leurs titulaires respectifs.',
          ]}
        />
      </LegalSection>

      <LegalSection title="Nature du service">
        <p>
          MERKURE est un outil d’aide à l’analyse personnelle. Les données, graphiques, alertes, rapports et analyses IA sont fournis à titre informatif afin d’aider l’utilisateur à mieux comprendre son historique de trading.
        </p>
        <p>
          Les performances passées ne préjugent pas des performances futures. Le trading comporte un risque de perte en capital. L’utilisateur reste seul responsable de ses décisions.
        </p>
      </LegalSection>

      <LegalSection title="Signalement et contact">
        <p>
          Pour signaler une erreur, une atteinte à vos droits, une difficulté d’accès ou une question relative au service, vous pouvez contacter MERKURE à l’adresse support@merkure.app.
        </p>
      </LegalSection>
    </LegalPage>
  )
}
