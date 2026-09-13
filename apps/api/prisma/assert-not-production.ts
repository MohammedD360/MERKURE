// Garde-fou : ces scripts de seed écrivent des données de démo (comptes, mots
// de passe connus, trades fictifs) directement en base. `infra/DEPLOY.md`
// documentait même de les lancer sur la prod Railway — sur un VPS auto-géré,
// une erreur de DATABASE_URL ne doit plus jamais pouvoir écraser de vraies
// données sans un geste explicite.
if (process.env.NODE_ENV === 'production' && process.env.SEED_CONFIRM !== 'yes-i-am-sure') {
  console.error(
    '[seed] Refusé : NODE_ENV=production sans SEED_CONFIRM=yes-i-am-sure. ' +
    'Si tu es certain de vouloir seeder cette base, relance avec SEED_CONFIRM=yes-i-am-sure.',
  )
  process.exit(1)
}
