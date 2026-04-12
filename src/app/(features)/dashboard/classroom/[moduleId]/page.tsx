'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Loader2, BookOpen, Award, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { useClassroomStore } from '@/store/classroom-store'
import VideoPlayer from '@/components/classroom/VideoPlayer'
import CurriculumSidebar from '@/components/classroom/CurriculumSidebar'
import { fadeInUp, fadeInUpTransition } from '@/lib/animations'

export default function ClassroomModulePage() {
  const params = useParams()
  const router = useRouter()
  const moduleId = params.moduleId as string

  const { currentModule, setModule, setProgress, reset, quizzesPassed, currentTime, duration } = useClassroomStore()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [assessmentId, setAssessmentId] = useState<string | null>(null)
  const [showCompletionBanner, setShowCompletionBanner] = useState(false)

  const allQuizzesPassed = quizzesPassed.length >= 3
  const videoFinished = duration > 0 && currentTime >= duration - 5
  const isModuleComplete = allQuizzesPassed && videoFinished

  // Show completion banner when module is complete
  useEffect(() => {
    if (isModuleComplete && !showCompletionBanner) {
      setShowCompletionBanner(true)
    }
  }, [isModuleComplete, showCompletionBanner])

  // Fetch assessment for this module when complete
  useEffect(() => {
    if (!allQuizzesPassed || assessmentId) return
    fetch('/api/assessments')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.assessments) {
          const match = data.assessments.find(
            (a: { module_id: string }) => a.module_id === moduleId
          )
          if (match) setAssessmentId(match.id)
        }
      })
      .catch(() => {})
  }, [allQuizzesPassed, assessmentId, moduleId])

  // Listen for seek events from curriculum sidebar
  useEffect(() => {
    function handleSeek(e: Event) {
      const customEvent = e as CustomEvent<number>
      const video = document.querySelector('video')
      if (video) {
        video.currentTime = customEvent.detail
      }
    }
    window.addEventListener('classroom:seek', handleSeek)
    return () => window.removeEventListener('classroom:seek', handleSeek)
  }, [])

  const loadModuleData = useCallback(async () => {
    try {
      // Fetch module detail + quizzes
      const moduleRes = await fetch(`/api/modules/${moduleId}`)
      if (!moduleRes.ok) {
        if (moduleRes.status === 401) {
          router.push('/login')
          return
        }
        setError('Module not found')
        return
      }
      const moduleData = await moduleRes.json()
      setModule(moduleData.module, moduleData.quizzes)

      // Fetch progress (may 404 if new)
      try {
        const progressRes = await fetch(`/api/modules/${moduleId}/progress`)
        if (progressRes.ok) {
          const progressData = await progressRes.json()
          setProgress(progressData)
        }
      } catch {
        // No progress yet — that's fine
      }
    } catch {
      toast.error('Failed to load module')
      setError('Failed to load module')
    } finally {
      setLoading(false)
    }
  }, [moduleId, router, setModule, setProgress])

  useEffect(() => {
    reset()
    loadModuleData()
    return () => reset()
  }, [loadModuleData, reset])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={28} className="animate-spin text-gray-400" />
      </div>
    )
  }

  if (error || !currentModule) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <BookOpen size={48} className="text-gray-300" />
        <p className="text-gray-500">{error || 'Module not found'}</p>
        <Link
          href="/dashboard/classroom"
          className="text-sm text-green-700 hover:text-green-800 font-medium"
        >
          Back to Classroom
        </Link>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Back link */}
      <motion.div
        variants={fadeInUp}
        initial="initial"
        animate="animate"
        transition={fadeInUpTransition}
      >
        <Link
          href="/dashboard/classroom"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors mb-4"
        >
          <ArrowLeft size={14} />
          Back to Modules
        </Link>
      </motion.div>

      {/* Module title */}
      <motion.div
        variants={fadeInUp}
        initial="initial"
        animate="animate"
        transition={{ ...fadeInUpTransition, delay: 0.05 }}
        className="mb-5"
      >
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
          {currentModule.title}
        </h1>
        {currentModule.description && (
          <p className="text-sm text-gray-500 mt-1 max-w-2xl">
            {currentModule.description}
          </p>
        )}
      </motion.div>

      {/* Completion Banner */}
      <AnimatePresence>
        {showCompletionBanner && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-5 rounded-xl bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 border border-green-200 p-5"
          >
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
 <div className="w-10 h-10 rounded-full flex items-center justify-center">
                  <Award size={20} className="text-green-700" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-green-900">Module Complete!</h3>
                  <p className="text-xs text-green-700 mt-0.5">
                    You&apos;ve passed all quizzes and finished the video. Ready for the assessment?
                  </p>
                </div>
              </div>
              {assessmentId ? (
                <Link
                  href={`/dashboard/assessments/${assessmentId}/take`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-green-700 text-white text-sm font-semibold hover:bg-green-800 transition-colors shadow-sm"
                >
                  Proceed to Assessment
                  <ChevronRight size={15} />
                </Link>
              ) : (
                <Link
                  href="/dashboard/assessments"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-green-700 text-white text-sm font-semibold hover:bg-green-800 transition-colors shadow-sm"
                >
                  View Assessments
                  <ChevronRight size={15} />
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Two-pane layout */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left: Video Player */}
        <motion.div
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          transition={{ ...fadeInUpTransition, delay: 0.1 }}
          className="flex-1 min-w-0"
        >
          <VideoPlayer />
        </motion.div>

        {/* Right: Curriculum */}
        <motion.div
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          transition={{ ...fadeInUpTransition, delay: 0.15 }}
          className="w-full lg:w-80 shrink-0"
        >
          <CurriculumSidebar />
        </motion.div>
      </div>
    </div>
  )
}
