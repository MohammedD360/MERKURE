'use client'

import { Download, Loader2 } from 'lucide-react'

interface Props {
  onClick:     () => void
  isExporting: boolean
}

export function ChartDownloadButton({ onClick, isExporting }: Props) {
  return (
    <button
      onClick={onClick}
      disabled={isExporting}
      title="Télécharger en PNG"
      className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-700/60 text-gray-500 transition-colors hover:border-gray-600 hover:text-white disabled:opacity-40"
    >
      {isExporting
        ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
        : <Download className="h-3.5 w-3.5" />
      }
    </button>
  )
}
