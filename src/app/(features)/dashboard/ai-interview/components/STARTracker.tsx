'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'

interface STARTrackerProps {
  candidateText: string // accumulated text from candidate's current answer
}

const STAR_PHASES = [
  { key: 'S', label: 'Situation', keywords: ['situation', 'context', 'background', 'when i was', 'at that time', 'in my previous', 'there was a', 'we were facing', 'the problem was', 'the challenge', 'the scenario', 'company', 'team', 'project'] },
  { key: 'T', label: 'Task', keywords: ['task', 'responsible', 'my role', 'i had to', 'i needed to', 'assigned', 'goal was', 'objective', 'expected to', 'was supposed to', 'my job was', 'duty'] },
  { key: 'A', label: 'Action', keywords: ['i did', 'i decided', 'i implemented', 'i created', 'i built', 'i led', 'i organized', 'i developed', 'approach', 'strategy', 'solution', 'i took', 'i started', 'first i', 'then i', 'steps'] },
  { key: 'R', label: 'Result', keywords: ['result', 'outcome', 'impact', 'increased', 'decreased', 'improved', 'achieved', 'grew', 'reduced', 'saved', 'percent', '%', 'revenue', 'success', 'learned', 'promoted'] },
]

function detectSTAR(text: string): Record<string, number> {
  const lower = text.toLowerCase()
  const scores: Record<string, number> = { S: 0, T: 0, A: 0, R: 0 }

  for (const phase of STAR_PHASES) {
    for (const kw of phase.keywords) {
      if (lower.includes(kw)) {
        scores[phase.key] += 1
      }
    }
  }

  // Normalize to 0-1
  const maxPossible = 5
  for (const key of Object.keys(scores)) {
    scores[key] = Math.min(scores[key] / maxPossible, 1)
  }

  return scores
}

export default function STARTracker({ candidateText }: STARTrackerProps) {
  const scores = useMemo(() => detectSTAR(candidateText), [candidateText])
  const hasAnyContent = candidateText.trim().length > 20

  if (!hasAnyContent) return null

  return (
    <div className="flex items-center gap-1">
      {STAR_PHASES.map((phase, i) => {
        const score = scores[phase.key]
        const isActive = score > 0
        const isFilled = score >= 0.6

        return (
          <div key={phase.key} className="flex items-center gap-1">
            {/* Connector line */}
            {i > 0 && (
              <div className={`w-4 h-[2px] ${isActive ? 'bg-green-500/50' : 'bg-gray-700'}`} />
            )}

            {/* Phase circle */}
            <div className="relative group">
              <motion.div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors ${
                  isFilled
                    ? 'bg-green-500 border-green-400 text-white shadow-lg shadow-green-500/30'
                    : isActive
                      ? 'bg-green-500/20 border-green-500/50 text-green-400'
                      : 'bg-gray-800 border-gray-700 text-gray-500'
                }`}
                animate={isFilled ? { scale: [1, 1.1, 1] } : {}}
                transition={isFilled ? { duration: 0.3 } : {}}
              >
                {phase.key}
              </motion.div>

              {/* Fill progress ring */}
              {isActive && !isFilled && (
                <svg className="absolute inset-0 w-8 h-8 -rotate-90" viewBox="0 0 32 32">
                  <circle
                    cx="16" cy="16" r="14"
                    fill="none" stroke="rgba(34,197,94,0.4)" strokeWidth="2"
                    strokeDasharray={`${score * 88} 88`}
                    strokeLinecap="round"
                  />
                </svg>
              )}

              {/* Tooltip */}
              <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <span className="text-[9px] text-gray-400 whitespace-nowrap bg-gray-900 px-1.5 py-0.5 rounded">
                  {phase.label}
                </span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
