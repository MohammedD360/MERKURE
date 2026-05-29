'use client'

import { useRef, useState, useCallback } from 'react'
import { toPng } from 'html-to-image'

export function useChartExport(filename: string, bgColor = '#111827') {
  const ref = useRef<HTMLDivElement>(null)
  const [isExporting, setIsExporting] = useState(false)

  const download = useCallback(async () => {
    if (!ref.current) return
    setIsExporting(true)
    try {
      const dataUrl = await toPng(ref.current, {
        backgroundColor: bgColor,
        pixelRatio: 2,
        cacheBust: true,
      })
      const a = document.createElement('a')
      a.download = `${filename}-${new Date().toISOString().slice(0, 10)}.png`
      a.href = dataUrl
      a.click()
    } catch {
      // silent — export failures shouldn't crash the UI
    } finally {
      setIsExporting(false)
    }
  }, [filename, bgColor])

  return { ref, download, isExporting }
}
