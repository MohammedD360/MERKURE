'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X, Upload, FileText, CheckCircle2, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { getToken } from '@/lib/api-client'
import { useAccounts } from '@/lib/hooks/use-accounts'

interface Props {
  open:    boolean
  onClose: () => void
}

interface ImportResult {
  imported: number
  skipped:  number
  errors:   string[]
}

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

const TRADOVATE_COLUMNS = [
  { col: 'Symbol',     ex: 'MNQU6' },
  { col: 'Direction',  ex: 'Buy / Sell' },
  { col: 'Open Time',  ex: '06/19/2026 09:32:00' },
  { col: 'Close Time', ex: '06/19/2026 10:15:00' },
  { col: 'Open Price', ex: '21450.50' },
  { col: 'Close Price',ex: '21520.00' },
  { col: 'Qty',        ex: '2' },
  { col: 'P&L',        ex: '277.50' },
  { col: 'Commission', ex: '-4.34' },
]

export function CsvImportModal({ open, onClose }: Props) {
  const queryClient = useQueryClient()
  const { data: accounts = [] } = useAccounts()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [mounted, setMounted] = useState(false)

  const [file,       setFile]       = useState<File | null>(null)
  const [accountId,  setAccountId]  = useState('')
  const [dragging,   setDragging]   = useState(false)
  const [loading,    setLoading]    = useState(false)
  const [result,     setResult]     = useState<ImportResult | null>(null)
  const [showFormat, setShowFormat] = useState(false)
  const [error,      setError]      = useState<string | null>(null)

  useEffect(() => { setMounted(true) }, [])

  const reset = () => {
    setFile(null); setResult(null); setError(null); setShowFormat(false)
  }

  const handleClose = () => { reset(); onClose() }

  const pickFile = (f: File) => {
    if (!f.name.endsWith('.csv') && f.type !== 'text/csv') {
      setError('Seuls les fichiers .csv sont acceptés')
      return
    }
    setFile(f); setResult(null); setError(null)
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) pickFile(f)
  }, [])

  const handleImport = async () => {
    if (!file) return
    setLoading(true); setResult(null); setError(null)

    try {
      const form = new FormData()
      form.append('file', file)
      if (accountId) form.append('accountId', accountId)

      const token = getToken()
      const res = await fetch(`${API}/api/v1/trades/import/csv`, {
        method:  'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body:    form,
      })

      const data = await res.json() as ImportResult & { error?: string; detail?: string }

      if (!res.ok) {
        setError(data.detail ?? data.error ?? `Erreur ${res.status}`)
        return
      }

      setResult(data)
      void queryClient.invalidateQueries({ queryKey: ['trades'] })
      void queryClient.invalidateQueries({ queryKey: ['kpis'] })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur réseau')
    } finally {
      setLoading(false)
    }
  }

  if (!open || !mounted) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleClose} />

      <div className="relative bg-white border border-[hsl(var(--border))] rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[hsl(var(--border))]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center">
              <Upload className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">Importer un CSV</h2>
              <p className="text-[11px] text-[hsl(var(--foreground-soft))]">Tradovate, MT4/MT5, cTrader, format libre</p>
            </div>
          </div>
          <button onClick={handleClose} className="p-1.5 rounded-lg hover:bg-[hsl(var(--accent))] text-[hsl(var(--foreground-soft))] hover:text-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-y-auto p-5 space-y-4">

          {/* Zone de dépôt */}
          {!result && (
            <>
              <div
                onDragOver={e => { e.preventDefault(); setDragging(true) }}
                onDragLeave={() => setDragging(false)}
                onDrop={onDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                  dragging
                    ? 'border-emerald-400 bg-emerald-50'
                    : file
                    ? 'border-emerald-300 bg-emerald-50/50'
                    : 'border-[hsl(var(--border))] hover:border-[hsl(var(--primary)/0.4)] hover:bg-[hsl(var(--accent))]'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,text/csv"
                  className="hidden"
                  onChange={e => { const f = e.target.files?.[0]; if (f) pickFile(f) }}
                />
                {file ? (
                  <div className="flex flex-col items-center gap-2">
                    <FileText className="w-8 h-8 text-emerald-500" />
                    <p className="text-sm font-semibold text-foreground">{file.name}</p>
                    <p className="text-xs text-[hsl(var(--foreground-soft))]">{(file.size / 1024).toFixed(1)} KB</p>
                    <button
                      onClick={e => { e.stopPropagation(); reset() }}
                      className="text-[11px] text-red-400 hover:text-red-600 underline"
                    >
                      Changer de fichier
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Upload className="w-8 h-8 text-[hsl(var(--foreground-soft))]/40" />
                    <p className="text-sm font-semibold text-foreground">Glisser-déposer ou cliquer</p>
                    <p className="text-xs text-[hsl(var(--foreground-soft))]">Fichier .csv — max 5 MB</p>
                  </div>
                )}
              </div>

              {/* Compte broker */}
              <div>
                <label className="text-[11px] font-semibold text-[hsl(var(--foreground-soft))] uppercase tracking-wider block mb-1.5">
                  Rattacher à un compte (optionnel)
                </label>
                <select
                  value={accountId}
                  onChange={e => setAccountId(e.target.value)}
                  className="w-full bg-white border border-[hsl(var(--border))] rounded-lg px-3 py-2 text-xs text-foreground focus:outline-none focus:border-[hsl(var(--primary))]"
                >
                  <option value="">Aucun compte sélectionné</option>
                  {accounts.map(a => (
                    <option key={a.id} value={a.id}>{a.label}</option>
                  ))}
                </select>
              </div>

              {/* Format Tradovate */}
              <div className="border border-[hsl(var(--border))] rounded-xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => setShowFormat(v => !v)}
                  className="w-full flex items-center justify-between px-4 py-3 text-xs font-semibold text-[hsl(var(--foreground-soft))] hover:bg-[hsl(var(--accent))] transition-colors"
                >
                  <span>Format attendu — Tradovate / format libre</span>
                  {showFormat ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>

                {showFormat && (
                  <div className="px-4 pb-4 space-y-3 border-t border-[hsl(var(--border))]">
                    <p className="text-[11px] text-[hsl(var(--foreground-soft))] pt-3">
                      Le parser accepte n'importe quel ordre de colonnes et détecte automatiquement le délimiteur (virgule, point-virgule, tabulation).
                    </p>
                    <div className="overflow-x-auto">
                      <table className="w-full text-[10px]">
                        <thead>
                          <tr className="border-b border-[hsl(var(--border))]">
                            <th className="text-left py-1.5 pr-3 font-semibold text-[hsl(var(--foreground-soft))] uppercase tracking-wide">Colonne</th>
                            <th className="text-left py-1.5 font-semibold text-[hsl(var(--foreground-soft))] uppercase tracking-wide">Exemple</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[hsl(var(--border))]/50">
                          {TRADOVATE_COLUMNS.map(({ col, ex }) => (
                            <tr key={col}>
                              <td className="py-1.5 pr-3 font-mono font-semibold text-foreground">{col}</td>
                              <td className="py-1.5 text-[hsl(var(--foreground-soft))]">{ex}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <p className="text-[10px] text-[hsl(var(--foreground-soft))]/70">
                      Colonnes obligatoires : <span className="font-semibold text-foreground">Symbol, Direction, Open Time, Open Price</span>. Toutes les autres sont optionnelles.
                    </p>
                  </div>
                )}
              </div>

              {error && (
                <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5">
                  <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-red-600">{error}</p>
                </div>
              )}
            </>
          )}

          {/* Résultat */}
          {result && (
            <div className="space-y-3">
              <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 flex-shrink-0" />
                <div>
                  <p className="text-sm font-bold text-emerald-700">Import terminé</p>
                  <p className="text-xs text-emerald-600 mt-0.5">
                    <span className="font-semibold">{result.imported} trade{result.imported > 1 ? 's' : ''}</span> importé{result.imported > 1 ? 's' : ''}
                    {result.skipped > 0 && ` · ${result.skipped} ignoré${result.skipped > 1 ? 's' : ''}`}
                  </p>
                </div>
              </div>

              {result.errors.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 space-y-1">
                  <p className="text-[11px] font-semibold text-amber-700">Avertissements ({result.errors.length})</p>
                  {result.errors.slice(0, 5).map((e, i) => (
                    <p key={i} className="text-[11px] text-amber-600">{e}</p>
                  ))}
                  {result.errors.length > 5 && (
                    <p className="text-[11px] text-amber-500">…et {result.errors.length - 5} autres</p>
                  )}
                </div>
              )}

              <button
                onClick={reset}
                className="w-full py-2 rounded-lg text-xs font-medium border border-[hsl(var(--border))] text-[hsl(var(--foreground-soft))] hover:bg-[hsl(var(--accent))] transition-colors"
              >
                Importer un autre fichier
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        {!result && (
          <div className="flex items-center justify-end gap-3 px-5 pb-5 pt-4 border-t border-[hsl(var(--border))]">
            <button onClick={handleClose} className="px-4 py-2 rounded-lg text-xs text-[hsl(var(--foreground-soft))] hover:text-foreground hover:bg-[hsl(var(--accent))] transition-colors">
              Annuler
            </button>
            <button
              onClick={handleImport}
              disabled={!file || loading}
              className="px-4 py-2 rounded-lg text-xs font-medium bg-emerald-600 hover:bg-emerald-700 text-white transition-colors disabled:opacity-50"
            >
              {loading ? 'Import en cours…' : 'Importer'}
            </button>
          </div>
        )}
        {result && (
          <div className="px-5 pb-5 border-t border-[hsl(var(--border))] pt-4">
            <button onClick={handleClose} className="w-full py-2 rounded-lg text-xs font-medium bg-[hsl(var(--primary))] hover:bg-[hsl(244_42%_44%)] text-white transition-colors">
              Voir mes trades
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body,
  )
}
