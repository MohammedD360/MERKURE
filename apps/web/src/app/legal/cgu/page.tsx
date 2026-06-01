import type { Metadata } from 'next'

import { LegalCard, LegalGrid, LegalList, LegalPage, LegalSection } from '../_components/LegalPage'

export const metadata: Metadata = {
  title: 'Conditions générales d’utilisation | MERKURE',
  description: 'Conditions d’utilisation du service MERKURE.',
}

export default function CguPage() {
  return (
    <LegalPage
      eyebrow="Conditions du service"
      title="Conditions générales d’utilisation"
      description="Les présentes conditions encadrent l’accès et l’utilisation de MERKURE, outil d’analyse, de journalisation et de suivi du risque destiné aux traders particuliers."
      updatedAt="29 mai 2026"
    >
      <LegalSection title="Objet">
        <p>
          MERKURE fournit une application permettant d’importer des trades, de suivre des indicateurs de performance, de tenir un journal, de consulter des rapports et d’obtenir des analyses automatisées.
        </p>
        <p>
          MERKURE est un outil d’aide à la lecture de données. Le service ne fournit pas de conseil en investissement, ne recommande pas d’acheter ou de vendre un instrument financier et ne permet pas de passer des ordres.
        </p>
      </LegalSection>

      <LegalSection title="Compte utilisateur">
        <LegalList
          items={[
            'L’utilisateur doit fournir des informations exactes lors de son inscription et maintenir la confidentialité de ses identifiants.',
            'L’utilisateur est responsable des actions réalisées depuis son compte, sauf preuve d’une faille imputable à MERKURE.',
            'MERKURE peut suspendre un compte en cas d’usage frauduleux, de tentative d’accès non autorisé, de contournement technique ou de violation des présentes conditions.',
          ]}
        />
      </LegalSection>

      <LegalSection title="Abonnements et paiement">
        <p>
          Les fonctionnalités disponibles dépendent du plan choisi. Les prix affichés sur la page tarifaire s’entendent toutes taxes comprises lorsque cela est applicable.
        </p>
        <LegalGrid>
          <LegalCard title="Paiement">
            <p>Les paiements et la gestion des moyens de paiement sont opérés par Stripe. MERKURE ne stocke pas les numéros complets de carte bancaire.</p>
          </LegalCard>
          <LegalCard title="Résiliation">
            <p>L’abonnement peut être résilié depuis l’espace de facturation. La résiliation prend effet selon les conditions affichées au moment de la souscription.</p>
          </LegalCard>
        </LegalGrid>
      </LegalSection>

      <LegalSection title="Données importées et connexions broker">
        <p>
          L’utilisateur reste propriétaire des données qu’il importe dans MERKURE. Il garantit disposer des droits nécessaires pour transmettre ces données au service.
        </p>
        <p>
          Les connexions broker sont prévues pour l’analyse et la synchronisation en lecture seule lorsque cette configuration est supportée. L’utilisateur doit vérifier les permissions accordées auprès de son broker ou du connecteur utilisé.
        </p>
      </LegalSection>

      <LegalSection title="Analyses IA et limites">
        <p>
          Les analyses IA, alertes comportementales, benchmarks et simulations fournis par MERKURE sont générés à partir des données disponibles dans le compte utilisateur. Ils peuvent contenir des erreurs, omissions ou interprétations incomplètes.
        </p>
        <p>
          Ces éléments ne constituent ni une promesse de performance, ni une recommandation financière, ni une garantie de réussite dans un challenge, une prop firm ou une stratégie de trading.
        </p>
      </LegalSection>

      <LegalSection title="Obligations de l’utilisateur">
        <LegalList
          items={[
            'Ne pas utiliser MERKURE pour tenter d’accéder aux données d’un tiers sans autorisation.',
            'Ne pas perturber l’infrastructure, contourner les limitations techniques ou automatiser abusivement les appels au service.',
            'Ne pas importer de contenu illicite, diffamatoire, frauduleux ou portant atteinte aux droits d’un tiers.',
            'Ne pas présenter les analyses MERKURE comme un conseil financier ou une certitude de performance.',
          ]}
        />
      </LegalSection>

      <LegalSection title="Disponibilité et maintenance">
        <p>
          MERKURE fait ses meilleurs efforts pour maintenir le service disponible et sécurisé. Des interruptions peuvent toutefois intervenir pour maintenance, mise à jour, incident technique, défaillance d’un prestataire ou force majeure.
        </p>
        <p>
          Les synchronisations broker, imports, exports et rapports peuvent dépendre de services tiers. MERKURE ne peut garantir la disponibilité permanente de ces services externes.
        </p>
      </LegalSection>

      <LegalSection title="Responsabilité">
        <p>
          L’utilisateur reconnaît que le trading comporte un risque de perte en capital. Il reste seul responsable de ses décisions de marché, de son money management, de ses paramètres broker et de l’usage qu’il fait des analyses affichées.
        </p>
        <p>
          MERKURE ne pourra être tenu responsable d’une perte de trading, d’une décision d’investissement, d’une erreur de saisie, d’un import incomplet ou d’une indisponibilité provenant d’un service tiers.
        </p>
      </LegalSection>

      <LegalSection title="Propriété intellectuelle">
        <p>
          MERKURE conserve l’ensemble des droits de propriété intellectuelle sur son logiciel, son interface, ses textes, ses modèles de présentation, ses composants et ses éléments visuels. L’utilisateur bénéficie uniquement d’un droit personnel, non exclusif et non transférable d’utiliser le service.
        </p>
      </LegalSection>

      <LegalSection title="Modification des conditions">
        <p>
          MERKURE peut faire évoluer les présentes conditions pour tenir compte de changements techniques, commerciaux, réglementaires ou de sécurité. En cas de modification substantielle, l’utilisateur sera informé par un moyen approprié.
        </p>
      </LegalSection>

      <LegalSection title="Droit applicable et contact">
        <p>
          Les présentes conditions sont régies par le droit français, sauf règles impératives contraires applicables au consommateur. Pour toute question ou réclamation : support@merkure.app.
        </p>
      </LegalSection>
    </LegalPage>
  )
}
