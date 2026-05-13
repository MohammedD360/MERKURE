import { SignIn } from '@clerk/nextjs'
import Link from 'next/link'

import { isClerkEnabled } from '@/lib/auth-mode'

export default function SignInPage() {
  return (
    <main className="min-h-screen bg-[#090d14] px-6 py-12 text-white">
      <div className="mx-auto flex min-h-[calc(100vh-6rem)] max-w-md flex-col items-center justify-center">
        <div className="mb-8 text-center">
          <Link href="/" className="text-2xl font-black tracking-normal">
            MERKURE
          </Link>
          <p className="mt-2 text-sm text-gray-400">Connexion au cockpit trading.</p>
        </div>

        {isClerkEnabled ? (
          <SignIn />
        ) : (
          <div className="w-full rounded-xl border border-gray-800 bg-[#111827] p-6 text-center">
            <h1 className="text-lg font-bold">Mode démo local</h1>
            <p className="mt-2 text-sm text-gray-400">
              Aucun compte externe n'est requis tant que AUTH_MODE vaut demo.
            </p>
            <Link
              href="/app/dashboard"
              className="mt-6 inline-flex rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
            >
              Entrer dans MERKURE
            </Link>
          </div>
        )}
      </div>
    </main>
  )
}
