'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import {
  Zap, Clock, Trophy, CheckCircle, XCircle, ArrowRight,
  Loader2, ChevronRight, RotateCcw, Home,
} from 'lucide-react'
import confetti from 'canvas-confetti'

interface QuizQuestion {
  id: string
  question: string
  options: { a: string; b: string; c: string; d: string }
  order: number
}

interface QuizData {
  id: string
  title: string
  description: string | null
  category: string
  time_per_question: number
  already_attempted: boolean
  my_score: number | null
  my_total: number | null
  questions: QuizQuestion[]
}

interface QuizListItem {
  id: string
  title: string
  description: string | null
  category: string
  question_count: number
  time_per_question: number
  total_attempts: number
  attempted: boolean
  my_score?: number
  my_total?: number
  created_at: string
}

interface SubmitResult {
  question_id: string
  question: string
  user_answer: string
  correct_answer: string
  is_correct: boolean
  explanation: string | null
  options: { a: string; b: string; c: string; d: string }
}

type Phase = 'list' | 'countdown' | 'playing' | 'submitting' | 'results'

export default function LiveQuizPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const quizId = searchParams.get('quiz')

  const [phase, setPhase] = useState<Phase>('list')
  const [quizList, setQuizList] = useState<QuizListItem[]>([])
  const [quizData, setQuizData] = useState<QuizData | null>(null)
  const [loading, setLoading] = useState(true)

  // Game state
  const [currentQ, setCurrentQ] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [selected, setSelected] = useState<string | null>(null)
  const [timeLeft, setTimeLeft] = useState(30)
  const [countdown, setCountdown] = useState(3)

  // Results
  const [score, setScore] = useState(0)
  const [total, setTotal] = useState(0)
  const [results, setResults] = useState<SubmitResult[]>([])

  // Load quiz list or specific quiz
  useEffect(() => {
    if (quizId) {
      loadQuiz(quizId)
    } else {
      loadQuizList()
    }
  }, [quizId])

  async function loadQuizList() {
    setLoading(true)
    try {
      const res = await fetch('/api/broadcast-quiz')
      if (res.ok) {
        const data = await res.json()
        setQuizList(data.quizzes || [])
      }
    } catch { /* silent */ }
    finally { setLoading(false) }
  }

  async function loadQuiz(id: string) {
    setLoading(true)
    try {
      const res = await fetch(`/api/broadcast-quiz/${id}`)
      if (res.ok) {
        const data = await res.json()
        setQuizData(data)
        if (data.already_attempted) {
          setPhase('list')
          loadQuizList()
        } else {
          setPhase('countdown')
          setCountdown(3)
          setTimeLeft(data.time_per_question)
        }
      } else {
        setPhase('list')
        loadQuizList()
      }
    } catch {
      setPhase('list')
      loadQuizList()
    } finally { setLoading(false) }
  }

  // Countdown timer
  useEffect(() => {
    if (phase === 'countdown' && countdown > 0) {
      const t = setTimeout(() => setCountdown(c => c - 1), 1000)
      return () => clearTimeout(t)
    }
    if (phase === 'countdown' && countdown === 0) {
      setPhase('playing')
    }
  }, [countdown, phase])

  // Question timer
  useEffect(() => {
    if (phase === 'playing' && timeLeft > 0 && selected === null) {
      const t = setTimeout(() => setTimeLeft(tl => tl - 1), 1000)
      return () => clearTimeout(t)
    }
    if (phase === 'playing' && timeLeft === 0 && selected === null) {
      handleNext()
    }
  }, [timeLeft, phase, selected])

  const handleSelect = useCallback((option: string) => {
    if (selected !== null || !quizData) return
    setSelected(option)
    const qId = quizData.questions[currentQ].id
    setAnswers(prev => ({ ...prev, [qId]: option }))

    // Auto-advance after short delay
    setTimeout(() => handleNext(option), 800)
  }, [selected, currentQ, quizData])

  function handleNext(justSelected?: string) {
    if (!quizData) return
    const nextQ = currentQ + 1

    if (nextQ >= quizData.questions.length) {
      // Submit
      const finalAnswers = justSelected
        ? { ...answers, [quizData.questions[currentQ].id]: justSelected }
        : answers
      submitQuiz(finalAnswers)
    } else {
      setCurrentQ(nextQ)
      setSelected(null)
      setTimeLeft(quizData.time_per_question)
    }
  }

  async function submitQuiz(finalAnswers: Record<string, string>) {
    if (!quizData) return
    setPhase('submitting')
    try {
      const res = await fetch(`/api/broadcast-quiz/${quizData.id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: finalAnswers }),
      })
      if (res.ok) {
        const data = await res.json()
        setScore(data.score)
        setTotal(data.total)
        setResults(data.results || [])
        setPhase('results')

        // Confetti for good scores
        if (data.percentage >= 60) {
          confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } })
        }
      }
    } catch { /* silent */ }
  }

  function startQuiz(id: string) {
    router.push(`/live-quiz?quiz=${id}`)
  }

  function backToList() {
    setPhase('list')
    setQuizData(null)
    setCurrentQ(0)
    setAnswers({})
    setSelected(null)
    setResults([])
    router.push('/live-quiz')
    loadQuizList()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-gray-300" />
      </div>
    )
  }

  // ─── Quiz List ──────────────────────────
  if (phase === 'list') {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
          <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-[28px] font-bold text-gray-900 tracking-tight">Live Quiz Arena</h1>
            <p className="mt-1 text-[15px] text-gray-500">Take quizzes broadcast by your institution. Test your knowledge.</p>
          </motion.div>

          {quizList.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-12 text-center py-16"
            >
              <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <Zap size={24} className="text-gray-400" />
              </div>
              <h2 className="text-lg font-bold text-gray-900 mb-1">No quizzes available</h2>
              <p className="text-[14px] text-gray-500">Check back later — new quizzes are broadcast regularly.</p>
            </motion.div>
          ) : (
            <div className="mt-8 space-y-3">
              {quizList.map((quiz, i) => (
                <motion.div
                  key={quiz.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <button
                    onClick={() => !quiz.attempted && startQuiz(quiz.id)}
                    disabled={quiz.attempted}
                    className={`w-full text-left p-5 rounded-xl border transition-all group ${
                      quiz.attempted
                        ? 'border-gray-100 bg-gray-50/50'
                        : 'border-gray-200 hover:border-violet-300 hover:shadow-md bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                        quiz.attempted ? 'bg-green-100' : 'bg-violet-100'
                      }`}>
                        {quiz.attempted ? (
                          <CheckCircle size={20} className="text-green-600" />
                        ) : (
                          <Zap size={20} className="text-violet-600" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[15px] font-semibold text-gray-900">{quiz.title}</span>
                          <span className="text-[11px] font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded capitalize">{quiz.category}</span>
                        </div>
                        {quiz.description && (
                          <p className="text-[13px] text-gray-500 mt-0.5 truncate">{quiz.description}</p>
                        )}
                        <div className="flex items-center gap-3 mt-1.5 text-[12px] text-gray-400">
                          <span>{quiz.question_count} questions</span>
                          <span>·</span>
                          <span className="flex items-center gap-0.5"><Clock size={10} /> {quiz.question_count * quiz.time_per_question}s</span>
                          <span>·</span>
                          <span className="flex items-center gap-0.5"><Trophy size={10} /> {quiz.total_attempts} played</span>
                        </div>
                      </div>

                      {quiz.attempted ? (
                        <div className="shrink-0 text-right">
                          <span className="text-[20px] font-bold text-green-700">{quiz.my_score}/{quiz.my_total}</span>
                          <p className="text-[11px] text-gray-400">Completed</p>
                        </div>
                      ) : (
                        <ChevronRight size={18} className="shrink-0 text-gray-300 group-hover:text-violet-500 transition-colors" />
                      )}
                    </div>
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  // ─── Countdown ──────────────────────────
  if (phase === 'countdown') {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <motion.div className="text-center">
          <p className="text-gray-400 text-[15px] font-medium mb-4">{quizData?.title}</p>
          <motion.span
            key={countdown}
            initial={{ scale: 0.3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 2, opacity: 0 }}
            className="text-[120px] font-black text-white block leading-none"
          >
            {countdown}
          </motion.span>
          <p className="text-gray-500 mt-4 text-[14px]">Get ready...</p>
        </motion.div>
      </div>
    )
  }

  // ─── Playing ──────────────────────────
  if (phase === 'playing' && quizData) {
    const question = quizData.questions[currentQ]
    const progress = ((currentQ) / quizData.questions.length) * 100
    const optionKeys = ['a', 'b', 'c', 'd'] as const

    return (
      <div className="min-h-screen bg-gray-950 flex flex-col">
        {/* Top bar */}
        <div className="px-6 py-4 flex items-center justify-between">
          <span className="text-[13px] text-gray-500 font-medium">
            {currentQ + 1} / {quizData.questions.length}
          </span>
          <span className="text-[13px] text-gray-400 font-medium">{quizData.title}</span>
          <div className={`flex items-center gap-1.5 text-[14px] font-bold ${
            timeLeft <= 5 ? 'text-red-400 animate-pulse' : 'text-gray-300'
          }`}>
            <Clock size={14} />
            {timeLeft}s
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-gray-800 mx-6 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-violet-500 rounded-full"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Question */}
        <div className="flex-1 flex items-center justify-center px-6 py-8">
          <div className="w-full max-w-2xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentQ}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.25 }}
              >
                <h2 className="text-[22px] font-bold text-white text-center leading-relaxed mb-10">
                  {question.question}
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {optionKeys.map((key) => {
                    const isSelected = selected === key
                    return (
                      <button
                        key={key}
                        onClick={() => handleSelect(key)}
                        disabled={selected !== null}
                        className={`relative text-left px-5 py-4 rounded-xl border-2 transition-all text-[14px] font-medium ${
                          isSelected
                            ? 'border-violet-500 bg-violet-500/20 text-white'
                            : 'border-gray-700 bg-gray-800/50 text-gray-300 hover:border-gray-500 hover:bg-gray-800'
                        } ${selected !== null && !isSelected ? 'opacity-50' : ''}`}
                      >
                        <span className="text-[12px] font-bold text-gray-500 uppercase mr-2">{key}.</span>
                        {question.options[key]}
                      </button>
                    )
                  })}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Timer bar at bottom */}
        <div className="h-1.5 bg-gray-800">
          <motion.div
            className={`h-full ${timeLeft <= 5 ? 'bg-red-500' : 'bg-violet-500'}`}
            animate={{ width: `${(timeLeft / quizData.time_per_question) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>
    )
  }

  // ─── Submitting ──────────────────────────
  if (phase === 'submitting') {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={32} className="animate-spin text-violet-400 mx-auto mb-4" />
          <p className="text-gray-400 text-[15px]">Grading your answers...</p>
        </div>
      </div>
    )
  }

  // ─── Results ──────────────────────────
  if (phase === 'results') {
    const percentage = total > 0 ? Math.round((score / total) * 100) : 0
    const isPassing = percentage >= 60

    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
          {/* Score header */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center mb-10"
          >
            <div className={`w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center ${
              isPassing ? 'bg-green-100' : 'bg-amber-100'
            }`}>
              {isPassing ? (
                <Trophy size={36} className="text-green-600" />
              ) : (
                <RotateCcw size={36} className="text-amber-600" />
              )}
            </div>
            <h1 className="text-[36px] font-black text-gray-900">{score}/{total}</h1>
            <p className="text-[18px] font-semibold text-gray-500 mt-1">{percentage}% correct</p>
            <p className={`text-[14px] font-medium mt-2 ${isPassing ? 'text-green-600' : 'text-amber-600'}`}>
              {isPassing ? 'Great job!' : 'Keep practicing!'}
            </p>
          </motion.div>

          {/* Results breakdown */}
          <div className="space-y-4">
            <h2 className="text-[13px] font-semibold text-gray-500 uppercase tracking-wider">Answer Review</h2>
            {results.map((r, i) => (
              <motion.div
                key={r.question_id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`p-4 rounded-xl border ${
                  r.is_correct ? 'border-green-200 bg-green-50/30' : 'border-red-200 bg-red-50/30'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                    r.is_correct ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    {r.is_correct ? (
                      <CheckCircle size={14} className="text-green-600" />
                    ) : (
                      <XCircle size={14} className="text-red-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-semibold text-gray-900">{r.question}</p>

                    {!r.is_correct && (
                      <div className="mt-2 text-[13px]">
                        <p className="text-red-600">Your answer: <span className="font-medium">{r.options[r.user_answer as keyof typeof r.options] || 'No answer'}</span></p>
                        <p className="text-green-700">Correct: <span className="font-medium">{r.options[r.correct_answer as keyof typeof r.options]}</span></p>
                      </div>
                    )}

                    {r.explanation && (
                      <p className="mt-2 text-[12px] text-gray-500 leading-relaxed">{r.explanation}</p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-center gap-3 mt-8">
            <button
              onClick={backToList}
              className="flex items-center gap-2 h-10 px-5 rounded-lg bg-gray-900 text-white text-[13px] font-semibold hover:bg-gray-800 transition-colors"
            >
              <Home size={14} /> Back to Quizzes
            </button>
          </div>
        </div>
      </div>
    )
  }

  return null
}
