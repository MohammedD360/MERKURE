import { redirect } from 'next/navigation'

/**
 * Le suivi prop firm vit désormais sur la page Comptes, rattaché au compte
 * broker concerné. On conserve la route pour ne pas casser les liens existants.
 */
export default function Page() {
  redirect('/app/accounts')
}
