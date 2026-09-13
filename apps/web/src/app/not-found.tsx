export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[hsl(var(--background))] px-6 text-center">
      <h1 className="text-xl font-semibold text-foreground">Page introuvable</h1>
      <p className="max-w-md text-sm text-[hsl(var(--foreground-soft))]">
        Cette page n'existe pas ou a été déplacée.
      </p>
      <a
        href="/"
        className="rounded-lg bg-[hsl(var(--primary))] px-4 py-2 text-sm font-medium text-white hover:bg-[hsl(243_90%_58%)]"
      >
        Retour à l'accueil
      </a>
    </div>
  )
}
