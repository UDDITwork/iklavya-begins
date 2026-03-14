'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { CheckCircle, Lock, PlayCircle, Clock, Award, PartyPopper } from 'lucide-react'
import { useClassroomStore } from '@/store/classroom-store'

interface Segment {
  title: string
  start_sec: number
  end_sec: number
}

export default function CurriculumSidebar() {
  const { currentModule, quizzesPassed, currentTime, isPlaying, setPlaying, setCurrentTime } =
    useClassroomStore()

  const [assessmentId, setAssessmentId] = useState<string | null>(null)
  const [assessmentLoading, setAssessmentLoading] = useState(false)

  const quizTimes = [150, 300, 450] // Standard quiz gates
  const allQuizzesPassed = quizzesPassed.length >= quizTimes.length
  const moduleId = currentModule?.id

  // Fetch assessment ID when all quizzes are passed
  useEffect(() => {
    if (!allQuizzesPassed || assessmentId || !moduleId) return
    setAssessmentLoading(true)
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
      .finally(() => setAssessmentLoading(false))
  }, [allQuizzesPassed, assessmentId, moduleId])

  if (!currentModule) return null

  const segments: Segment[] = currentModule.segments_json
    ? JSON.parse(currentModule.segments_json)
    : []

  function formatDuration(secs: number) {
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  function getSegmentStatus(segment: Segment) {
    if (currentTime >= segment.end_sec) return 'completed'
    if (currentTime >= segment.start_sec) return 'active'

    // Check if locked by an unpassed quiz
    const blockingQuiz = quizTimes.find(
      (qt) => qt <= segment.start_sec && !quizzesPassed.includes(qt)
    )
    if (blockingQuiz) return 'locked'

    return 'upcoming'
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100">
        <h2 className="text-sm font-bold text-gray-900">Module Curriculum</h2>
        <p className="text-xs text-gray-400 mt-0.5">
          {segments.length} segments &middot; {formatDuration(currentModule.duration_seconds)}
        </p>
      </div>

      {/* Segments */}
      <div className="divide-y divide-gray-50">
        {segments.map((segment, idx) => {
          const status = getSegmentStatus(segment)
          const isQuizGate = quizTimes.includes(segment.end_sec)
          const quizPassed = isQuizGate && quizzesPassed.includes(segment.end_sec)

          return (
            <div key={idx}>
              <button
                onClick={() => {
                  if (status !== 'locked') {
                    // Seek to segment start via the video ref
                    setCurrentTime(segment.start_sec)
                    // We need to update the actual video — dispatch via store isn't enough
                    // The VideoPlayer listens to currentTime changes in limited ways,
                    // so we use a custom event
                    window.dispatchEvent(
                      new CustomEvent('classroom:seek', { detail: segment.start_sec })
                    )
                    if (!isPlaying) setPlaying(true)
                  }
                }}
                disabled={status === 'locked'}
                className={`w-full flex items-start gap-3 px-5 py-3.5 text-left transition-colors ${
                  status === 'active'
                    ? 'bg-green-50/50'
                    : status === 'locked'
                      ? 'opacity-50 cursor-not-allowed'
                      : 'hover:bg-gray-50'
                }`}
              >
                {/* Status icon */}
                <div className="mt-0.5 shrink-0">
                  {status === 'completed' ? (
                    <CheckCircle size={16} className="text-green-600" />
                  ) : status === 'active' ? (
                    <PlayCircle size={16} className="text-green-700" />
                  ) : status === 'locked' ? (
                    <Lock size={14} className="text-gray-400" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-medium leading-tight ${
                      status === 'active'
                        ? 'text-green-800'
                        : status === 'locked'
                          ? 'text-gray-400'
                          : 'text-gray-700'
                    }`}
                  >
                    {segment.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[11px] text-gray-400 flex items-center gap-1">
                      <Clock size={10} />
                      {formatDuration(segment.start_sec)} &ndash;{' '}
                      {formatDuration(segment.end_sec)}
                    </span>
                  </div>
                </div>
              </button>

              {/* Quiz gate indicator */}
              {isQuizGate && (
                <div
                  className={`mx-5 mb-2 flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-medium ${
                    quizPassed
                      ? 'bg-green-50 text-green-700'
                      : 'bg-amber-50 text-amber-700'
                  }`}
                >
                  <div
                    className={`w-1.5 h-1.5 rounded-full ${
                      quizPassed ? 'bg-green-500' : 'bg-amber-500 animate-pulse'
                    }`}
                  />
                  {quizPassed ? 'Quiz passed' : 'Quiz gate — answer to continue'}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Progress summary */}
      <div className="px-5 py-4 border-t border-gray-100 bg-gray-50/50">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-500">Progress</span>
          <span className="font-bold text-gray-700">
            {quizzesPassed.length}/{quizTimes.length} quizzes
          </span>
        </div>
        <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-600 rounded-full transition-all duration-500"
            style={{
              width: `${(quizzesPassed.length / Math.max(quizTimes.length, 1)) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* Assessment CTA — shown when all quizzes passed */}
      {allQuizzesPassed && (
        <div className="px-5 py-4 border-t border-green-100 bg-gradient-to-b from-green-50 to-emerald-50">
          <div className="flex items-center gap-2 mb-2">
            <PartyPopper size={14} className="text-green-600" />
            <span className="text-xs font-bold text-green-800">Module Complete!</span>
          </div>
          {assessmentLoading ? (
            <div className="text-[11px] text-gray-400">Loading assessment...</div>
          ) : assessmentId ? (
            <Link
              href={`/dashboard/assessments/${assessmentId}/take`}
              className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg bg-green-700 text-white text-sm font-semibold hover:bg-green-800 transition-colors"
            >
              <Award size={15} />
              Take Assessment
            </Link>
          ) : (
            <p className="text-[11px] text-green-700">
              All quizzes passed! Assessment will be available soon.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
