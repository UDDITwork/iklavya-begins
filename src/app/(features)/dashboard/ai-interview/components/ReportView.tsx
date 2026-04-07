'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowLeft, Download, RefreshCw, ChevronDown, ChevronUp,
  CheckCircle2, XCircle, Target, TrendingUp, Lightbulb, Sparkles,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { fadeInUp, fadeInUpTransition, staggerContainer, staggerItem } from '@/lib/animations'
import ConfidenceHeatmap from './ConfidenceHeatmap'
import MirrorEffect from './MirrorEffect'

// Types for report data shape
interface ScoreBreakdownItem {
  category: string
  score: number
}

interface FillerWordItem {
  word: string
  count: number
  suggestion?: string
}

interface QuestionBreakdown {
  question: string
  score: number
  strengths?: string[]
  weaknesses?: string[]
  answer_summary?: string
  ideal_answer?: string
  better_words?: Array<{ original: string; suggestion: string }>
}

interface ImprovementItem {
  priority: number
  area: string
  current: string
  target: string
  actions: string[]
}

interface ReportViewProps {
  sessionId: string | null
  reportData: Record<string, unknown>
  onPracticeAgain: () => void
  onBackToList: () => void
}

function scoreColor(score: number): string {
  if (score >= 70) return 'text-green-600'
  if (score >= 50) return 'text-amber-600'
  return 'text-red-600'
}

function scoreBg(score: number): string {
  if (score >= 70) return 'bg-green-500'
  if (score >= 50) return 'bg-amber-500'
  return 'bg-red-500'
}

function scoreRingColor(score: number): string {
  if (score >= 70) return 'stroke-green-500'
  if (score >= 50) return 'stroke-amber-500'
  return 'stroke-red-500'
}

function verdictBadge(score: number): { text: string; className: string } {
  if (score >= 85) return { text: 'Excellent', className: 'bg-green-100 text-green-700' }
  if (score >= 70) return { text: 'Good', className: 'bg-green-50 text-green-600' }
  if (score >= 55) return { text: 'Average', className: 'bg-amber-50 text-amber-600' }
  if (score >= 40) return { text: 'Below Average', className: 'bg-orange-50 text-orange-600' }
  return { text: 'Needs Improvement', className: 'bg-red-50 text-red-600' }
}

function CircularScore({ score }: { score: number }) {
  const radius = 54
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference

  return (
    <div className="relative w-36 h-36 mx-auto">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
        <circle
          cx="60" cy="60" r={radius}
          fill="none" stroke="#f3f4f6" strokeWidth="8"
        />
        <motion.circle
          cx="60" cy="60" r={radius}
          fill="none"
          className={scoreRingColor(score)}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.span
          className={`text-3xl font-bold ${scoreColor(score)}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {score}
        </motion.span>
      </div>
    </div>
  )
}

export default function ReportView({
  sessionId,
  reportData,
  onPracticeAgain,
  onBackToList,
}: ReportViewProps) {
  const [expandedQuestions, setExpandedQuestions] = useState<Set<number>>(new Set())

  // Safe accessor to avoid crashes on unexpected data shapes
  const safe = <T,>(fn: () => T, fallback: T): T => {
    try { return fn() ?? fallback } catch { return fallback }
  }

  // Parse report data — handle both AI output field names and our display types
  const jobRole = safe(() => (reportData.meta as Record<string, unknown>)?.job_role as string || (reportData.job_role as string), 'Interview')
  const date = safe(() => (reportData.meta as Record<string, unknown>)?.date as string, '')
  const durationSec = safe(() => (reportData.meta as Record<string, unknown>)?.duration_seconds as number, 0)
  const duration = durationSec ? `${Math.floor(durationSec / 60)}m ${durationSec % 60}s` : ''
  const overallScore = safe(() => Math.max(0, Math.min(100, reportData.overall_score as number)), 0)
  const verdictDesc = safe(() => (reportData.verdict_description as string) || (reportData.verdict as string), '')
  const verdictInfo = verdictBadge(overallScore)

  // scores: AI sends {confidence: 72, clarity: 85, ...} — convert to array
  const scoresObj = (reportData.scores as Record<string, number>) || {}
  const scoreBreakdown: ScoreBreakdownItem[] = Object.entries(scoresObj).map(([key, val]) => ({
    category: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' '),
    score: val,
  }))

  // filler_analysis: AI sends {total_fillers, breakdown: [{word, count, suggestion}]}
  const fillerData = reportData.filler_analysis as Record<string, unknown> | undefined
  const fillerWords: FillerWordItem[] = (fillerData?.breakdown as FillerWordItem[]) || (fillerData as unknown as FillerWordItem[]) || []

  // question_breakdown: AI sends [{question_text, student_answer_summary, score, strengths, weaknesses, ideal_answer_outline, better_words}]
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

  // improvement_plan: AI sends [{priority, area, current_state, target, action_steps}]
  const rawImprovements = (reportData.improvement_plan as Record<string, unknown>[]) || []
  const improvements: ImprovementItem[] = rawImprovements.map((item) => ({
    priority: (item.priority as number) || 0,
    area: (item.area as string) || '',
    current: (item.current_state as string) || (item.current as string) || '',
    target: (item.target as string) || '',
    actions: (item.action_steps as string[]) || (item.actions as string[]) || [],
  }))

  function toggleQuestion(index: number) {
    setExpandedQuestions((prev) => {
      const next = new Set(prev)
      if (next.has(index)) next.delete(index)
      else next.add(index)
      return next
    })
  }

  function handleDownloadPDF() {
    if (sessionId) {
      window.open(`/api/interview/sessions/${sessionId}/report/pdf`, '_blank')
    } else {
      toast('No session ID available', { icon: '⚠️' })
    }
  }

  return (
    <div className="p-6 sm:p-8 max-w-4xl mx-auto">
      {/* Back Link */}
      <motion.div
        variants={fadeInUp}
        initial="initial"
        animate="animate"
        transition={fadeInUpTransition}
      >
        <button
          onClick={onBackToList}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-6"
        >
          <ArrowLeft size={16} />
          Back to sessions
        </button>
      </motion.div>

      {/* Header */}
      <motion.div
        variants={fadeInUp}
        initial="initial"
        animate="animate"
        transition={{ ...fadeInUpTransition, delay: 0.05 }}
        className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm mb-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{jobRole} — Interview Report</h1>
            <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
              {date && <span>{date}</span>}
              {duration && (
                <>
                  <span>·</span>
                  <span>{duration}</span>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPDF}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Download size={14} />
              Download PDF
            </button>
            <button
              onClick={onPracticeAgain}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-800 text-white text-sm font-medium hover:bg-green-900 transition-colors"
            >
              <RefreshCw size={14} />
              Practice Again
            </button>
          </div>
        </div>
      </motion.div>

      {/* Overall Score */}
      <motion.div
        variants={fadeInUp}
        initial="initial"
        animate="animate"
        transition={{ ...fadeInUpTransition, delay: 0.1 }}
        className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm mb-6 text-center"
      >
        <CircularScore score={overallScore} />
        <div className="mt-3">
          <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${verdictInfo.className}`}>
            {verdictInfo.text}
          </span>
        </div>
        {verdictDesc && (
          <p className="text-sm text-gray-500 mt-3 max-w-lg mx-auto leading-relaxed">
            {verdictDesc}
          </p>
        )}
      </motion.div>

      {/* Score Breakdown */}
      {scoreBreakdown.length > 0 && (
        <motion.div
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          transition={{ ...fadeInUpTransition, delay: 0.15 }}
          className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm mb-6"
        >
          <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Target size={16} className="text-green-700" />
            Score Breakdown
          </h2>
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {scoreBreakdown.map((item, i) => (
              <motion.div
                key={i}
                variants={staggerItem}
                className="p-4 rounded-xl border border-gray-100 bg-gray-50"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">{item.category}</span>
                  <span className={`text-sm font-bold ${scoreColor(item.score)}`}>
                    {item.score}
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full ${scoreBg(item.score)}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${item.score}%` }}
                    transition={{ duration: 0.8, delay: 0.3 + i * 0.1, ease: 'easeOut' }}
                  />
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      )}

      {/* Confidence Heatmap Timeline */}
      {questions.length > 0 && (
        <ConfidenceHeatmap
          questions={questions.map((q, i) => ({
            question_index: i,
            question_text: q.question,
            score: q.score,
          }))}
          onSegmentClick={(i) => {
            toggleQuestion(i)
            // Scroll to that question
            setTimeout(() => {
              document.getElementById(`question-${i}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
            }, 100)
          }}
        />
      )}

      {/* Filler Word Analysis */}
      {fillerWords.length > 0 && (
        <motion.div
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          transition={{ ...fadeInUpTransition, delay: 0.2 }}
          className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm mb-6"
        >
          <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Sparkles size={16} className="text-amber-500" />
            Filler Word Analysis
          </h2>
          <div className="space-y-2">
            {fillerWords.map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-4 px-4 py-3 rounded-lg bg-gray-50 border border-gray-100"
              >
                <span className="text-sm font-mono font-semibold text-red-500 w-24">
                  &quot;{item.word}&quot;
                </span>
                <span className="text-xs font-bold text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full">
                  x{item.count}
                </span>
                {item.suggestion && (
                  <span className="text-xs text-gray-500 flex-1">
                    Try: <span className="text-green-700 font-medium">{item.suggestion}</span>
                  </span>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Question-by-Question Breakdown */}
      {questions.length > 0 && (
        <motion.div
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          transition={{ ...fadeInUpTransition, delay: 0.25 }}
          className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm mb-6"
        >
          <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Lightbulb size={16} className="text-yellow-500" />
            Question-by-Question Breakdown
          </h2>
          <div className="space-y-3">
            {questions.map((q, i) => {
              const isExpanded = expandedQuestions.has(i)
              return (
                <div key={i} id={`question-${i}`} className="border border-gray-100 rounded-xl overflow-hidden">
                  {/* Accordion Header */}
                  <button
                    onClick={() => toggleQuestion(i)}
                    className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-gray-50 transition-colors"
                  >
                    <span className="text-xs font-mono text-gray-400 w-6">Q{i + 1}</span>
                    <span className="flex-1 text-sm text-gray-800 line-clamp-1">
                      {q.question}
                    </span>
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${scoreBg(q.score)}`}
                          style={{ width: `${q.score}%` }}
                        />
                      </div>
                      <span className={`text-xs font-bold w-8 text-right ${scoreColor(q.score)}`}>
                        {q.score}
                      </span>
                      {isExpanded ? (
                        <ChevronUp size={14} className="text-gray-400" />
                      ) : (
                        <ChevronDown size={14} className="text-gray-400" />
                      )}
                    </div>
                  </button>

                  {/* Accordion Body */}
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      transition={{ duration: 0.2 }}
                      className="px-4 pb-4 space-y-3 border-t border-gray-100 pt-3"
                    >
                      {/* Strengths */}
                      {q.strengths && q.strengths.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-green-700 mb-1 flex items-center gap-1">
                            <CheckCircle2 size={12} /> Strengths
                          </p>
                          <ul className="space-y-1">
                            {q.strengths.map((s, si) => (
                              <li key={si} className="text-xs text-gray-600 pl-4 relative before:content-[''] before:absolute before:left-1 before:top-1.5 before:w-1.5 before:h-1.5 before:rounded-full before:bg-green-300">
                                {s}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Weaknesses */}
                      {q.weaknesses && q.weaknesses.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-red-600 mb-1 flex items-center gap-1">
                            <XCircle size={12} /> Areas to Improve
                          </p>
                          <ul className="space-y-1">
                            {q.weaknesses.map((w, wi) => (
                              <li key={wi} className="text-xs text-gray-600 pl-4 relative before:content-[''] before:absolute before:left-1 before:top-1.5 before:w-1.5 before:h-1.5 before:rounded-full before:bg-red-300">
                                {w}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Mirror Effect — side-by-side comparison */}
                      {q.answer_summary && q.ideal_answer && (
                        <MirrorEffect
                          studentAnswer={q.answer_summary}
                          idealAnswer={q.ideal_answer}
                          betterWords={q.better_words}
                        />
                      )}

                      {/* Fallback: just answer if no ideal */}
                      {q.answer_summary && !q.ideal_answer && (
                        <div className="bg-gray-50 rounded-lg px-3 py-2">
                          <p className="text-[10px] font-semibold uppercase text-gray-400 mb-1">What you said</p>
                          <p className="text-xs text-gray-600 leading-relaxed">{q.answer_summary}</p>
                        </div>
                      )}

                      {/* Better word suggestions */}
                      {q.better_words && q.better_words.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-gray-500 mb-1">
                            Better word choices:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {q.better_words.map((bw, bwi) => (
                              <span key={bwi} className="text-xs bg-green-50 text-green-800 px-2 py-1 rounded-md">
                                <span className="line-through text-gray-400 mr-1">{bw.original}</span>
                                {bw.suggestion}
                              </span>
                            ))}
                          </div>
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

      {/* Improvement Plan */}
      {improvements.length > 0 && (
        <motion.div
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          transition={{ ...fadeInUpTransition, delay: 0.3 }}
          className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm mb-6"
        >
          <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp size={16} className="text-green-500" />
            Improvement Plan
          </h2>
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="space-y-4"
          >
            {improvements.map((item, i) => (
              <motion.div
                key={i}
                variants={staggerItem}
                className="border border-gray-100 rounded-xl p-4"
              >
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 ${
                    item.priority === 1
                      ? 'bg-red-100 text-red-600'
                      : item.priority === 2
                        ? 'bg-amber-100 text-amber-600'
                        : 'bg-blue-100 text-blue-600'
                  }`}>
                    {item.priority}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-gray-900 mb-1">{item.area}</h3>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-xs mb-3">
                      <span className="text-gray-500">
                        Current: <span className="font-medium text-gray-700">{item.current}</span>
                      </span>
                      <span className="hidden sm:inline text-gray-300">→</span>
                      <span className="text-gray-500">
                        Target: <span className="font-medium text-green-700">{item.target}</span>
                      </span>
                    </div>
                    <ul className="space-y-1">
                      {item.actions.map((action, ai) => (
                        <li
                          key={ai}
                          className="text-xs text-gray-600 pl-4 relative before:content-[''] before:absolute before:left-1 before:top-1.5 before:w-1.5 before:h-1.5 before:rounded-full before:bg-green-400"
                        >
                          {action}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      )}

      {/* Bottom Actions */}
      <motion.div
        variants={fadeInUp}
        initial="initial"
        animate="animate"
        transition={{ ...fadeInUpTransition, delay: 0.35 }}
        className="flex items-center justify-center gap-4 pb-8"
      >
        <button
          onClick={handleDownloadPDF}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <Download size={14} />
          Download PDF
        </button>
        <button
          onClick={onPracticeAgain}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-green-800 text-white text-sm font-medium hover:bg-green-900 transition-colors"
        >
          <RefreshCw size={14} />
          Practice Again
        </button>
      </motion.div>
    </div>
  )
}
