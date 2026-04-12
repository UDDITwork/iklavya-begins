'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  Loader2, BookOpen, Clock, CheckCircle, PlayCircle, Lock, GraduationCap, Database,
} from 'lucide-react'
import { useAuthStore } from '@/store/auth-store'
import { fadeInUp, fadeInUpTransition, staggerContainer, staggerItem } from '@/lib/animations'
import type { CourseModule, UserProgress } from '@/store/classroom-store'

interface ModuleWithProgress extends CourseModule {
  progress?: UserProgress
}

export default function ClassroomPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [modules, setModules] = useState<ModuleWithProgress[]>([])
  const [loading, setLoading] = useState(true)
  const [seeding, setSeeding] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      // Fetch modules and progress in parallel
      const [modulesRes, progressRes] = await Promise.all([
        fetch('/api/modules'),
        fetch('/api/modules/progress'),
      ])

      if (modulesRes.status === 401) {
        router.push('/login')
        return
      }

      const modulesData = modulesRes.ok ? await modulesRes.json() : { modules: [] }
      const progressData = progressRes.ok ? await progressRes.json() : []

      // Merge progress into modules
      const progressMap = new Map<string, UserProgress>()
      if (Array.isArray(progressData)) {
        progressData.forEach((p: UserProgress) => progressMap.set(p.module_id, p))
      }

      // Map slug to local SVG thumbnail
      const slugToSvg: Record<string, string> = {
        'time-management': '/classroom/time-management.svg',
        'workplace-etiquette': '/classroom/workplace-etiquette.svg',
        'social-communication': '/classroom/social-communication.svg',
        'resume-interview-mastery': '/classroom/resume-interview.svg',
        'financial-literacy-freshers': '/classroom/financial-literacy.svg',
        'leadership-teamwork': '/classroom/leadership-teamwork.svg',
        'digital-skills-personal-branding': '/classroom/digital-skills.svg',
      }

      const merged = (modulesData.modules || []).map((m: CourseModule) => ({
        ...m,
        thumbnail_url: slugToSvg[m.slug] || m.thumbnail_url,
        progress: progressMap.get(m.id),
      }))

      setModules(merged)
    } catch {
      // Silent fail
    } finally {
      setLoading(false)
    }
  }

  function formatDuration(secs: number) {
    const m = Math.floor(secs / 60)
    return `${m} min`
  }

  function getModuleStatus(mod: ModuleWithProgress, idx: number) {
    if (mod.progress?.is_completed === 1) return 'completed'
    if (mod.progress && mod.progress.last_position_seconds > 0) return 'in-progress'
    // First module is always unlocked; others require previous to be completed
    if (idx === 0) return 'available'
    const prev = modules[idx - 1]
    if (prev?.progress?.is_completed === 1) return 'available'
    return 'locked'
  }

  const completedCount = modules.filter((m) => m.progress?.is_completed === 1).length

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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
 <div className="w-12 h-12 rounded-xl flex items-center justify-center text-violet-800">
                <GraduationCap size={22} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Classroom</h1>
                <p className="text-sm text-gray-500">
                  Interactive video modules with stop-and-quiz checkpoints
                </p>
              </div>
            </div>

            {modules.length > 0 && (
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-xs text-gray-400">Progress</p>
                  <p className="text-sm font-bold text-gray-700">
                    {completedCount}/{modules.length} completed
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full border-3 border-green-200 flex items-center justify-center">
                  <span className="text-sm font-bold text-green-700">
                    {modules.length > 0
                      ? Math.round((completedCount / modules.length) * 100)
                      : 0}
                    %
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={24} className="animate-spin text-gray-400" />
        </div>
      ) : modules.length === 0 ? (
        <motion.div
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          transition={{ ...fadeInUpTransition, delay: 0.1 }}
        >
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-sm">
            <BookOpen size={48} className="mx-auto text-gray-300 mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              No Modules Available Yet
            </h2>
            <p className="text-sm text-gray-500 max-w-md mx-auto">
              Course modules are being prepared. Check back soon for interactive
              video lessons with quizzes.
            </p>
            {user?.role === 'admin' && (
              <button
                onClick={async () => {
                  setSeeding(true)
                  try {
                    const res = await fetch('/api/modules/seed')
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
                {seeding ? 'Seeding Modules...' : 'Seed Course Modules'}
              </button>
            )}
          </div>
        </motion.div>
      ) : (
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="space-y-4"
        >
          {modules.map((mod, idx) => {
            const status = getModuleStatus(mod, idx)
            const quizzesPassed = mod.progress?.quizzes_passed_json
              ? JSON.parse(mod.progress.quizzes_passed_json).length
              : 0
            const progressPct = mod.progress
              ? Math.round(
                  (mod.progress.last_position_seconds / mod.duration_seconds) * 100
                )
              : 0

            return (
              <motion.div key={mod.id} variants={staggerItem}>
                <Link
                  href={status === 'locked' ? '#' : `/dashboard/classroom/${mod.id}`}
                  onClick={(e) => {
                    if (status === 'locked') e.preventDefault()
                  }}
                >
                  <div
                    className={`bg-white rounded-2xl border shadow-sm transition-all duration-200 ${
                      status === 'locked'
                        ? 'border-gray-100 opacity-60 cursor-not-allowed'
                        : 'border-gray-200 hover:border-gray-300 hover:shadow-md cursor-pointer'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row">
                      {/* Thumbnail */}
                      <div className="relative w-full sm:w-56 h-36 sm:h-auto shrink-0 rounded-t-2xl sm:rounded-l-2xl sm:rounded-tr-none overflow-hidden" style={{ backgroundColor: '#FAFAFA' }}>
                        {mod.thumbnail_url ? (
                          <img
                            src={mod.thumbnail_url}
                            alt={mod.title}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-violet-100 to-green-100">
                            <BookOpen size={32} className="text-violet-300" />
                          </div>
                        )}
                        {/* Status badge */}
                        <div className="absolute top-3 left-3">
                          {status === 'completed' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-600 text-white text-[10px] font-bold">
                              <CheckCircle size={10} /> COMPLETED
                            </span>
                          ) : status === 'in-progress' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-600 text-white text-[10px] font-bold">
                              <PlayCircle size={10} /> IN PROGRESS
                            </span>
                          ) : status === 'locked' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-600 text-white text-[10px] font-bold">
                              <Lock size={10} /> LOCKED
                            </span>
                          ) : null}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 p-5">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <span className="text-[10px] font-bold text-violet-600 uppercase tracking-wider">
                              Module {idx + 1}
                            </span>
                            <h3 className="text-base font-bold text-gray-900 mt-0.5">
                              {mod.title}
                            </h3>
                            {mod.description && (
                              <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                                {mod.description}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Meta */}
                        <div className="flex items-center gap-4 mt-3">
                          <span className="flex items-center gap-1 text-xs text-gray-400">
                            <Clock size={12} />
                            {formatDuration(mod.duration_seconds)}
                          </span>
                          <span className="flex items-center gap-1 text-xs text-gray-400">
                            <BookOpen size={12} />3 quizzes
                          </span>
                          {mod.progress && status !== 'completed' && (
                            <span className="text-xs text-gray-400">
                              {quizzesPassed}/3 quizzes passed
                            </span>
                          )}
                        </div>

                        {/* Progress bar */}
                        {(status === 'in-progress' || status === 'completed') && (
                          <div className="mt-3">
                            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${
                                  status === 'completed' ? 'bg-green-500' : 'bg-blue-500'
                                }`}
                                style={{
                                  width: `${status === 'completed' ? 100 : progressPct}%`,
                                }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            )
          })}
        </motion.div>
      )}
    </div>
  )
}
