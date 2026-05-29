import Link from 'next/link'

export default function CguPage() {
  return (
    <main className="min-h-screen bg-[#070b10] px-6 py-16 text-white">
      <div className="mx-auto max-w-3xl">
        <Link href="/" className="text-sm font-bold text-blue-300 hover:text-blue-200">Retour à l'accueil</Link>
        <h1 className="mt-8 text-4xl font-black">Conditions générales d'utilisation</h1>
        <div className="mt-8 space-y-6 text-sm font-medium leading-7 text-slate-300">
          <p>MERKURE est fourni comme outil d'aide à l'analyse et à la discipline de trading. L'utilisateur reste seul responsable de ses décisions de marché.</p>
          <p>Les données, rapports et analyses présentés par MERKURE ne constituent pas une recommandation d'achat, de vente ou de conservation d'un instrument financier.</p>
          <p>Les conditions contractuelles complètes doivent être validées juridiquement avant commercialisation.</p>
        </div>
      </div>
    </main>
  )
}
