import Link from 'next/link'

export default function MentionsLegalesPage() {
  return (
    <main className="min-h-screen bg-[#070b10] px-6 py-16 text-white">
      <div className="mx-auto max-w-3xl">
        <Link href="/" className="text-sm font-bold text-blue-300 hover:text-blue-200">Retour à l'accueil</Link>
        <h1 className="mt-8 text-4xl font-black">Mentions légales</h1>
        <div className="mt-8 space-y-6 text-sm font-medium leading-7 text-slate-300">
          <p>MERKURE est édité par l'entité qui exploite le service. Les informations légales complètes doivent être complétées avant publication commerciale.</p>
          <p>Le site présente un outil d'analyse, de journalisation et de suivi du trading. MERKURE ne fournit pas de conseil en investissement.</p>
          <p>Contact : à compléter.</p>
        </div>
      </div>
    </main>
  )
}
