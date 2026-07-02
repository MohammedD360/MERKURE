import { PlusCircle } from 'lucide-react'
import { CreateBotForm } from '../components/CreateBotForm'

export function CreateBotPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/40">Bot Trading — Polymarket</p>
        <h1 className="mt-1 flex items-center gap-2 text-2xl font-black text-white">
          <PlusCircle className="h-6 w-6 text-[hsl(var(--primary))]" /> Créer un Bot
        </h1>
        <p className="mt-2 text-sm text-white/50">
          Connectez une wallet Polymarket, définissez vos garde-fous de risque, et lancez un agent Claude
          autonome en mode paper trading (dry-run) par défaut.
        </p>
      </div>
      <CreateBotForm />
    </div>
  )
}
