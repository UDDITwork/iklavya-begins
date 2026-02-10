'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useCallback } from 'react'
import { Timer, Trophy, Flame, Users, Zap } from 'lucide-react'
import confetti from 'canvas-confetti'

interface QuizQuestion {
  question: string
  options: string[]
  correct: number
}

const sampleQuestions: QuizQuestion[] = [
  {
    question: 'What is the time complexity of binary search?',
    options: ['O(n)', 'O(log n)', 'O(n log n)', 'O(1)'],
    correct: 1,
  },
  {
    question: 'Which data structure uses FIFO principle?',
    options: ['Stack', 'Queue', 'Tree', 'Graph'],
    correct: 1,
  },
  {
    question: 'What does SQL stand for?',
    options: ['Structured Query Language', 'Simple Query Language', 'Standard Query Logic', 'System Query Language'],
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
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } })
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
        confetti({ particleCount: 200, spread: 120, origin: { y: 0.5 } })
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
    <div className="min-h-[600px] relative rounded-2xl overflow-hidden glass">
      {/* Top Bar */}
      <div className="flex items-center justify-between p-4 border-b border-white/5">
        <div className="flex items-center gap-2 text-sm text-white/50">
          <Users size={14} />
          <motion.span
            key={participants}
            initial={{ y: -5, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            {participants.toLocaleString()} solving now
          </motion.span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 text-yellow-400">
            <Flame size={16} />
            <span className="font-bold">{streak}</span>
          </div>
          <div className="flex items-center gap-1 text-purple-400">
            <Zap size={16} />
            <span className="font-bold">{score}</span>
          </div>
        </div>
      </div>

      <div className="p-6">
        <AnimatePresence mode="wait">
          {/* Countdown Phase */}
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
                className="text-8xl font-bold gradient-text"
              >
                {countdown === 0 ? 'GO!' : countdown}
              </motion.div>
            </motion.div>
          )}

          {/* Question Phase */}
          {phase === 'question' && (
            <motion.div
              key={`q-${currentQ}`}
              initial={{ rotateY: 90, opacity: 0 }}
              animate={{ rotateY: 0, opacity: 1 }}
              exit={{ rotateY: -90, opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              {/* Timer Bar */}
              <div className="w-full h-2 bg-white/5 rounded-full mb-6 overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    background: timeLeft > 10 ? '#10b981' : timeLeft > 5 ? '#f59e0b' : '#ef4444',
                  }}
                  initial={{ width: '100%' }}
                  animate={{ width: `${(timeLeft / 15) * 100}%` }}
                  transition={{ duration: 1, ease: 'linear' }}
                />
              </div>

              <div className="flex items-center gap-2 text-sm text-white/40 mb-3">
                <Timer size={14} />
                <span>{timeLeft}s remaining</span>
                <span className="ml-auto">
                  Question {currentQ + 1}/{sampleQuestions.length}
                </span>
              </div>

              <h3 className="text-xl font-semibold text-white mb-6">
                {sampleQuestions[currentQ].question}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {sampleQuestions[currentQ].options.map((option, i) => {
                  const correct = sampleQuestions[currentQ].correct
                  const isSelected = selected === i
                  const isCorrect = i === correct
                  const showResult = selected !== null

                  return (
                    <motion.button
                      key={i}
                      initial={{ x: i % 2 === 0 ? -30 : 30, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: i * 0.1 }}
                      onClick={() => handleAnswer(i)}
                      className={`p-4 rounded-xl text-left transition-all duration-300 border ${
                        showResult
                          ? isCorrect
                            ? 'border-green-500 bg-green-500/10 text-green-400'
                            : isSelected
                            ? 'border-red-500 bg-red-500/10 text-red-400'
                            : 'border-white/5 bg-white/[0.02] text-white/30'
                          : 'border-white/10 bg-white/[0.03] text-white hover:border-purple-500/50 hover:bg-purple-500/5'
                      }`}
                      whileHover={!showResult ? { scale: 1.02 } : undefined}
                      whileTap={!showResult ? { scale: 0.98 } : undefined}
                    >
                      <span className="text-sm font-medium">{String.fromCharCode(65 + i)}.</span>{' '}
                      {option}
                    </motion.button>
                  )
                })}
              </div>
            </motion.div>
          )}

          {/* Result Phase */}
          {phase === 'result' && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-8"
            >
              <Trophy size={48} className="mx-auto mb-4 text-yellow-400" />
              <h3 className="text-3xl font-bold gradient-text mb-2">Quiz Complete!</h3>
              <p className="text-white/40 mb-6">Your Score: {score} points</p>

              {/* Leaderboard */}
              <div className="max-w-sm mx-auto space-y-2 mb-8">
                {leaderboard.map((entry, i) => (
                  <motion.div
                    key={entry.name}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className={`flex items-center justify-between p-3 rounded-xl ${
                      entry.name === 'You' ? 'bg-purple-500/10 border border-purple-500/30' : 'bg-white/[0.02]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        i === 0 ? 'bg-yellow-500/20 text-yellow-400' :
                        i === 1 ? 'bg-gray-400/20 text-gray-300' :
                        i === 2 ? 'bg-orange-500/20 text-orange-400' :
                        'bg-white/5 text-white/30'
                      }`}>
                        {entry.rank}
                      </span>
                      <span className={entry.name === 'You' ? 'text-purple-400 font-semibold' : 'text-white/60'}>
                        {entry.name}
                      </span>
                    </div>
                    <span className="text-sm text-white/40">{entry.score}</span>
                  </motion.div>
                ))}
              </div>

              <button
                onClick={restart}
                className="px-6 py-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium
                  hover:shadow-[0_0_20px_rgba(139,92,246,0.4)] transition-shadow"
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
