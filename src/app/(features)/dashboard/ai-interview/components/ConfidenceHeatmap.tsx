'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

interface QuestionScore {
  question_index?: number
  question_text?: string
  question?: string
  score: number
}

interface ConfidenceHeatmapProps {
  questions: QuestionScore[]
  onSegmentClick?: (index: number) => void
}

function scoreToColor(score: number): string {
  if (score >= 75) return '#22c55e' // green-500
  if (score >= 60) return '#84cc16' // lime-500
  if (score >= 45) return '#eab308' // yellow-500
  if (score >= 30) return '#f97316' // orange-500
  return '#ef4444' // red-500
}

function scoreToLabel(score: number): string {
  if (score >= 75) return 'Strong'
  if (score >= 60) return 'Good'
  if (score >= 45) return 'Average'
  if (score >= 30) return 'Weak'
  return 'Critical'
}

export default function ConfidenceHeatmap({ questions, onSegmentClick }: ConfidenceHeatmapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  // Animate on mount with small delay — IntersectionObserver doesn't work
  // reliably in nested scroll containers (dashboard layout)
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 300)
    return () => clearTimeout(timer)
  }, [])

  if (questions.length === 0) return null

  const maxScore = 100
  const barWidth = Math.max(100 / questions.length, 8)

  return (
    <div ref={containerRef} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm mb-6">
      <h2 className="text-base font-semibold text-gray-900 mb-2 flex items-center gap-2">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-green-700">
          <path d="M1 14h14M3 10h2v4H3zM7 6h2v8H7zM11 2h2v12h-2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Confidence Timeline
      </h2>
      <p className="text-xs text-gray-400 mb-5">Click any segment to jump to that question</p>

      {/* Waveform — 128px tall, bars use pixel heights */}
      <div className="relative flex items-end gap-[2px]" style={{ height: '128px' }}>
        {questions.map((q, i) => {
          const heightPx = Math.max((q.score / maxScore) * 128, 2) // min 2px so zero scores are visible
          const color = scoreToColor(q.score)
          const isHovered = hoveredIndex === i

          return (
            <div
              key={i}
              className="relative flex-1 flex flex-col items-center justify-end cursor-pointer group"
              style={{ minWidth: `${barWidth}%`, height: '128px' }}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
              onClick={() => onSegmentClick?.(i)}
            >
              {/* Tooltip */}
              {isHovered && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute -top-14 z-10 bg-gray-900 text-white text-[10px] px-2.5 py-1.5 rounded-lg shadow-lg whitespace-nowrap"
                >
                  <div className="font-semibold">Q{i + 1}: {q.score}/100</div>
                  <div className="text-gray-400">{scoreToLabel(q.score)}</div>
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2 h-2 bg-gray-900 rotate-45" />
                </motion.div>
              )}

              {/* Bar — uses pixel height, not percentage */}
              <motion.div
                className="w-full rounded-t-sm"
                style={{
                  backgroundColor: isHovered ? color : `${color}cc`,
                  boxShadow: isHovered ? `0 0 12px ${color}40` : 'none',
                }}
                initial={{ height: 0 }}
                animate={isVisible ? { height: heightPx } : { height: 0 }}
                transition={{ duration: 0.6, delay: i * 0.05, ease: [0.4, 0, 0.2, 1] }}
              />

              {/* Question number label */}
              <span className="text-[9px] text-gray-400 mt-1 group-hover:text-gray-700 transition-colors">
                {i + 1}
              </span>
            </div>
          )
        })}

        {/* Threshold lines — positioned from bottom using pixel calc */}
        <div className="absolute left-0 right-0 border-t border-dashed border-green-200/50" style={{ bottom: `${(75/100)*128}px` }} />
        <div className="absolute left-0 right-0 border-t border-dashed border-amber-200/50" style={{ bottom: `${(45/100)*128}px` }} />
        <div className="absolute left-0 right-0 border-t border-dashed border-red-200/50" style={{ bottom: `${(25/100)*128}px` }} />

        {/* Axis labels */}
        <div className="absolute -left-1 text-[8px] text-green-500" style={{ bottom: `${(75/100)*128 - 4}px` }}>75</div>
        <div className="absolute -left-1 text-[8px] text-amber-500" style={{ bottom: `${(45/100)*128 - 4}px` }}>45</div>
        <div className="absolute -left-1 text-[8px] text-red-500" style={{ bottom: `${(25/100)*128 - 4}px` }}>25</div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-4">
        {[
          { color: '#22c55e', label: 'Strong (75+)' },
          { color: '#eab308', label: 'Average (45-74)' },
          { color: '#ef4444', label: 'Needs Work (<45)' },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: color }} />
            <span className="text-[10px] text-gray-400">{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
