'use client'

import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Shield, ChevronDown, ChevronUp, CheckCircle2,
  AlertTriangle, TrendingUp, Loader2, Search,
} from 'lucide-react'
import { playSuccess } from '@/lib/sounds'

interface ATSCategory {
  key: string
  label: string
  score: number
  max: number
  percentage: number
  tip?: string
  grade?: string
  type: 'deterministic' | 'semantic'
}

interface ATSResult {
  total_score: number
  max_score: number
  deterministic_total: number
  semantic_total: number
  categories: ATSCategory[]
  matched_keywords: string[]
  missing_keywords: string[]
  suggestions: string[]
}

type Phase = 'scanning' | 'revealing' | 'complete'

function scoreColor(pct: number): string {
  if (pct >= 80) return '#16a34a'
  if (pct >= 60) return '#ca8a04'
  if (pct >= 40) return '#ea580c'
  return '#dc2626'
}

function scoreLabel(pct: number): string {
  if (pct >= 80) return 'Excellent'
  if (pct >= 60) return 'Good'
  if (pct >= 40) return 'Needs Work'
  return 'Poor'
}

function gradeColor(grade: string): string {
  switch (grade) {
    case 'A': return 'bg-green-100 text-green-800'
    case 'B': return 'bg-emerald-100 text-emerald-700'
    case 'C': return 'bg-yellow-100 text-yellow-800'
    case 'D': return 'bg-orange-100 text-orange-800'
    default: return 'bg-red-100 text-red-800'
  }
}

export default function ATSScoreCard({ resumeId }: { resumeId: string }) {
  const [phase, setPhase] = useState<Phase>('scanning')
  const [result, setResult] = useState<ATSResult | null>(null)
  const [expanded, setExpanded] = useState(false)
  const [error, setError] = useState(false)
  const fetchedRef = useRef(false)

  useEffect(() => {
    if (fetchedRef.current) return
    fetchedRef.current = true

    const startTime = Date.now()

    fetch(`/api/resume/${resumeId}/ats-score`, { method: 'POST' })
      .then((res) => {
        if (!res.ok) throw new Error('Failed')
        return res.json()
      })
      .then((data: ATSResult) => {
        const elapsed = Date.now() - startTime
        const remaining = Math.max(0, 2000 - elapsed)
        setTimeout(() => {
          setResult(data)
          setPhase('revealing')
          playSuccess()
          setTimeout(() => setPhase('complete'), 2500)
        }, remaining)
      })
      .catch(() => {
        setError(true)
        setPhase('complete')
      })
  }, [resumeId])

  if (error) {
    return (
      <div className="mx-auto max-w-[85%] sm:max-w-[75%] rounded-xl border-2 border-amber-300 bg-amber-50 p-5">
        <div className="flex items-center gap-2 text-amber-700">
          <AlertTriangle size={18} />
          <span className="text-sm font-medium">ATS scoring unavailable. Try again later.</span>
        </div>
      </div>
    )
  }

  const pct = result ? Math.round((result.total_score / result.max_score) * 100) : 0
  const color = scoreColor(pct)

  return (
    <div className="mx-auto max-w-[85%] sm:max-w-[75%] rounded-xl border-2 border-blue-200 bg-white overflow-hidden">
      {/* Phase 1: Scanning */}
      <AnimatePresence mode="wait">
        {phase === 'scanning' && (
          <motion.div
            key="scanning"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-6"
          >
            <div className="flex flex-col items-center gap-4">
              {/* Scanning document animation */}
              <div className="relative w-16 h-20 rounded-lg border-2 border-blue-300 bg-blue-50 overflow-hidden">
                {/* Document lines */}
                <div className="absolute inset-x-3 top-3 space-y-1.5">
                  <div className="h-1 bg-blue-200 rounded-full" />
                  <div className="h-1 bg-blue-200 rounded-full w-4/5" />
                  <div className="h-1 bg-blue-200 rounded-full" />
                  <div className="h-1 bg-blue-200 rounded-full w-3/5" />
                  <div className="h-1 bg-blue-200 rounded-full w-4/5" />
                </div>
                {/* Sweeping scan line */}
                <motion.div
                  className="absolute inset-x-0 h-0.5 bg-blue-500"
                  style={{ boxShadow: '0 0 8px 2px rgba(59, 130, 246, 0.4)' }}
                  animate={{ top: ['0%', '100%', '0%'] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                />
              </div>
              <div className="flex items-center gap-2">
                <Loader2 size={14} className="animate-spin text-blue-500" />
                <span className="text-sm font-medium text-blue-700">Analyzing ATS Compatibility...</span>
              </div>
              <p className="text-xs text-gray-400 text-center">
                Scanning resume against career objective
              </p>
            </div>
          </motion.div>
        )}

        {/* Phase 2 & 3: Revealing & Complete */}
        {phase !== 'scanning' && result && (
          <motion.div
            key="result"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            {/* Header with score gauge */}
            <div className="p-5 pb-4">
              <div className="flex items-center gap-4">
                {/* Circular gauge */}
                <div className="relative w-20 h-20 shrink-0">
                  <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
                    {/* Background circle */}
                    <circle
                      cx="40" cy="40" r="34"
                      fill="none"
                      stroke="#e5e7eb"
                      strokeWidth="6"
                    />
                    {/* Score arc */}
                    <motion.circle
                      cx="40" cy="40" r="34"
                      fill="none"
                      stroke={color}
                      strokeWidth="6"
                      strokeLinecap="round"
                      strokeDasharray={2 * Math.PI * 34}
                      initial={{ strokeDashoffset: 2 * Math.PI * 34 }}
                      animate={{ strokeDashoffset: 2 * Math.PI * 34 * (1 - pct / 100) }}
                      transition={{ duration: 1.5, ease: 'easeOut', delay: 0.2 }}
                    />
                  </svg>
                  {/* Score number */}
                  <motion.div
                    className="absolute inset-0 flex flex-col items-center justify-center"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.8 }}
                  >
                    <span className="text-xl font-bold" style={{ color }}>{result.total_score}</span>
                    <span className="text-[9px] text-gray-400">/ {result.max_score}</span>
                  </motion.div>
                </div>

                {/* Score summary */}
                <div className="flex-1 min-w-0">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Shield size={16} style={{ color }} />
                      <span className="text-sm font-semibold text-gray-900">ATS Score</span>
                      <span
                        className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                        style={{ backgroundColor: `${color}15`, color }}
                      >
                        {scoreLabel(pct)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      Structure: {result.deterministic_total}/40 | Content: {result.semantic_total}/60
                    </p>
                  </motion.div>

                  {/* Top semantic bars */}
                  <div className="mt-3 space-y-1.5">
                    {result.categories
                      .filter((c) => c.type === 'semantic')
                      .slice(0, 3)
                      .map((cat, i) => (
                        <motion.div
                          key={cat.key}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 1.0 + i * 0.15 }}
                          className="flex items-center gap-2"
                        >
                          <span className="text-[10px] text-gray-500 w-24 truncate">{cat.label}</span>
                          <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <motion.div
                              className="h-full rounded-full"
                              style={{ backgroundColor: scoreColor(cat.percentage) }}
                              initial={{ width: 0 }}
                              animate={{ width: `${cat.percentage}%` }}
                              transition={{ duration: 0.8, delay: 1.2 + i * 0.15 }}
                            />
                          </div>
                          {cat.grade && (
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${gradeColor(cat.grade)}`}>
                              {cat.grade}
                            </span>
                          )}
                        </motion.div>
                      ))}
                  </div>
                </div>
              </div>

              {/* Keywords preview */}
              {result.matched_keywords.length > 0 && (
                <motion.div
                  className="mt-3 flex flex-wrap gap-1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.8 }}
                >
                  {result.matched_keywords.slice(0, 5).map((kw) => (
                    <span
                      key={kw}
                      className="px-2 py-0.5 rounded-full text-[9px] font-medium bg-green-50 text-green-700 border border-green-200"
                    >
                      {kw}
                    </span>
                  ))}
                  {result.matched_keywords.length > 5 && (
                    <span className="text-[9px] text-gray-400 self-center">
                      +{result.matched_keywords.length - 5} more
                    </span>
                  )}
                </motion.div>
              )}
            </div>

            {/* Expand button */}
            {phase === 'complete' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="w-full flex items-center justify-center gap-1.5 py-2.5 border-t border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <Search size={12} className="text-gray-400" />
                  <span className="text-xs font-medium text-gray-500">
                    {expanded ? 'Hide' : 'View'} Full Breakdown
                  </span>
                  {expanded ? (
                    <ChevronUp size={12} className="text-gray-400" />
                  ) : (
                    <ChevronDown size={12} className="text-gray-400" />
                  )}
                </button>
              </motion.div>
            )}

            {/* Expanded breakdown */}
            <AnimatePresence>
              {expanded && result && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden border-t border-gray-100"
                >
                  <div className="p-5 space-y-5">
                    {/* Structure Checks (Deterministic) */}
                    <div>
                      <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                        <CheckCircle2 size={12} className="text-blue-500" />
                        Structure Checks ({result.deterministic_total}/40)
                      </h4>
                      <div className="space-y-2">
                        {result.categories
                          .filter((c) => c.type === 'deterministic')
                          .map((cat) => (
                            <div key={cat.key} className="flex items-start gap-3">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-xs font-medium text-gray-700">{cat.label}</span>
                                  <span className="text-[10px] text-gray-400">{cat.score}/{cat.max}</span>
                                </div>
                                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                  <div
                                    className="h-full rounded-full transition-all duration-500"
                                    style={{
                                      width: `${cat.percentage}%`,
                                      backgroundColor: scoreColor(cat.percentage),
                                    }}
                                  />
                                </div>
                                {cat.tip && (
                                  <p className="text-[10px] text-gray-400 mt-1">{cat.tip}</p>
                                )}
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>

                    {/* AI Analysis (Semantic) */}
                    <div>
                      <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                        <TrendingUp size={12} className="text-purple-500" />
                        AI Content Analysis ({result.semantic_total}/60)
                      </h4>
                      <div className="space-y-2">
                        {result.categories
                          .filter((c) => c.type === 'semantic')
                          .map((cat) => (
                            <div key={cat.key} className="flex items-center gap-3">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-xs font-medium text-gray-700">{cat.label}</span>
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-[10px] text-gray-400">{cat.score}/{cat.max}</span>
                                    {cat.grade && (
                                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${gradeColor(cat.grade)}`}>
                                        {cat.grade}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                  <div
                                    className="h-full rounded-full transition-all duration-500"
                                    style={{
                                      width: `${cat.percentage}%`,
                                      backgroundColor: scoreColor(cat.percentage),
                                    }}
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>

                    {/* Keywords */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {result.matched_keywords.length > 0 && (
                        <div>
                          <h4 className="text-[10px] font-semibold text-green-700 uppercase tracking-wider mb-2">
                            Matched Keywords
                          </h4>
                          <div className="flex flex-wrap gap-1">
                            {result.matched_keywords.map((kw) => (
                              <span
                                key={kw}
                                className="px-2 py-0.5 rounded-full text-[9px] font-medium bg-green-50 text-green-700 border border-green-200"
                              >
                                {kw}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {result.missing_keywords.length > 0 && (
                        <div>
                          <h4 className="text-[10px] font-semibold text-amber-700 uppercase tracking-wider mb-2">
                            Missing Keywords
                          </h4>
                          <div className="flex flex-wrap gap-1">
                            {result.missing_keywords.map((kw) => (
                              <span
                                key={kw}
                                className="px-2 py-0.5 rounded-full text-[9px] font-medium bg-amber-50 text-amber-700 border border-amber-200"
                              >
                                {kw}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Suggestions */}
                    {result.suggestions.length > 0 && (
                      <div>
                        <h4 className="text-[10px] font-semibold text-gray-700 uppercase tracking-wider mb-2">
                          Improvement Suggestions
                        </h4>
                        <ol className="space-y-1.5">
                          {result.suggestions.map((s, i) => (
                            <li key={i} className="flex gap-2 text-xs text-gray-600 leading-relaxed">
                              <span className="shrink-0 w-4 h-4 rounded-full bg-blue-50 text-blue-600 text-[10px] font-bold flex items-center justify-center">
                                {i + 1}
                              </span>
                              {s}
                            </li>
                          ))}
                        </ol>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
