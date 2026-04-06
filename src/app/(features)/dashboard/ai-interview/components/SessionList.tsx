'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Loader2, Mic, Calendar, Trophy, ArrowRight, Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'
import { fadeInUp, fadeInUpTransition, staggerContainer, staggerItem } from '@/lib/animations'

interface Session {
  id: string
  job_role: string
  status: string
  overall_score: number | null
  created_at: string
  duration_seconds: number | null
  report?: Record<string, unknown>
}

interface SessionListProps {
  onNewInterview: () => void
  onViewReport: (sessionId: string, data: Record<string, unknown>) => void
}

function scoreColor(score: number): string {
  if (score >= 70) return 'text-green-600 bg-green-50'
  if (score >= 50) return 'text-amber-600 bg-amber-50'
  return 'text-red-600 bg-red-50'
}

function scoreBarColor(score: number): string {
  if (score >= 70) return 'bg-green-500'
  if (score >= 50) return 'bg-amber-500'
  return 'bg-red-500'
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function formatDuration(seconds: number | null): string {
  if (!seconds) return '--'
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}m ${s}s`
}

export default function SessionList({ onNewInterview, onViewReport }: SessionListProps) {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSessions()
  }, [])

  async function fetchSessions() {
    try {
      const res = await fetch('/api/interview/sessions')
      if (res.ok) {
        const data = await res.json()
        setSessions(data.sessions || [])
      }
    } catch {
      toast.error('Failed to load sessions')
    } finally {
      setLoading(false)
    }
  }

  async function handleCardClick(session: Session) {
    if (session.status !== 'completed') return
    if (session.overall_score === null) return

    // Fetch full report data
    try {
      const res = await fetch(`/api/interview/sessions/${session.id}/report`)
      if (res.ok) {
        const reportResp = await res.json()
        // report_json is stored as a string in the DB, parse it
        const reportData = typeof reportResp.report_json === 'string'
          ? JSON.parse(reportResp.report_json)
          : reportResp
        onViewReport(session.id, reportData)
      } else {
        toast.error('Report not available yet')
      }
    } catch {
      toast.error('Failed to load report')
    }
  }

  const completedSessions = sessions.filter((s) => s.status === 'completed')
  const inProgressSessions = sessions.filter((s) => s.status !== 'completed')

  return (
    <div className="p-6 sm:p-8 max-w-5xl">
      {/* Header Card */}
      <motion.div
        variants={fadeInUp}
        initial="initial"
        animate="animate"
        transition={fadeInUpTransition}
        className="mb-6"
      >
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-800">
                <Mic size={22} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">AI Mock Interview</h1>
                <p className="text-sm text-gray-500 flex items-center gap-1">
                  <Sparkles size={12} />
                  Practice realistic interviews with AI and get detailed feedback
                </p>
              </div>
            </div>

            <button
              onClick={onNewInterview}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-green-800 text-white text-sm font-medium hover:bg-green-900 transition-colors shadow-sm"
            >
              <Plus size={16} />
              Start New Interview
            </button>
          </div>
        </div>
      </motion.div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={24} className="animate-spin text-gray-400" />
        </div>
      ) : sessions.length === 0 ? (
        <motion.div
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          transition={{ ...fadeInUpTransition, delay: 0.1 }}
        >
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-sm">
            <div className="flex items-center justify-center gap-2 mb-6">
              <div className="w-16 h-16 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-300">
                <Mic size={30} />
              </div>
              <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-green-300 -ml-4 mt-4">
                <Trophy size={22} />
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-300 -ml-3 mt-1">
                <Calendar size={18} />
              </div>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              Start Your First Mock Interview
            </h2>
            <p className="text-sm text-gray-500 mb-8 max-w-md mx-auto leading-relaxed">
              Practice with an AI interviewer tailored to your target role. Get scored
              on confidence, clarity, structure, and more — with actionable improvement tips.
            </p>
            <button
              onClick={onNewInterview}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-green-800 text-white text-sm font-medium hover:bg-green-900 transition-colors shadow-sm"
            >
              <Plus size={16} />
              Start First Interview
            </button>
          </div>
        </motion.div>
      ) : (
        <div className="space-y-6">
          {/* In Progress */}
          {inProgressSessions.length > 0 && (
            <motion.div
              variants={fadeInUp}
              initial="initial"
              animate="animate"
              transition={{ ...fadeInUpTransition, delay: 0.1 }}
            >
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <h2 className="text-base font-semibold text-gray-900 mb-4">In Progress</h2>
                <motion.div
                  variants={staggerContainer}
                  initial="initial"
                  animate="animate"
                  className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                >
                  {inProgressSessions.map((session) => (
                    <motion.div key={session.id} variants={staggerItem}>
                      <div className="p-4 rounded-xl border border-gray-200 bg-white">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-semibold text-gray-900">
                            {session.job_role}
                          </span>
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-50 text-amber-600">
                            In Progress
                          </span>
                        </div>
                        <p className="text-xs text-gray-400">
                          Started {formatDate(session.created_at)}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* Completed */}
          {completedSessions.length > 0 && (
            <motion.div
              variants={fadeInUp}
              initial="initial"
              animate="animate"
              transition={{ ...fadeInUpTransition, delay: 0.15 }}
            >
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <h2 className="text-base font-semibold text-gray-900 mb-4">
                  Completed Interviews
                </h2>
                <motion.div
                  variants={staggerContainer}
                  initial="initial"
                  animate="animate"
                  className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                >
                  {completedSessions.map((session) => (
                    <motion.div key={session.id} variants={staggerItem}>
                      <button
                        onClick={() => handleCardClick(session)}
                        disabled={session.overall_score === null}
                        className="w-full text-left p-4 rounded-xl border border-gray-200 hover:border-green-300 hover:shadow-sm transition-all bg-white disabled:opacity-60 disabled:cursor-default"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-semibold text-gray-900">
                            {session.job_role}
                          </span>
                          {session.overall_score !== null && (
                            <span
                              className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${scoreColor(session.overall_score)}`}
                            >
                              {session.overall_score}/100
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-400 mb-2">
                          <span>{formatDate(session.created_at)}</span>
                          <span>·</span>
                          <span>{formatDuration(session.duration_seconds)}</span>
                        </div>
                        {session.overall_score !== null && (
                          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${scoreBarColor(session.overall_score)}`}
                              style={{ width: `${session.overall_score}%` }}
                            />
                          </div>
                        )}
                        {session.overall_score !== null && (
                          <div className="flex items-center gap-1 mt-2 text-xs text-green-700 font-medium">
                            View Report <ArrowRight size={12} />
                          </div>
                        )}
                      </button>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </motion.div>
          )}
        </div>
      )}
    </div>
  )
}
