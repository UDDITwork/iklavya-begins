'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Zap, X, Clock, ChevronRight, Trophy } from 'lucide-react'

interface BroadcastQuiz {
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

export default function QuizBroadcastPopup() {
  const router = useRouter()
  const [quizzes, setQuizzes] = useState<BroadcastQuiz[]>([])
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())
  const [minimized, setMinimized] = useState(false)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    fetchQuizzes()
    // Re-check every 4 hours for new broadcasts
    const interval = setInterval(fetchQuizzes, 4 * 60 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  async function fetchQuizzes() {
    try {
      const res = await fetch('/api/broadcast-quiz')
      if (!res.ok) return
      const data = await res.json()
      setQuizzes(data.quizzes || [])
      setLoaded(true)
    } catch {
      // silent
    }
  }

  // Only show quizzes user hasn't attempted and hasn't dismissed this session
  const activeQuizzes = quizzes.filter(q => !q.attempted && !dismissed.has(q.id))

  if (!loaded || activeQuizzes.length === 0) return null

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3">
      <AnimatePresence>
        {!minimized && activeQuizzes.slice(0, 2).map((quiz, i) => (
          <motion.div
            key={quiz.id}
            initial={{ opacity: 0, x: 80, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 80, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25, delay: i * 0.1 }}
            className="w-[320px] bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden"
          >
            {/* Purple accent top bar */}
            <div className="h-1 bg-gradient-to-r from-violet-500 to-purple-600" />

            <div className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-violet-100 flex items-center justify-center shrink-0">
                    <Zap size={16} className="text-violet-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] font-bold text-gray-900 leading-tight">{quiz.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[11px] text-gray-400 capitalize">{quiz.category}</span>
                      <span className="text-[11px] text-gray-300">·</span>
                      <span className="text-[11px] text-gray-400 flex items-center gap-0.5">
                        <Clock size={9} /> {quiz.question_count * quiz.time_per_question}s
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setDismissed(prev => new Set(prev).add(quiz.id))}
                  className="shrink-0 w-6 h-6 rounded-md flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                >
                  <X size={13} />
                </button>
              </div>

              {quiz.description && (
                <p className="text-[12px] text-gray-500 mt-2 leading-relaxed line-clamp-2">{quiz.description}</p>
              )}

              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-3 text-[11px] text-gray-400">
                  <span className="flex items-center gap-1">
                    <Trophy size={10} /> {quiz.total_attempts} played
                  </span>
                  <span>{quiz.question_count} questions</span>
                </div>
                <button
                  onClick={() => router.push(`/live-quiz?quiz=${quiz.id}`)}
                  className="flex items-center gap-1 h-8 px-3.5 rounded-lg bg-violet-600 text-white text-[12px] font-semibold hover:bg-violet-700 active:scale-[0.97] transition-all"
                >
                  Play Now <ChevronRight size={12} />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Minimized badge / toggle */}
      {activeQuizzes.length > 0 && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          onClick={() => setMinimized(!minimized)}
          className={`w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all ${
            minimized
              ? 'bg-violet-600 text-white hover:bg-violet-700 animate-pulse'
              : 'bg-white text-violet-600 border border-violet-200 hover:bg-violet-50'
          }`}
        >
          <Zap size={20} />
          {minimized && activeQuizzes.length > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
              {activeQuizzes.length}
            </span>
          )}
        </motion.button>
      )}
    </div>
  )
}
