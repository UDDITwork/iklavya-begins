'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useCallback } from 'react'
import { Timer, Trophy, Flame, Users, Zap } from 'lucide-react'

interface QuizQuestion {
  question: string
  options: string[]
  correct: number
}

const sampleQuestions: QuizQuestion[] = [
  {
    question: 'Which body language signal conveys confidence during a presentation?',
    options: ['Crossed arms', 'Open palms', 'Looking down', 'Fidgeting'],
    correct: 1,
  },
  {
    question: 'What is the ideal pace for public speaking?',
    options: ['200+ wpm', '120-150 wpm', '80-100 wpm', '50-70 wpm'],
    correct: 1,
  },
  {
    question: 'Which active listening technique involves restating what someone said?',
    options: ['Paraphrasing', 'Summarizing', 'Empathizing', 'Clarifying'],
    correct: 0,
  },
]

const leaderboard = [
  { name: 'Priya S.', score: 2400, rank: 1 },
  { name: 'Rahul V.', score: 2350, rank: 2 },
  { name: 'You', score: 2300, rank: 3 },
  { name: 'Ananya D.', score: 2100, rank: 4 },
  { name: 'Vikram P.', score: 1900, rank: 5 },
]

export default function LiveQuizArena() {
  const [phase, setPhase] = useState<'countdown' | 'question' | 'result'>('countdown')
  const [countdown, setCountdown] = useState(3)
  const [currentQ, setCurrentQ] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [timeLeft, setTimeLeft] = useState(15)
  const [participants] = useState(12847)

  useEffect(() => {
    if (phase === 'countdown' && countdown > 0) {
      const t = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(t)
    }
    if (phase === 'countdown' && countdown === 0) {
      setPhase('question')
    }
  }, [countdown, phase])

  useEffect(() => {
    if (phase === 'question' && timeLeft > 0 && selected === null) {
      const t = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(t)
    }
  }, [timeLeft, phase, selected])

  const handleAnswer = useCallback((index: number) => {
    if (selected !== null) return
    setSelected(index)
    const correct = sampleQuestions[currentQ].correct
    if (index === correct) {
      setScore((s) => s + 100 * (streak + 1))
      setStreak((s) => s + 1)
    } else {
      setStreak(0)
    }
    setTimeout(() => {
      if (currentQ < sampleQuestions.length - 1) {
        setCurrentQ((c) => c + 1)
        setSelected(null)
        setTimeLeft(15)
      } else {
        setPhase('result')
      }
    }, 2000)
  }, [selected, currentQ, streak])

  const restart = () => {
    setPhase('countdown')
    setCountdown(3)
    setCurrentQ(0)
    setSelected(null)
    setScore(0)
    setStreak(0)
    setTimeLeft(15)
  }

  return (
    <div className="min-h-[600px] relative rounded-2xl overflow-hidden bg-white border border-gray-200 shadow-sm">
      {/* Top Bar */}
      <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-100">
        <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500">
          <Users size={14} />
          <span>{participants.toLocaleString()} solving now</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 text-amber-600">
            <Flame size={16} />
            <span className="font-bold">{streak}</span>
          </div>
          <div className="flex items-center gap-1 text-green-800">
            <Zap size={16} />
            <span className="font-bold">{score}</span>
          </div>
        </div>
      </div>

      <div className="p-6">
        <AnimatePresence mode="wait">
          {phase === 'countdown' && (
            <motion.div
              key="countdown"
              className="flex items-center justify-center min-h-[400px]"
              exit={{ opacity: 0, scale: 0.5 }}
            >
              <motion.div
                key={countdown}
                initial={{ scale: 2, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                className="text-8xl font-bold text-gray-900"
              >
                {countdown === 0 ? 'GO!' : countdown}
              </motion.div>
            </motion.div>
          )}

          {phase === 'question' && (
            <motion.div
              key={`q-${currentQ}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="w-full h-2 bg-gray-100 rounded-full mb-6 overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    background: timeLeft > 10 ? '#166534' : timeLeft > 5 ? '#92400E' : '#991B1B',
                  }}
                  initial={{ width: '100%' }}
                  animate={{ width: `${(timeLeft / 15) * 100}%` }}
                  transition={{ duration: 1, ease: 'linear' }}
                />
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                <Timer size={14} />
                <span>{timeLeft}s remaining</span>
                <span className="ml-auto">
                  Question {currentQ + 1}/{sampleQuestions.length}
                </span>
              </div>

              <h3 className="text-xl font-semibold text-gray-900 mb-6">
                {sampleQuestions[currentQ].question}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3">
                {sampleQuestions[currentQ].options.map((option, i) => {
                  const correct = sampleQuestions[currentQ].correct
                  const isSelected = selected === i
                  const isCorrect = i === correct
                  const showResult = selected !== null

                  return (
                    <motion.button
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      onClick={() => handleAnswer(i)}
                      className={`p-3 sm:p-4 min-h-[48px] rounded-xl text-left transition-all duration-200 border ${
                        showResult
                          ? isCorrect
                            ? 'border-green-500 bg-green-50 text-green-800'
                            : isSelected
                            ? 'border-red-500 bg-red-50 text-red-800'
                            : 'border-gray-200 bg-gray-50 text-gray-400'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-green-400 hover:bg-green-50'
                      }`}
                    >
                      <span className="text-sm font-medium">{String.fromCharCode(65 + i)}.</span>{' '}
                      {option}
                    </motion.button>
                  )
                })}
              </div>
            </motion.div>
          )}

          {phase === 'result' && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-8"
            >
              <Trophy size={48} className="mx-auto mb-4 text-amber-500" />
              <h3 className="text-3xl font-bold text-gray-900 mb-2">Quiz Complete!</h3>
              <p className="text-gray-500 mb-6">Your Score: {score} points</p>

              <div className="max-w-xs sm:max-w-sm mx-auto space-y-1.5 sm:space-y-2 mb-4 sm:mb-8">
                {leaderboard.map((entry, i) => (
                  <motion.div
                    key={entry.name}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className={`flex items-center justify-between p-3 rounded-xl ${
                      entry.name === 'You' ? 'bg-green-50/40 border border-green-200' : 'bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        i === 0 ? 'bg-amber-100 text-amber-700' :
                        i === 1 ? 'bg-gray-200 text-gray-600' :
                        i === 2 ? 'bg-orange-100 text-orange-700' :
                        'bg-gray-100 text-gray-400'
                      }`}>
                        {entry.rank}
                      </span>
                      <span className={entry.name === 'You' ? 'text-green-800 font-semibold' : 'text-gray-600'}>
                        {entry.name}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">{entry.score}</span>
                  </motion.div>
                ))}
              </div>

              <button
                onClick={restart}
                className="px-6 py-3 rounded-lg border-2 border-green-800 bg-white text-green-800 font-medium hover:bg-green-50 transition-colors duration-200 min-h-[44px] w-full sm:w-auto"
              >
                Play Again
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
