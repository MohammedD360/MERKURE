import Link from 'next/link'

export default function ConfidentialitePage() {
  return (
    <main className="min-h-screen bg-[#070b10] px-6 py-16 text-white">
      <div className="mx-auto max-w-3xl">
        <Link href="/" className="text-sm font-bold text-blue-300 hover:text-blue-200">Retour à l'accueil</Link>
        <h1 className="mt-8 text-4xl font-black">Politique de confidentialité</h1>
        <div className="mt-8 space-y-6 text-sm font-medium leading-7 text-slate-300">
          <p>MERKURE traite les données nécessaires au fonctionnement du compte, à l'import des trades, à l'analyse des performances et à la sécurité du service.</p>
          <p>Les connexions broker sont conçues en lecture seule. MERKURE ne doit pas permettre de passer des ordres via ces connexions.</p>
          <p>Les modalités détaillées de conservation, suppression, sous-traitance et exercice des droits RGPD doivent être finalisées avant lancement public.</p>
        </div>
      </div>
    </main>
  )
}
