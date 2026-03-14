'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CheckCircle, XCircle, Clock, Award, ChevronDown, ArrowLeft,
  Loader2, AlertCircle, ExternalLink
} from 'lucide-react'
import { fadeInUp, fadeInUpTransition, staggerContainer, staggerItem } from '@/lib/animations'

interface QuestionResult {
  question_id: string
  question: string
  options: string[]
  selected_index: number | null
  correct_index: number
  is_correct: boolean
  explanation: string | null
}

interface ResultData {
  attempt_id: string
  assessment_id: string
  module_title: string
  score: number
  total: number
  percentage: number
  passed: boolean
  time_taken_seconds: number
  submitted_at: string
  questions: QuestionResult[]
  can_get_certified: boolean
  certificate_id: string | null
}

function getGrade(percentage: number) {
  if (percentage >= 90) return { letter: 'A', label: 'Excellent', color: 'text-emerald-600' }
  if (percentage >= 75) return { letter: 'B', label: 'Good', color: 'text-blue-600' }
  if (percentage >= 60) return { letter: 'C', label: 'Satisfactory', color: 'text-yellow-600' }
  return { letter: 'F', label: 'Needs Improvement', color: 'text-red-600' }
}

function formatTime(seconds: number) {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}m ${secs}s`
}

function CircularProgress({ percentage, passed }: { percentage: number; passed: boolean }) {
  const radius = 70
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percentage / 100) * circumference
  const color = passed ? '#16a34a' : '#dc2626'
  const bgColor = passed ? '#dcfce7' : '#fee2e2'

  return (
    <div className="relative w-48 h-48">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
        <circle
          cx="80" cy="80" r={radius}
          stroke={bgColor} strokeWidth="12" fill="none"
        />
        <motion.circle
          cx="80" cy="80" r={radius}
          stroke={color} strokeWidth="12" fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-4xl font-bold ${passed ? 'text-green-700' : 'text-red-600'}`}>
          {Math.round(percentage)}%
        </span>
      </div>
    </div>
  )
}

function QuestionAccordion({ q, index }: { q: QuestionResult; index: number }) {
  const [open, setOpen] = useState(false)

  return (
    <motion.div
      variants={staggerItem}
      transition={{ duration: 0.3 }}
      className={`border rounded-xl overflow-hidden ${
        q.is_correct ? 'border-green-200 bg-green-50/30' : 'border-red-200 bg-red-50/30'
      }`}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-white/40 transition-colors"
      >
        <span className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white ${
          q.is_correct ? 'bg-green-500' : 'bg-red-500'
        }`}>
          {index + 1}
        </span>
        <span className="flex-1 text-sm font-medium text-gray-800 line-clamp-2">
          {q.question}
        </span>
        <span className="flex-shrink-0 flex items-center gap-2">
          {q.is_correct ? (
            <CheckCircle size={18} className="text-green-500" />
          ) : (
            <XCircle size={18} className="text-red-500" />
          )}
          <ChevronDown
            size={16}
            className={`text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          />
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 space-y-3">
              <div className="space-y-2">
                {q.options.map((opt, oi) => {
                  const isCorrect = oi === q.correct_index
                  const isSelected = oi === q.selected_index
                  const isWrong = isSelected && !isCorrect

                  let classes = 'border border-gray-200 bg-white text-gray-700'
                  if (isCorrect) classes = 'border-green-400 bg-green-50 text-green-800 font-medium'
                  if (isWrong) classes = 'border-red-400 bg-red-50 text-red-800 font-medium'

                  return (
                    <div key={oi} className={`flex items-start gap-3 px-4 py-3 rounded-lg text-sm ${classes}`}>
                      <span className="flex-shrink-0 w-6 h-6 rounded-full border flex items-center justify-center text-xs font-bold mt-0.5">
                        {String.fromCharCode(65 + oi)}
                      </span>
                      <span className="flex-1">{opt}</span>
                      {isCorrect && <CheckCircle size={16} className="text-green-500 flex-shrink-0 mt-0.5" />}
                      {isWrong && <XCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />}
                    </div>
                  )
                })}
              </div>

              {q.selected_index === null && (
                <p className="text-xs text-gray-400 italic flex items-center gap-1">
                  <AlertCircle size={12} /> Not answered
                </p>
              )}

              {q.explanation && (
                <div className="mt-3 p-3 bg-blue-50 border border-blue-100 rounded-lg">
                  <p className="text-xs font-semibold text-blue-700 mb-1">Explanation</p>
                  <p className="text-sm text-blue-800">{q.explanation}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function ResultPage() {
  const params = useParams()
  const attemptId = params.attemptId as string

  const [data, setData] = useState<ResultData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [certLoading, setCertLoading] = useState(false)
  const [certId, setCertId] = useState<string | null>(null)

  const fetchResult = useCallback(async () => {
    try {
      const res = await fetch(`/api/assessments/results/${attemptId}`)
      if (!res.ok) throw new Error('Failed to load results')
      const json = await res.json()
      setData(json)
      setCertId(json.certificate_id)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }, [attemptId])

  useEffect(() => {
    fetchResult()
  }, [fetchResult])

  async function handleGetCertified() {
    if (!data) return
    setCertLoading(true)
    try {
      const res = await fetch('/api/certificates/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attempt_id: data.attempt_id }),
      })
      if (!res.ok) throw new Error('Failed to generate certificate')
      const json = await res.json()
      setCertId(json.cert_slug)
    } catch {
      setError('Failed to generate certificate. Please try again.')
    } finally {
      setCertLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    )
  }

  if (error && !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <AlertCircle className="w-12 h-12 text-red-400" />
        <p className="text-gray-600">{error}</p>
        <Link href="/assessments" className="text-green-600 hover:underline text-sm">
          Back to Assessments
        </Link>
      </div>
    )
  }

  if (!data) return null

  const grade = getGrade(data.percentage)

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="max-w-4xl mx-auto px-4 py-8 space-y-8"
    >
      {/* Header */}
      <motion.div variants={fadeInUp} transition={fadeInUpTransition}>
        <Link
          href="/assessments"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors mb-4"
        >
          <ArrowLeft size={16} /> Back to Assessments
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">{data.module_title}</h1>
        <p className="text-sm text-gray-500 mt-1">
          Submitted {new Date(data.submitted_at).toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
          })}
        </p>
      </motion.div>

      {/* Score Card */}
      <motion.div
        variants={fadeInUp}
        transition={fadeInUpTransition}
        className={`rounded-2xl border-2 p-8 ${
          data.passed
            ? 'border-green-200 bg-gradient-to-br from-green-50 to-emerald-50/50'
            : 'border-red-200 bg-gradient-to-br from-red-50 to-orange-50/50'
        }`}
      >
        <div className="flex flex-col md:flex-row items-center gap-8">
          <CircularProgress percentage={data.percentage} passed={data.passed} />

          <div className="flex-1 text-center md:text-left space-y-4">
            <div className="flex items-center justify-center md:justify-start gap-3">
              {data.passed ? (
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                  <XCircle className="w-6 h-6 text-red-600" />
                </div>
              )}
              <span className={`text-2xl font-bold ${data.passed ? 'text-green-700' : 'text-red-600'}`}>
                {data.passed ? 'Passed' : 'Failed'}
              </span>
            </div>

            <div className="text-5xl font-extrabold text-gray-900">
              {data.score}<span className="text-2xl text-gray-400 font-normal">/{data.total}</span>
            </div>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-semibold ${grade.color} bg-white/80 border`}>
                Grade: {grade.letter} — {grade.label}
              </span>
              <span className="inline-flex items-center gap-1.5 text-gray-500">
                <Clock size={14} /> {formatTime(data.time_taken_seconds)}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Action Buttons */}
      <motion.div variants={fadeInUp} transition={fadeInUpTransition} className="flex flex-wrap gap-3">
        {data.can_get_certified && !certId && (
          <button
            onClick={handleGetCertified}
            disabled={certLoading}
            className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 shadow-sm"
          >
            {certLoading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Award size={18} />
            )}
            Get Certified
          </button>
        )}

        {certId && (
          <Link
            href={`/cert/${certId}`}
            target="_blank"
            className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors shadow-sm"
          >
            <Award size={18} /> View Certificate <ExternalLink size={14} />
          </Link>
        )}

        {!data.passed && (
          <p className="flex items-center gap-2 px-4 py-3 text-sm text-orange-700 bg-orange-50 border border-orange-200 rounded-xl">
            <Clock size={16} /> You can retry after 24 hours
          </p>
        )}

        <Link
          href="/assessments"
          className="inline-flex items-center gap-2 px-6 py-3 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft size={16} /> All Assessments
        </Link>
      </motion.div>

      {error && data && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Question Review */}
      <motion.div variants={fadeInUp} transition={fadeInUpTransition} className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900">Question Review</h2>
        <p className="text-sm text-gray-500">
          {data.questions.filter((q) => q.is_correct).length} correct out of {data.questions.length} questions
        </p>

        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="space-y-3"
        >
          {data.questions.map((q, i) => (
            <QuestionAccordion key={q.question_id} q={q} index={i} />
          ))}
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
