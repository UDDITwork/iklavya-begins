'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Plus, Loader2, Mic, Calendar, Trophy, Sparkles,
  Clock, BarChart3, ChevronRight, Target, TrendingUp,
  Award, Briefcase,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { fadeInUp, fadeInUpTransition, staggerContainer, staggerItem } from '@/lib/animations'

interface Session {
  id: string
  job_role: string
  status: string
  overall_score: number | null
  created_at: string
  duration_seconds: number | null
}

interface SessionListProps {
  onNewInterview: () => void
  onViewReport: (sessionId: string, data: Record<string, unknown>) => void
}

function scoreGrade(score: number): { label: string; color: string; bg: string; ring: string } {
  if (score >= 80) return { label: 'Excellent', color: 'text-green-700', bg: 'bg-green-50', ring: 'ring-green-200' }
  if (score >= 65) return { label: 'Good', color: 'text-green-600', bg: 'bg-green-50', ring: 'ring-green-200' }
  if (score >= 50) return { label: 'Average', color: 'text-amber-600', bg: 'bg-amber-50', ring: 'ring-amber-200' }
  if (score >= 35) return { label: 'Below Avg', color: 'text-orange-600', bg: 'bg-orange-50', ring: 'ring-orange-200' }
  return { label: 'Needs Work', color: 'text-red-600', bg: 'bg-red-50', ring: 'ring-red-200' }
}

function scoreBarColor(score: number): string {
  if (score >= 65) return 'bg-gradient-to-r from-green-500 to-green-400'
  if (score >= 50) return 'bg-gradient-to-r from-amber-500 to-amber-400'
  return 'bg-gradient-to-r from-red-500 to-red-400'
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

function formatDuration(seconds: number | null): string {
  if (!seconds) return '--'
  const m = Math.floor(seconds / 60)
  return `${m} min`
}

// Role icon mapping
function roleIcon(role: string) {
  const r = role.toLowerCase()
  if (r.includes('manager') || r.includes('lead')) return <Briefcase size={16} />
  if (r.includes('analyst') || r.includes('data')) return <BarChart3 size={16} />
  if (r.includes('sales') || r.includes('marketing')) return <TrendingUp size={16} />
  return <Target size={16} />
}

export default function SessionList({ onNewInterview, onViewReport }: SessionListProps) {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingReportId, setLoadingReportId] = useState<string | null>(null)

  useEffect(() => { fetchSessions() }, [])

  async function fetchSessions() {
    try {
      const res = await fetch('/api/interview/sessions')
      if (res.ok) {
        const data = await res.json()
        setSessions(data.sessions || [])
      }
    } catch { toast.error('Failed to load sessions') }
    finally { setLoading(false) }
  }

  async function handleViewReport(session: Session) {
    if (session.overall_score === null) return
    setLoadingReportId(session.id)
    try {
      const res = await fetch(`/api/interview/sessions/${session.id}/report`)
      if (res.ok) {
        const resp = await res.json()
        const data = typeof resp.report_json === 'string' ? JSON.parse(resp.report_json) : resp
        onViewReport(session.id, data)
      } else {
        toast.error('Report not available')
      }
    } catch { toast.error('Failed to load report') }
    finally { setLoadingReportId(null) }
  }

  const completedSessions = sessions.filter((s) => s.status === 'completed')
  const inProgressSessions = sessions.filter((s) => s.status !== 'completed')

  // Stats
  const totalInterviews = completedSessions.length
  const avgScore = totalInterviews > 0
    ? Math.round(completedSessions.reduce((sum, s) => sum + (s.overall_score || 0), 0) / totalInterviews)
    : 0
  const bestScore = totalInterviews > 0
    ? Math.max(...completedSessions.map(s => s.overall_score || 0))
    : 0

  return (
    <div className="p-6 sm:p-8 max-w-5xl">
      {/* Header */}
      <motion.div variants={fadeInUp} initial="initial" animate="animate" transition={fadeInUpTransition} className="mb-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center text-green-800">
                <Mic size={22} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">AI Mock Interview</h1>
                <p className="text-sm text-gray-500 flex items-center gap-1">
                  <Sparkles size={12} />
                  Practice realistic interviews and get AI-powered performance analysis
                </p>
              </div>
            </div>
            <button
              onClick={onNewInterview}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-green-800 text-white text-sm font-medium hover:bg-green-900 transition-colors shadow-sm"
            >
              <Plus size={16} />
              New Interview
            </button>
          </div>
        </div>
      </motion.div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={24} className="animate-spin text-gray-400" />
        </div>
      ) : sessions.length === 0 ? (
        /* Empty State */
        <motion.div variants={fadeInUp} initial="initial" animate="animate" transition={{ ...fadeInUpTransition, delay: 0.1 }}>
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-sm">
            {/* Decorative illustration */}
            <div className="relative w-28 h-28 mx-auto mb-6">
              <div className="absolute inset-0 rounded-full bg-green-50 animate-pulse" />
              <div className="absolute inset-3 rounded-full bg-green-100 flex items-center justify-center">
                <Mic size={36} className="text-green-600" />
              </div>
              <div className="absolute -right-2 -top-1 w-8 h-8 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center rotate-12">
                <Trophy size={14} className="text-amber-500" />
              </div>
              <div className="absolute -left-2 bottom-1 w-7 h-7 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center -rotate-12">
                <Award size={12} className="text-blue-500" />
              </div>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Your Interview Journey Starts Here</h2>
            <p className="text-sm text-gray-500 mb-8 max-w-md mx-auto leading-relaxed">
              Practice with an AI interviewer tailored to your target role. Get scored on confidence,
              clarity, structure, and domain knowledge — with a detailed improvement plan.
            </p>
            <button
              onClick={onNewInterview}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-green-800 text-white text-sm font-medium hover:bg-green-900 transition-colors shadow-sm"
            >
              <Mic size={16} />
              Start Your First Interview
            </button>
          </div>
        </motion.div>
      ) : (
        <div className="space-y-6">
          {/* Quick Stats Row */}
          {totalInterviews > 0 && (
            <motion.div variants={fadeInUp} initial="initial" animate="animate" transition={{ ...fadeInUpTransition, delay: 0.05 }}>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'Interviews', value: totalInterviews.toString(), icon: <Mic size={16} />, color: 'text-green-700 bg-green-50' },
                  { label: 'Avg Score', value: `${avgScore}%`, icon: <BarChart3 size={16} />, color: 'text-blue-700 bg-blue-50' },
                  { label: 'Best Score', value: `${bestScore}%`, icon: <Trophy size={16} />, color: 'text-amber-700 bg-amber-50' },
                ].map((stat) => (
                  <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${stat.color}`}>
                        {stat.icon}
                      </div>
                      <span className="text-xs text-gray-400 font-medium">{stat.label}</span>
                    </div>
                    <p className="text-xl font-bold text-gray-900 ml-9">{stat.value}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* In Progress */}
          {inProgressSessions.length > 0 && (
            <motion.div variants={fadeInUp} initial="initial" animate="animate" transition={{ ...fadeInUpTransition, delay: 0.1 }}>
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  In Progress
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {inProgressSessions.map((session) => (
                    <div key={session.id} className="flex items-center gap-3 p-3.5 rounded-xl bg-amber-50/50 border border-amber-100">
                      <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700 shrink-0">
                        {roleIcon(session.job_role)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{session.job_role}</p>
                        <p className="text-[11px] text-gray-400">Started {formatDate(session.created_at)}</p>
                      </div>
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 shrink-0">
                        Active
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Completed Interviews */}
          {completedSessions.length > 0 && (
            <motion.div variants={fadeInUp} initial="initial" animate="animate" transition={{ ...fadeInUpTransition, delay: 0.15 }}>
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  Completed Interviews
                </h2>
                <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-3">
                  {completedSessions.map((session) => {
                    const grade = session.overall_score !== null ? scoreGrade(session.overall_score) : null
                    const isLoadingThis = loadingReportId === session.id

                    return (
                      <motion.div key={session.id} variants={staggerItem}>
                        <div className={`relative rounded-xl border border-gray-100 bg-white overflow-hidden transition-all hover:border-gray-200 hover:shadow-sm ${
                          session.overall_score !== null ? 'cursor-pointer' : 'opacity-70'
                        }`}>
                          {/* Score accent bar on left */}
                          {session.overall_score !== null && (
                            <div className={`absolute left-0 top-0 bottom-0 w-1 ${scoreBarColor(session.overall_score)}`} />
                          )}

                          <div className="flex items-center gap-4 p-4 pl-5">
                            {/* Role icon */}
                            <div className="w-11 h-11 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-500 shrink-0">
                              {roleIcon(session.job_role)}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-0.5">
                                <p className="text-sm font-semibold text-gray-900 truncate">{session.job_role}</p>
                                {grade && (
                                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ring-1 ${grade.bg} ${grade.color} ${grade.ring}`}>
                                    {grade.label}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-3 text-[11px] text-gray-400">
                                <span className="flex items-center gap-1">
                                  <Calendar size={10} />
                                  {formatDate(session.created_at)}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock size={10} />
                                  {formatDuration(session.duration_seconds)}
                                </span>
                              </div>
                            </div>

                            {/* Score ring */}
                            {session.overall_score !== null && (
                              <div className="shrink-0 relative w-12 h-12">
                                <svg className="w-12 h-12 -rotate-90" viewBox="0 0 48 48">
                                  <circle cx="24" cy="24" r="20" fill="none" stroke="#f3f4f6" strokeWidth="3" />
                                  <circle
                                    cx="24" cy="24" r="20" fill="none"
                                    stroke={session.overall_score >= 65 ? '#16a34a' : session.overall_score >= 50 ? '#d97706' : '#dc2626'}
                                    strokeWidth="3" strokeLinecap="round"
                                    strokeDasharray={`${(session.overall_score / 100) * 125.6} 125.6`}
                                  />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <span className="text-xs font-bold text-gray-900">{session.overall_score}</span>
                                </div>
                              </div>
                            )}

                            {/* Action button */}
                            {session.overall_score !== null && (
                              <button
                                onClick={() => handleViewReport(session)}
                                disabled={isLoadingThis}
                                className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-lg bg-green-800 text-white text-xs font-medium hover:bg-green-900 transition-colors disabled:opacity-50"
                              >
                                {isLoadingThis ? (
                                  <Loader2 size={12} className="animate-spin" />
                                ) : (
                                  <>
                                    View Report
                                    <ChevronRight size={12} />
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </motion.div>
              </div>
            </motion.div>
          )}
        </div>
      )}
    </div>
  )
}
