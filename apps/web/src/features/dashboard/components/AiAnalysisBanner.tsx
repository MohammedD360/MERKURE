import { CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react'
import { mockAiScore } from '@/lib/mock-data'

function ScoreCircle({ score }: { score: number }) {
  const r = 38
  const circ = 2 * Math.PI * r
  const filled = (score / 100) * circ
  const color = score >= 70 ? '#22c55e' : score >= 50 ? '#f59e0b' : '#ef4444'

  return (
    <div className="relative flex items-center justify-center w-24 h-24">
      <svg width="96" height="96" className="absolute">
        <circle cx="48" cy="48" r={r} fill="none" stroke="#1f2937" strokeWidth="6" />
        <circle
          cx="48" cy="48" r={r} fill="none"
          stroke={color} strokeWidth="6"
          strokeDasharray={`${filled} ${circ - filled}`}
          strokeLinecap="round"
          transform="rotate(-90 48 48)"
        />
      </svg>
      <div className="text-center z-10">
        <div className="text-2xl font-bold text-white font-mono leading-none">{score}</div>
        <div className="text-[10px] text-gray-500">/100</div>
      </div>
    </div>
  )
}

export function AiAnalysisBanner() {
  return (
    <div className="relative bg-gradient-to-r from-indigo-950/60 via-[#111827] to-[#111827] border border-indigo-500/20 rounded-xl p-5 overflow-hidden">
      {/* Glow décoratif */}
      <div className="absolute left-0 top-0 w-32 h-full bg-indigo-600/5 blur-2xl pointer-events-none" />

      <div className="flex items-start gap-6">
        {/* Icône IA */}
        <div className="w-16 h-16 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center flex-shrink-0">
          <svg viewBox="0 0 40 40" className="w-9 h-9" fill="none">
            <circle cx="20" cy="20" r="18" fill="#4f46e5" opacity="0.2" />
            <path d="M20 8C13.4 8 8 13.4 8 20s5.4 12 12 12 12-5.4 12-12S26.6 8 20 8zm0 4c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm4 14h-8v-2h3v-6h-3v-2h6v8h2v2z" fill="#818cf8" />
          </svg>
        </div>

        {/* Titre */}
        <div className="flex-shrink-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-sm font-bold text-white">Analyse IA de votre performance</h3>
            <span className="text-[9px] font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 px-1.5 py-0.5 rounded">BETA</span>
          </div>
        </div>

        {/* Points forts */}
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-semibold text-gray-400 mb-2 uppercase tracking-wider">Points forts</p>
          <div className="space-y-1.5">
            {mockAiScore.strengths.map((s) => (
              <div key={s} className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-400 flex-shrink-0 mt-0.5" />
                <span className="text-xs text-gray-300">{s}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Axes d'amélioration */}
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-semibold text-gray-400 mb-2 uppercase tracking-wider">Axes d'amélioration</p>
          <div className="space-y-1.5">
            {mockAiScore.improvements.map((s) => (
              <div key={s} className="flex items-start gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                <span className="text-xs text-gray-300">{s}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Score */}
        <div className="flex-shrink-0 flex flex-col items-center gap-2">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Score de performance</p>
          <ScoreCircle score={mockAiScore.score} />
          <p className="text-xs font-semibold text-green-400">{mockAiScore.label}</p>
          <p className="text-[10px] text-gray-500 text-center max-w-[140px]">{mockAiScore.sub}</p>
          <button className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors mt-1">
            Voir l'analyse complète <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  )
}
