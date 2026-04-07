'use client'

import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowLeft, Download, RefreshCw, ChevronDown, ChevronUp,
  CheckCircle2, XCircle, TrendingUp, Zap,
  Clock, MessageSquare, BarChart3, Award,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { fadeInUp, fadeInUpTransition, staggerContainer, staggerItem } from '@/lib/animations'
import ConfidenceHeatmap from './ConfidenceHeatmap'
import MirrorEffect from './MirrorEffect'

interface ScoreBreakdownItem { category: string; score: number }
interface FillerWordItem { word: string; count: number; suggestion?: string }
interface QuestionBreakdown {
  question: string; score: number; strengths?: string[]; weaknesses?: string[]
  answer_summary?: string; ideal_answer?: string
  better_words?: Array<{ original: string; suggestion: string }>
}
interface ImprovementItem {
  priority: number; area: string; current: string; target: string; actions: string[]
}

interface ReportViewProps {
  sessionId: string | null
  reportData: Record<string, unknown>
  onPracticeAgain: () => void
  onBackToList: () => void
}

function scoreTier(score: number): { label: string; color: string; bg: string; barColor: string } {
  if (score >= 80) return { label: 'Excellent', color: 'text-green-700', bg: 'bg-green-50 border-green-200', barColor: 'bg-green-500' }
  if (score >= 65) return { label: 'Good', color: 'text-green-600', bg: 'bg-green-50 border-green-200', barColor: 'bg-green-500' }
  if (score >= 50) return { label: 'Average', color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200', barColor: 'bg-amber-500' }
  if (score >= 35) return { label: 'Below Average', color: 'text-orange-600', bg: 'bg-orange-50 border-orange-200', barColor: 'bg-orange-500' }
  return { label: 'Needs Improvement', color: 'text-red-600', bg: 'bg-red-50 border-red-200', barColor: 'bg-red-500' }
}

function AnimatedNumber({ value, duration = 1200 }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    let start = 0
    const end = value
    const startTime = Date.now()
    const tick = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3) // easeOutCubic
      start = Math.round(eased * end)
      setDisplay(start)
      if (progress < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [value, duration])

  return <span ref={ref}>{display}</span>
}

export default function ReportView({ sessionId, reportData, onPracticeAgain, onBackToList }: ReportViewProps) {
  const [expandedQuestions, setExpandedQuestions] = useState<Set<number>>(new Set())

  const safe = <T,>(fn: () => T, fallback: T): T => {
    try { return fn() ?? fallback } catch { return fallback }
  }

  // Parse data
  const jobRole = safe(() => (reportData.meta as Record<string, unknown>)?.job_role as string || (reportData.job_role as string), 'Interview')
  const date = safe(() => (reportData.meta as Record<string, unknown>)?.date as string, '')
  const durationSec = safe(() => (reportData.meta as Record<string, unknown>)?.duration_seconds as number, 0)
  const duration = durationSec ? `${Math.floor(durationSec / 60)}m ${durationSec % 60}s` : ''
  const overallScore = safe(() => Math.max(0, Math.min(100, reportData.overall_score as number)), 0)
  const verdictDesc = safe(() => (reportData.verdict_description as string) || (reportData.verdict_label as string) || '', '')
  const tier = scoreTier(overallScore)

  const scoresObj = (reportData.scores as Record<string, number>) || {}
  const scoreBreakdown: ScoreBreakdownItem[] = Object.entries(scoresObj).map(([key, val]) => ({
    category: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' '),
    score: typeof val === 'number' ? val : 0,
  })).sort((a, b) => b.score - a.score)

  const fillerData = reportData.filler_analysis as Record<string, unknown> | undefined
  const fillerWords: FillerWordItem[] = (fillerData?.breakdown as FillerWordItem[]) || (fillerData as unknown as FillerWordItem[]) || []
  const totalFillers = (fillerData?.total_fillers as number) || fillerWords.reduce((s, f) => s + f.count, 0)
  const fillersPerMin = (fillerData?.fillers_per_minute as number) || 0

  const rawQuestions = (reportData.question_breakdown as Record<string, unknown>[]) || []
  const questions: QuestionBreakdown[] = rawQuestions.map((q) => ({
    question: (q.question_text as string) || (q.question as string) || '',
    score: (q.score as number) || 0,
    strengths: q.strengths as string[],
    weaknesses: q.weaknesses as string[],
    answer_summary: (q.student_answer_summary as string) || (q.answer_summary as string),
    ideal_answer: (q.ideal_answer_outline as string) || (q.ideal_answer as string),
    better_words: Array.isArray(q.better_words)
      ? (q.better_words as string[]).map((bw) => {
          if (typeof bw === 'string' && bw.includes('→')) {
            const [orig, sug] = bw.split('→').map((s: string) => s.trim())
            return { original: orig, suggestion: sug }
          }
          return bw as unknown as { original: string; suggestion: string }
        })
      : undefined,
  }))

  const rawImprovements = (reportData.improvement_plan as Record<string, unknown>[]) || []
  const improvements: ImprovementItem[] = rawImprovements.map((item) => ({
    priority: (item.priority as number) || 0,
    area: (item.area as string) || '',
    current: (item.current_state as string) || (item.current as string) || '',
    target: (item.target as string) || '',
    actions: (item.action_steps as string[]) || (item.actions as string[]) || [],
  }))

  function toggleQuestion(i: number) {
    setExpandedQuestions((prev) => {
      const next = new Set(prev)
      if (next.has(i)) next.delete(i); else next.add(i)
      return next
    })
  }

  function handleDownloadPDF() {
    if (sessionId) window.open(`/api/interview/sessions/${sessionId}/report/pdf`, '_blank')
    else toast('No session available', { icon: '!' })
  }

  return (
    <div className="p-6 sm:p-8 max-w-4xl mx-auto">
      {/* Back */}
      <motion.div variants={fadeInUp} initial="initial" animate="animate" transition={fadeInUpTransition}>
        <button onClick={onBackToList} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-6">
          <ArrowLeft size={16} /> Back to sessions
        </button>
      </motion.div>

      {/* Header + Actions */}
      <motion.div variants={fadeInUp} initial="initial" animate="animate" transition={{ ...fadeInUpTransition, delay: 0.05 }}
        className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm mb-5"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-lg font-bold text-gray-900">{jobRole} — Performance Report</h1>
            <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
              {date && <span className="flex items-center gap-1"><Clock size={10} />{date}</span>}
              {duration && <span className="flex items-center gap-1"><MessageSquare size={10} />{duration}</span>}
              {questions.length > 0 && <span className="flex items-center gap-1"><BarChart3 size={10} />{questions.length} questions</span>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleDownloadPDF} className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-gray-200 text-xs text-gray-600 hover:bg-gray-50 transition-colors">
              <Download size={13} /> PDF
            </button>
            <button onClick={onPracticeAgain} className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-green-800 text-white text-xs font-medium hover:bg-green-900 transition-colors">
              <RefreshCw size={13} /> Practice Again
            </button>
          </div>
        </div>
      </motion.div>

      {/* ═══ OVERALL SCORE — Horizontal Gauge ═══ */}
      <motion.div variants={fadeInUp} initial="initial" animate="animate" transition={{ ...fadeInUpTransition, delay: 0.1 }}
        className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm mb-5"
      >
        <div className="flex items-start gap-5">
          {/* Big number */}
          <div className="text-center shrink-0">
            <div className={`text-4xl font-bold tabular-nums ${tier.color}`}>
              <AnimatedNumber value={overallScore} />
            </div>
            <div className="text-[10px] text-gray-400 mt-0.5">out of 100</div>
          </div>

          {/* Gauge + tier */}
          <div className="flex-1 pt-1">
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${tier.bg} ${tier.color}`}>
                {tier.label}
              </span>
            </div>

            {/* Horizontal thermometer gauge */}
            <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden mb-1.5">
              {/* Zone markers */}
              <div className="absolute inset-y-0 left-[35%] w-px bg-gray-200 z-10" />
              <div className="absolute inset-y-0 left-[50%] w-px bg-gray-200 z-10" />
              <div className="absolute inset-y-0 left-[65%] w-px bg-gray-200 z-10" />
              <div className="absolute inset-y-0 left-[80%] w-px bg-gray-200 z-10" />

              {/* Fill */}
              <motion.div
                className={`absolute inset-y-0 left-0 rounded-full ${tier.barColor}`}
                initial={{ width: 0 }}
                animate={{ width: `${overallScore}%` }}
                transition={{ duration: 1, delay: 0.3, ease: [0.4, 0, 0.2, 1] }}
              />
            </div>

            {/* Zone labels */}
            <div className="flex text-[9px] text-gray-300">
              <span className="flex-1">Needs Work</span>
              <span className="flex-1 text-center">Below Avg</span>
              <span className="flex-1 text-center">Average</span>
              <span className="flex-1 text-center">Good</span>
              <span className="flex-1 text-right">Excellent</span>
            </div>

            {verdictDesc && (
              <p className="text-xs text-gray-500 mt-2 leading-relaxed">{verdictDesc}</p>
            )}
          </div>
        </div>
      </motion.div>

      {/* ═══ SCORE BREAKDOWN — Compact Horizontal Bars ═══ */}
      {scoreBreakdown.length > 0 && (
        <motion.div variants={fadeInUp} initial="initial" animate="animate" transition={{ ...fadeInUpTransition, delay: 0.15 }}
          className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm mb-5"
        >
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Skill Assessment</h2>
          <div className="space-y-3">
            {scoreBreakdown.map((item, i) => {
              const itemTier = scoreTier(item.score)
              return (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 w-28 shrink-0 truncate">{item.category}</span>
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full ${itemTier.barColor}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${item.score}%` }}
                      transition={{ duration: 0.8, delay: 0.3 + i * 0.08, ease: 'easeOut' }}
                    />
                  </div>
                  <span className={`text-xs font-semibold w-8 text-right tabular-nums ${itemTier.color}`}>
                    {item.score}
                  </span>
                </div>
              )
            })}
          </div>
        </motion.div>
      )}

      {/* ═══ CONFIDENCE HEATMAP ═══ */}
      {questions.length > 0 && (
        <ConfidenceHeatmap
          questions={questions.map((q, i) => ({ question_index: i, question_text: q.question, score: q.score }))}
          onSegmentClick={(i) => {
            toggleQuestion(i)
            setTimeout(() => document.getElementById(`question-${i}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100)
          }}
        />
      )}

      {/* ═══ FILLER WORDS — Sorted Horizontal Bars ═══ */}
      {fillerWords.length > 0 && (
        <motion.div variants={fadeInUp} initial="initial" animate="animate" transition={{ ...fadeInUpTransition, delay: 0.2 }}
          className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm mb-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <Zap size={14} className="text-amber-500" />
              Filler Word Analysis
            </h2>
            <div className="flex items-center gap-3 text-[11px] text-gray-400">
              <span><strong className="text-gray-600">{totalFillers}</strong> total</span>
              {fillersPerMin > 0 && <span><strong className="text-gray-600">{fillersPerMin.toFixed(1)}</strong>/min</span>}
            </div>
          </div>

          <div className="space-y-2.5">
            {fillerWords.sort((a, b) => b.count - a.count).map((item, i) => {
              const maxCount = Math.max(...fillerWords.map(f => f.count), 1)
              return (
                <div key={i} className="group">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-gray-600 w-20 shrink-0">&ldquo;{item.word}&rdquo;</span>
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-red-400"
                        initial={{ width: 0 }}
                        animate={{ width: `${(item.count / maxCount) * 100}%` }}
                        transition={{ duration: 0.6, delay: 0.2 + i * 0.05 }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-gray-500 w-6 text-right">{item.count}</span>
                  </div>
                  {item.suggestion && (
                    <p className="text-[10px] text-gray-400 ml-[92px] mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      Try: <span className="text-green-600">{item.suggestion}</span>
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        </motion.div>
      )}

      {/* ═══ QUESTION-BY-QUESTION ═══ */}
      {questions.length > 0 && (
        <motion.div variants={fadeInUp} initial="initial" animate="animate" transition={{ ...fadeInUpTransition, delay: 0.25 }}
          className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm mb-5"
        >
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Question-by-Question Breakdown</h2>
          <div className="space-y-2">
            {questions.map((q, i) => {
              const isExpanded = expandedQuestions.has(i)
              const qTier = scoreTier(q.score)
              return (
                <div key={i} id={`question-${i}`} className="border border-gray-100 rounded-lg overflow-hidden">
                  <button
                    onClick={() => toggleQuestion(i)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50/50 transition-colors"
                  >
                    <span className="text-[10px] font-mono text-gray-300 w-6 shrink-0">Q{i + 1}</span>
                    <span className="flex-1 text-xs text-gray-700 line-clamp-1">{q.question}</span>
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="w-12 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${qTier.barColor}`} style={{ width: `${q.score}%` }} />
                      </div>
                      <span className={`text-[11px] font-bold w-6 text-right tabular-nums ${qTier.color}`}>{q.score}</span>
                      {isExpanded ? <ChevronUp size={13} className="text-gray-300" /> : <ChevronDown size={13} className="text-gray-300" />}
                    </div>
                  </button>

                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      transition={{ duration: 0.2 }}
                      className="px-4 pb-4 space-y-3 border-t border-gray-50 pt-3"
                    >
                      {/* Strengths + Weaknesses inline */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {q.strengths && q.strengths.length > 0 && (
                          <div>
                            <p className="text-[10px] font-semibold text-green-700 mb-1 flex items-center gap-1">
                              <CheckCircle2 size={10} /> Strengths
                            </p>
                            <ul className="space-y-0.5">
                              {q.strengths.map((s, si) => (
                                <li key={si} className="text-[11px] text-gray-600 pl-3 relative before:content-[''] before:absolute before:left-0 before:top-[6px] before:w-1 before:h-1 before:rounded-full before:bg-green-400">
                                  {s}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {q.weaknesses && q.weaknesses.length > 0 && (
                          <div>
                            <p className="text-[10px] font-semibold text-red-600 mb-1 flex items-center gap-1">
                              <XCircle size={10} /> Areas to Improve
                            </p>
                            <ul className="space-y-0.5">
                              {q.weaknesses.map((w, wi) => (
                                <li key={wi} className="text-[11px] text-gray-600 pl-3 relative before:content-[''] before:absolute before:left-0 before:top-[6px] before:w-1 before:h-1 before:rounded-full before:bg-red-400">
                                  {w}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      {/* Mirror Effect */}
                      {q.answer_summary && q.ideal_answer && (
                        <MirrorEffect studentAnswer={q.answer_summary} idealAnswer={q.ideal_answer} betterWords={q.better_words} />
                      )}
                      {q.answer_summary && !q.ideal_answer && (
                        <div className="bg-gray-50 rounded-lg px-3 py-2">
                          <p className="text-[10px] font-semibold uppercase text-gray-400 mb-1">What you said</p>
                          <p className="text-[11px] text-gray-600 leading-relaxed">{q.answer_summary}</p>
                        </div>
                      )}
                    </motion.div>
                  )}
                </div>
              )
            })}
          </div>
        </motion.div>
      )}

      {/* ═══ IMPROVEMENT PLAN — Timeline ═══ */}
      {improvements.length > 0 && (
        <motion.div variants={fadeInUp} initial="initial" animate="animate" transition={{ ...fadeInUpTransition, delay: 0.3 }}
          className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm mb-5"
        >
          <h2 className="text-sm font-semibold text-gray-900 mb-5 flex items-center gap-2">
            <TrendingUp size={14} className="text-green-600" />
            Improvement Roadmap
          </h2>

          <div className="relative">
            {/* Vertical timeline line */}
            <div className="absolute left-[15px] top-4 bottom-4 w-px bg-gray-200" />

            <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-5">
              {improvements.map((item, i) => (
                <motion.div key={i} variants={staggerItem} className="relative pl-10">
                  {/* Timeline node */}
                  <div className={`absolute left-0 top-0.5 w-[30px] h-[30px] rounded-full flex items-center justify-center text-xs font-bold border-2 ${
                    item.priority === 1 ? 'bg-red-50 border-red-300 text-red-600'
                    : item.priority === 2 ? 'bg-amber-50 border-amber-300 text-amber-600'
                    : 'bg-green-50 border-green-300 text-green-700'
                  }`}>
                    {item.priority}
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-1">{item.area}</h3>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-[11px] mb-2.5">
                      <span className="text-gray-500">
                        Now: <span className="text-gray-700 font-medium">{item.current}</span>
                      </span>
                      <span className="hidden sm:inline text-gray-300">→</span>
                      <span className="text-gray-500">
                        Goal: <span className="text-green-700 font-medium">{item.target}</span>
                      </span>
                    </div>
                    <div className="bg-gray-50 rounded-lg px-3 py-2">
                      <ul className="space-y-1">
                        {item.actions.map((action, ai) => (
                          <li key={ai} className="text-[11px] text-gray-600 pl-3 relative before:content-[''] before:absolute before:left-0 before:top-[6px] before:w-1 before:h-1 before:rounded-full before:bg-green-400">
                            {action}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.div>
      )}

      {/* Bottom Actions */}
      <motion.div variants={fadeInUp} initial="initial" animate="animate" transition={{ ...fadeInUpTransition, delay: 0.35 }}
        className="flex items-center justify-center gap-3 pb-8"
      >
        <button onClick={handleDownloadPDF} className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-gray-200 text-xs text-gray-600 hover:bg-gray-50 transition-colors">
          <Download size={13} /> Download PDF
        </button>
        <button onClick={onPracticeAgain} className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-green-800 text-white text-xs font-medium hover:bg-green-900 transition-colors">
          <Award size={13} /> Practice Again
        </button>
      </motion.div>
    </div>
  )
}
