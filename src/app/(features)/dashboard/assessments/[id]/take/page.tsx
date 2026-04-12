'use client'

import { useEffect, useState, useCallback, useRef, use } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { useAssessmentStore } from '@/store/assessment-store'
import AssessmentHeader from '@/components/assessment/AssessmentHeader'
import QuestionCard from '@/components/assessment/QuestionCard'
import QuestionNav from '@/components/assessment/QuestionNav'

export default function AssessmentTakePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showSubmitDialog, setShowSubmitDialog] = useState(false)
  const [showMobileNav, setShowMobileNav] = useState(false)
  const hasSubmittedRef = useRef(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const {
    questions,
    currentIndex,
    answers,
    attemptId,
    timeRemaining,
    isSubmitting,
    setQuestions,
    restoreAnswers,
    selectAnswer,
    goToQuestion,
    nextQuestion,
    prevQuestion,
    tick,
    setSubmitting,
    reset,
    getAnswersArray,
  } = useAssessmentStore()

  const autoSaveRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const lastSavedRef = useRef<string>('') // track last saved JSON to avoid redundant saves

  // Start assessment on mount (also restores saved answers if resuming)
  useEffect(() => {
    let cancelled = false

    async function startAssessment() {
      try {
        const res = await fetch(`/api/assessments/${id}/start`, { method: 'POST' })
        const data = await res.json()

        if (!res.ok) {
          throw new Error(data.error || 'Failed to start assessment')
        }

        if (!cancelled) {
          setQuestions(
            data.questions,
            data.attempt_id,
            data.expires_at,
            data.assessment_id || id,
            data.time_limit_seconds
          )

          // Restore saved answers if resuming an in-progress attempt
          if (data.saved_answers && Array.isArray(data.saved_answers) && data.saved_answers.length > 0) {
            restoreAnswers(data.saved_answers)
            toast.success(`Resumed! ${data.saved_answers.length} saved answers restored.`)
          }

          setLoading(false)
        }
      } catch (err) {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : 'Failed to start assessment'
          setError(message)
          setLoading(false)
          toast.error(message)
        }
      }
    }

    startAssessment()

    return () => {
      cancelled = true
    }
  }, [id, setQuestions, restoreAnswers])

  // Timer interval
  useEffect(() => {
    if (loading || error) return

    timerRef.current = setInterval(() => {
      tick()
    }, 1000)

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [loading, error, tick])

  // Auto-save answers to DB every 60 seconds
  useEffect(() => {
    if (loading || error || !attemptId) return

    autoSaveRef.current = setInterval(() => {
      const answersArray = useAssessmentStore.getState().getAnswersArray()
      if (answersArray.length === 0) return

      const currentJson = JSON.stringify(answersArray)
      if (currentJson === lastSavedRef.current) return // skip if nothing changed

      fetch(`/api/assessments/${id}/autosave`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          attempt_id: attemptId,
          answers: answersArray,
        }),
      })
        .then((res) => {
          if (res.ok) {
            lastSavedRef.current = currentJson
          }
        })
        .catch(() => {
          // Silent fail — will retry next interval
        })
    }, 60_000)

    return () => {
      if (autoSaveRef.current) {
        clearInterval(autoSaveRef.current)
        autoSaveRef.current = null
      }
    }
  }, [loading, error, attemptId, id])

  // Submit handler
  const handleSubmit = useCallback(async () => {
    if (hasSubmittedRef.current || !attemptId) return
    hasSubmittedRef.current = true
    setSubmitting(true)

    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    if (autoSaveRef.current) {
      clearInterval(autoSaveRef.current)
      autoSaveRef.current = null
    }

    try {
      const answersArray = getAnswersArray()
      const res = await fetch(`/api/assessments/${id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          attempt_id: attemptId,
          answers: answersArray,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit assessment')
      }

      toast.success('Assessment submitted successfully!')
      reset()
      router.push(`/dashboard/assessments/${id}/result/${attemptId}`)
    } catch (err) {
      hasSubmittedRef.current = false
      setSubmitting(false)
      const message = err instanceof Error ? err.message : 'Submit failed'
      toast.error(message)
    }
  }, [attemptId, id, getAnswersArray, setSubmitting, reset, router])

  // Auto-submit on time up
  const handleTimeUp = useCallback(() => {
    if (!hasSubmittedRef.current) {
      toast('Time is up! Auto-submitting your assessment...', { icon: '⏰' })
      handleSubmit()
    }
  }, [handleSubmit])

  // Beforeunload warning
  useEffect(() => {
    if (loading || error) return

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!hasSubmittedRef.current) {
        e.preventDefault()
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [loading, error])

  // Keyboard shortcuts
  useEffect(() => {
    if (loading || error) return

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault()
          prevQuestion()
          break
        case 'ArrowRight':
          e.preventDefault()
          nextQuestion()
          break
        case '1':
        case '2':
        case '3':
        case '4': {
          e.preventDefault()
          const optIndex = parseInt(e.key) - 1
          const currentQ = questions[currentIndex]
          if (currentQ) {
            selectAnswer(currentQ.id, optIndex)
          }
          break
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [loading, error, questions, currentIndex, prevQuestion, nextQuestion, selectAnswer])

  // Exit handler
  const handleExit = useCallback(() => {
    reset()
    router.push('/dashboard/assessments')
  }, [reset, router])

  // Build answered set for QuestionNav (by question array index, not question ID)
  const answeredSet = new Set<number>()
  questions.forEach((q, idx) => {
    if (answers.has(q.id)) {
      answeredSet.add(idx)
    }
  })

  const currentQuestion = questions[currentIndex]
  const selectedIndex = currentQuestion ? answers.get(currentQuestion.id) : undefined

  // ---- RENDER ----

  // Loading state
  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-emerald-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Preparing your assessment...</p>
          <p className="text-gray-400 text-sm mt-1">Loading questions</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="fixed inset-0 z-50 bg-white flex items-center justify-center">
        <div className="text-center max-w-md mx-4">
 <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Unable to Start Assessment</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push('/dashboard/assessments')}
            className="px-6 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  if (!currentQuestion) {
    return (
      <div className="fixed inset-0 z-50 bg-white flex items-center justify-center">
        <p className="text-gray-500">No questions available.</p>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col overflow-hidden">
      {/* Header */}
      <AssessmentHeader
        moduleName="Assessment"
        currentQuestion={currentIndex}
        totalQuestions={questions.length}
        timeRemaining={timeRemaining}
        onTimeUp={handleTimeUp}
        onExit={handleExit}
      />

      {/* Main content area */}
      <div className="flex-1 flex overflow-hidden pt-[3.625rem]">
        {/* Question area */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <QuestionCard
              question={currentQuestion}
              selectedIndex={selectedIndex}
              onSelect={(index) => selectAnswer(currentQuestion.id, index)}
              onPrevious={prevQuestion}
              onNext={nextQuestion}
              hasPrevious={currentIndex > 0}
              hasNext={currentIndex < questions.length - 1}
            />
          </div>
        </div>

        {/* Desktop sidebar: Question nav + Submit */}
        <div className="hidden lg:flex flex-col w-72 border-l border-gray-200 bg-gray-50/50">
          <div className="flex-1 overflow-y-auto p-5">
            <QuestionNav
              total={questions.length}
              currentIndex={currentIndex}
              answeredSet={answeredSet}
              onNavigate={goToQuestion}
            />
          </div>

          {/* Submit button */}
          <div className="p-5 border-t border-gray-200">
            <button
              onClick={() => setShowSubmitDialog(true)}
              disabled={isSubmitting}
              className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-semibold rounded-xl transition-colors text-sm shadow-lg shadow-emerald-600/25"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Submitting...
                </span>
              ) : (
                <>
                  Submit Assessment
                  <span className="block text-xs font-normal text-emerald-100 mt-0.5">
                    {answeredSet.size} of {questions.length} answered
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile bottom bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-[55] bg-white border-t border-gray-200 px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => setShowMobileNav(true)}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          <span>{answeredSet.size}/{questions.length}</span>
        </button>

        <button
          onClick={() => setShowSubmitDialog(true)}
          disabled={isSubmitting}
          className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-semibold rounded-lg transition-colors text-sm"
        >
          {isSubmitting ? 'Submitting...' : 'Submit'}
        </button>
      </div>

      {/* Mobile question nav drawer */}
      {showMobileNav && (
        <div className="fixed inset-0 z-[65] lg:hidden">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowMobileNav(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl p-6 pb-8 max-h-[70vh] overflow-y-auto animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-gray-900">Question Navigator</h3>
              <button
                onClick={() => setShowMobileNav(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <QuestionNav
              total={questions.length}
              currentIndex={currentIndex}
              answeredSet={answeredSet}
              onNavigate={(index) => {
                goToQuestion(index)
                setShowMobileNav(false)
              }}
            />
          </div>
        </div>
      )}

      {/* Submit confirmation dialog */}
      {showSubmitDialog && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6">
            <div className="flex items-center gap-3 mb-4">
 <div className="flex items-center justify-center w-10 h-10 rounded-full ">
                <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Submit Assessment?</h2>
            </div>

            <p className="text-gray-600 text-sm mb-2">
              You have answered <span className="font-semibold text-gray-900">{answeredSet.size}</span> out
              of <span className="font-semibold text-gray-900">{questions.length}</span> questions.
            </p>

            {answeredSet.size < questions.length && (
              <p className="text-amber-600 text-sm mb-4 flex items-start gap-2">
                <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                You have {questions.length - answeredSet.size} unanswered question{questions.length - answeredSet.size !== 1 ? 's' : ''}.
                Unanswered questions will be marked as incorrect.
              </p>
            )}

            <div className="flex gap-3 justify-end mt-6">
              <button
                onClick={() => setShowSubmitDialog(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Review Answers
              </button>
              <button
                onClick={() => {
                  setShowSubmitDialog(false)
                  handleSubmit()
                }}
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:bg-emerald-400 transition-colors"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Now'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Slide-up animation for mobile drawer */}
      <style jsx>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}
