'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  Loader2,
  ClipboardCheck,
  Clock,
  CheckCircle,
  Lock,
  XCircle,
  Timer,
  Award,
  Database,
  HelpCircle,
  Target,
} from 'lucide-react'
import { useAuthStore } from '@/store/auth-store'
import {
  fadeInUp,
  fadeInUpTransition,
  staggerContainer,
  staggerItem,
} from '@/lib/animations'

interface Assessment {
  id: string
  module_id: string
  title: string
  description: string
  time_limit_seconds: number
  pass_threshold: number
  total_questions: number
  retry_cooldown_hours: number
  is_published: boolean
  created_at: string
  module_title: string
  module_category: string
  user_status: 'locked' | 'available' | 'passed' | 'failed' | 'cooldown'
  best_score: number | null
  last_attempt_at: string | null
  cooldown_until: string | null
}

function getHoursRemaining(cooldownUntil: string | null): number {
  if (!cooldownUntil) return 0
  const diff = new Date(cooldownUntil).getTime() - Date.now()
  if (diff <= 0) return 0
  return Math.ceil(diff / (1000 * 60 * 60))
}

export default function AssessmentsPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [loading, setLoading] = useState(true)
  const [seeding, setSeeding] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      const res = await fetch('/api/assessments')

      if (res.status === 401) {
        router.push('/login')
        return
      }

      const data = res.ok ? await res.json() : { assessments: [] }
      setAssessments(data.assessments || [])
    } catch {
      // Silent fail
    } finally {
      setLoading(false)
    }
  }

  function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60)
    return `${mins} Minutes`
  }

  return (
    <div className="p-6 sm:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <motion.div
        variants={fadeInUp}
        initial="initial"
        animate="animate"
        transition={fadeInUpTransition}
        className="mb-6"
      >
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-3">
 <div className="w-12 h-12 rounded-xl flex items-center justify-center text-emerald-800">
              <ClipboardCheck size={22} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Assessments</h1>
              <p className="text-sm text-gray-500">
                Test your knowledge and earn certificates
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={24} className="animate-spin text-gray-400" />
        </div>
      ) : assessments.length === 0 ? (
        <motion.div
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          transition={{ ...fadeInUpTransition, delay: 0.1 }}
        >
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-sm">
            <ClipboardCheck size={48} className="mx-auto text-gray-300 mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              No Assessments Available Yet
            </h2>
            <p className="text-sm text-gray-500 max-w-md mx-auto">
              Assessments are being prepared. Complete your classroom modules to
              unlock assessments and earn certificates.
            </p>
            {user?.role === 'admin' && (
              <button
                onClick={async () => {
                  setSeeding(true)
                  try {
                    const res = await fetch('/api/assessments/seed')
                    if (res.ok) {
                      await loadData()
                    }
                  } catch {
                    // silent
                  } finally {
                    setSeeding(false)
                  }
                }}
                disabled={seeding}
                className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {seeding ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Database size={16} />
                )}
                {seeding ? 'Seeding Assessments...' : 'Seed Assessments'}
              </button>
            )}
          </div>
        </motion.div>
      ) : (
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {assessments.map((assessment) => {
            const hoursLeft = getHoursRemaining(assessment.cooldown_until)

            return (
              <motion.div key={assessment.id} variants={staggerItem}>
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col h-full">
                  {/* Card body */}
                  <div className="p-5 flex-1 flex flex-col">
                    {/* Category badge */}
                    <span className="inline-flex self-start items-center px-2.5 py-1 rounded-full bg-violet-50 text-violet-700 text-[10px] font-bold uppercase tracking-wider mb-3">
                      {assessment.module_category}
                    </span>

                    {/* Title */}
                    <h3 className="text-base font-bold text-gray-900 mb-2 line-clamp-2">
                      {assessment.module_title}
                    </h3>

                    {/* Meta */}
                    <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
                      <span className="flex items-center gap-1">
                        <HelpCircle size={12} />
                        {assessment.total_questions} Questions
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {formatTime(assessment.time_limit_seconds)}
                      </span>
                    </div>

                    {/* Pass threshold */}
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-4">
                      <Target size={12} className="text-gray-400" />
                      <span>
                        {Math.round((assessment.pass_threshold / assessment.total_questions) * 100)}% to pass
                      </span>
                    </div>

                    {/* Spacer */}
                    <div className="flex-1" />

                    {/* Status & Action */}
                    {assessment.user_status === 'locked' && (
                      <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-gray-50 border border-gray-100">
                        <Lock size={14} className="text-gray-400" />
                        <span className="text-xs font-semibold text-gray-400">
                          Complete Module First
                        </span>
                      </div>
                    )}

                    {assessment.user_status === 'available' && (
                      <Link href={`/dashboard/assessments/${assessment.id}/take`}>
                        <div className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-green-600 text-white hover:bg-green-700 transition-colors cursor-pointer">
                          <ClipboardCheck size={14} />
                          <span className="text-xs font-semibold">
                            Take Assessment
                          </span>
                        </div>
                      </Link>
                    )}

                    {assessment.user_status === 'passed' && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-green-50 border border-green-100">
                          <div className="flex items-center gap-2">
                            <CheckCircle size={14} className="text-green-600" />
                            <span className="text-xs font-semibold text-green-700">
                              Passed
                            </span>
                          </div>
                          {assessment.best_score !== null && (
                            <span className="text-xs font-bold text-green-700">
                              {Math.round(assessment.best_score)}%
                            </span>
                          )}
                        </div>
                        <Link href={`/dashboard/assessments/${assessment.id}/take`}>
                          <div className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-emerald-200 text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer">
                            <Award size={14} />
                            <span className="text-xs font-semibold">
                              Retake Assessment
                            </span>
                          </div>
                        </Link>
                      </div>
                    )}

                    {assessment.user_status === 'failed' && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-orange-50 border border-orange-100">
                          <div className="flex items-center gap-2">
                            <XCircle size={14} className="text-orange-500" />
                            <span className="text-xs font-semibold text-orange-700">
                              Failed
                            </span>
                          </div>
                          {assessment.best_score !== null && (
                            <span className="text-xs font-bold text-orange-700">
                              {Math.round(assessment.best_score)}%
                            </span>
                          )}
                        </div>
                        {hoursLeft > 0 ? (
                          <div className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-gray-50 border border-gray-100">
                            <Timer size={14} className="text-gray-400" />
                            <span className="text-xs font-semibold text-gray-400">
                              Retry in {hoursLeft}h
                            </span>
                          </div>
                        ) : (
                          <Link href={`/dashboard/assessments/${assessment.id}/take`}>
                            <div className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-orange-500 text-white hover:bg-orange-600 transition-colors cursor-pointer">
                              <ClipboardCheck size={14} />
                              <span className="text-xs font-semibold">
                                Retry Assessment
                              </span>
                            </div>
                          </Link>
                        )}
                      </div>
                    )}

                    {assessment.user_status === 'cooldown' && (
                      <div className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-yellow-50 border border-yellow-100">
                        <div className="flex items-center gap-2">
                          <Timer size={14} className="text-yellow-600" />
                          <span className="text-xs font-semibold text-yellow-700">
                            Retry available in {hoursLeft}h
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      )}
    </div>
  )
}
