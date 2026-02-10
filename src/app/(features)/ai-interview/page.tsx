'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useRef, useEffect, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import {
  Mic, MicOff, Video, VideoOff, Phone, BarChart3,
  AlertTriangle, Clock, MessageSquare, TrendingUp
} from 'lucide-react'
import ParticleField from '@/components/animations/ParticleField'
import GlowingOrb from '@/components/animations/GlowingOrb'

const AIAvatarScene = dynamic(() => import('@/components/features/AIAvatarScene'), { ssr: false })

const interviewQuestions = [
  'Tell me about yourself and your background.',
  'Why are you interested in this role?',
  'Describe a challenging project you worked on.',
  'How do you handle tight deadlines?',
  'Where do you see yourself in 5 years?',
]

const sampleScores = {
  confidence: 72,
  clarity: 85,
  relevance: 78,
  grammar: 90,
  fillerWords: 15,
  pace: 68,
}

export default function AIInterviewPage() {
  const [phase, setPhase] = useState<'setup' | 'interview' | 'results'>('setup')
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOn, setIsVideoOn] = useState(true)
  const [speaking, setSpeaking] = useState(false)
  const [fillerCount, setFillerCount] = useState(0)
  const [transcript, setTranscript] = useState<string[]>([])
  const [waveformData, setWaveformData] = useState<number[]>(new Array(40).fill(4))
  const animRef = useRef<number>(0)

  // Simulate waveform animation
  useEffect(() => {
    if (phase !== 'interview') return
    const animate = () => {
      setWaveformData(
        Array.from({ length: 40 }, () =>
          speaking ? Math.random() * 30 + 4 : 4
        )
      )
      animRef.current = requestAnimationFrame(animate)
    }
    animRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animRef.current)
  }, [phase, speaking])

  // Simulate speech activity
  useEffect(() => {
    if (phase !== 'interview') return
    const interval = setInterval(() => {
      setSpeaking((s) => !s)
      if (Math.random() > 0.7) {
        setFillerCount((c) => c + 1)
      }
    }, 3000)
    return () => clearInterval(interval)
  }, [phase])

  const startInterview = () => setPhase('interview')
  const endInterview = () => setPhase('results')

  const nextQuestion = useCallback(() => {
    if (currentQuestion < interviewQuestions.length - 1) {
      setCurrentQuestion((c) => c + 1)
      setTranscript((t) => [...t, `Q${currentQuestion + 1}: Answered`])
    } else {
      endInterview()
    }
  }, [currentQuestion])

  return (
    <div className="min-h-screen bg-[#030014] relative overflow-hidden">
      <ParticleField particleCount={60} className="opacity-30" />
      <GlowingOrb size={300} color="rgba(59,130,246,0.08)" x="10%" y="30%" />
      <GlowingOrb size={250} color="rgba(139,92,246,0.08)" x="90%" y="70%" delay={2} />

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-2xl font-bold gradient-text">AI Interview Simulation</h1>
            <p className="text-sm text-white/40">Practice with our AI interviewer</p>
          </div>
          {phase === 'interview' && (
            <div className="flex items-center gap-2 text-sm text-white/40">
              <Clock size={14} />
              <span>Question {currentQuestion + 1}/{interviewQuestions.length}</span>
            </div>
          )}
        </motion.div>

        <AnimatePresence mode="wait">
          {/* Setup Phase */}
          {phase === 'setup' && (
            <motion.div
              key="setup"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-2xl mx-auto text-center py-20"
            >
              <div className="w-40 h-40 mx-auto mb-8 rounded-full overflow-hidden glass">
                <Suspense fallback={<div className="w-full h-full bg-purple-500/10" />}>
                  <AIAvatarScene />
                </Suspense>
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">Ready for Your Interview?</h2>
              <p className="text-white/40 mb-8 max-w-md mx-auto">
                Our AI interviewer will ask you {interviewQuestions.length} questions.
                Speak naturally — we&apos;ll analyze your confidence, clarity, and filler words in real-time.
              </p>
              <div className="flex gap-4 justify-center">
                <motion.button
                  onClick={startInterview}
                  className="px-8 py-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500
                    text-white font-semibold hover:shadow-[0_0_30px_rgba(139,92,246,0.4)] transition-shadow"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Start Interview
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Interview Phase */}
          {phase === 'interview' && (
            <motion.div
              key="interview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 lg:grid-cols-4 gap-6"
            >
              {/* Main Video Area */}
              <div className="lg:col-span-3 space-y-4">
                <div className="grid grid-cols-2 gap-4 h-[400px]">
                  {/* AI Avatar */}
                  <div className="rounded-2xl overflow-hidden glass relative">
                    <Suspense fallback={<div className="w-full h-full bg-blue-500/5" />}>
                      <AIAvatarScene speaking={!speaking} />
                    </Suspense>
                    <div className="absolute bottom-3 left-3 px-3 py-1 rounded-full bg-black/50 text-xs text-white/60">
                      AI Interviewer
                    </div>
                  </div>

                  {/* User Video Placeholder */}
                  <div className="rounded-2xl glass flex items-center justify-center relative">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20
                      flex items-center justify-center text-3xl font-bold text-white/30">
                      You
                    </div>
                    <div className="absolute bottom-3 left-3 px-3 py-1 rounded-full bg-black/50 text-xs text-white/60">
                      You {speaking ? '(speaking)' : ''}
                    </div>
                    {/* Voice Waveform */}
                    <div className="absolute bottom-3 right-3 flex items-end gap-[1.5px] h-6">
                      {waveformData.map((h, i) => (
                        <div
                          key={i}
                          className="w-[2px] rounded-full transition-all duration-100"
                          style={{
                            height: h,
                            background: speaking
                              ? h > 20 ? '#ef4444' : h > 12 ? '#f59e0b' : '#10b981'
                              : 'rgba(255,255,255,0.1)',
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Question Display */}
                <motion.div
                  key={currentQuestion}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-5 rounded-xl glass"
                >
                  <div className="flex items-start gap-3">
                    <MessageSquare size={18} className="text-blue-400 mt-0.5 shrink-0" />
                    <div>
                      <div className="text-xs text-white/30 mb-1">Current Question</div>
                      <p className="text-white/80 font-medium">
                        {interviewQuestions[currentQuestion]}
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* Controls */}
                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                      isMuted ? 'bg-red-500/20 text-red-400' : 'glass text-white/60'
                    }`}
                  >
                    {isMuted ? <MicOff size={18} /> : <Mic size={18} />}
                  </button>
                  <button
                    onClick={() => setIsVideoOn(!isVideoOn)}
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                      !isVideoOn ? 'bg-red-500/20 text-red-400' : 'glass text-white/60'
                    }`}
                  >
                    {isVideoOn ? <Video size={18} /> : <VideoOff size={18} />}
                  </button>
                  <button
                    onClick={nextQuestion}
                    className="px-6 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500
                      text-white font-medium text-sm hover:shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-shadow"
                  >
                    {currentQuestion < interviewQuestions.length - 1 ? 'Next Question' : 'End Interview'}
                  </button>
                  <button
                    onClick={endInterview}
                    className="w-12 h-12 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center"
                  >
                    <Phone size={18} />
                  </button>
                </div>
              </div>

              {/* Right Sidebar */}
              <div className="space-y-4">
                {/* Confidence Meter */}
                <div className="rounded-xl glass p-4">
                  <h4 className="text-xs text-white/40 uppercase tracking-wider mb-3">Confidence</h4>
                  <div className="h-40 w-full relative rounded-lg overflow-hidden bg-white/[0.02]">
                    <motion.div
                      className="absolute bottom-0 left-0 right-0 rounded-lg"
                      style={{
                        background: 'linear-gradient(to top, #10b981, #f59e0b, #ef4444)',
                      }}
                      animate={{ height: `${speaking ? 65 : 40}%` }}
                      transition={{ duration: 0.5 }}
                    />
                    <div className="absolute inset-0 flex flex-col justify-between py-2 px-2">
                      {['Assertive', 'Confident', 'Calm', 'Nervous'].map((label) => (
                        <span key={label} className="text-[9px] text-white/30">{label}</span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Filler Word Counter */}
                <div className="rounded-xl glass p-4">
                  <h4 className="text-xs text-white/40 uppercase tracking-wider mb-2">Filler Words</h4>
                  <motion.div
                    key={fillerCount}
                    className="text-3xl font-bold text-center"
                    style={{ color: fillerCount > 10 ? '#ef4444' : fillerCount > 5 ? '#f59e0b' : '#10b981' }}
                    animate={{ scale: [1.2, 1] }}
                  >
                    {fillerCount}
                  </motion.div>
                  <p className="text-[10px] text-white/30 text-center mt-1">um, uh, like detected</p>
                </div>

                {/* Live Transcript */}
                <div className="rounded-xl glass p-4 max-h-[200px] overflow-y-auto">
                  <h4 className="text-xs text-white/40 uppercase tracking-wider mb-2">Transcript</h4>
                  <div className="space-y-1">
                    {transcript.map((t, i) => (
                      <p key={i} className="text-xs text-white/40">{t}</p>
                    ))}
                    {speaking && (
                      <span className="text-xs text-purple-400">
                        Speaking
                        <motion.span
                          animate={{ opacity: [1, 0, 1] }}
                          transition={{ duration: 1, repeat: Infinity }}
                        >...</motion.span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Results Phase */}
          {phase === 'results' && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl mx-auto"
            >
              <div className="text-center mb-10">
                <h2 className="text-3xl font-bold gradient-text mb-2">Interview Analysis</h2>
                <p className="text-white/40">Here&apos;s how you performed</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                {Object.entries(sampleScores).map(([key, value], i) => (
                  <motion.div
                    key={key}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="rounded-xl glass p-5 text-center"
                  >
                    <div className="text-xs text-white/40 uppercase tracking-wider mb-2">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </div>
                    <div className="text-3xl font-bold mb-2" style={{
                      color: key === 'fillerWords'
                        ? (value > 10 ? '#ef4444' : '#10b981')
                        : (value >= 80 ? '#10b981' : value >= 60 ? '#f59e0b' : '#ef4444')
                    }}>
                      {value}{key === 'fillerWords' ? '' : '%'}
                    </div>
                    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{
                          background: key === 'fillerWords'
                            ? (value > 10 ? '#ef4444' : '#10b981')
                            : (value >= 80 ? '#10b981' : value >= 60 ? '#f59e0b' : '#ef4444'),
                        }}
                        initial={{ width: 0 }}
                        animate={{ width: `${key === 'fillerWords' ? Math.min(value * 5, 100) : value}%` }}
                        transition={{ duration: 1, delay: i * 0.1 }}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="flex justify-center gap-4">
                <motion.button
                  onClick={() => {
                    setPhase('setup')
                    setCurrentQuestion(0)
                    setFillerCount(0)
                    setTranscript([])
                  }}
                  className="px-6 py-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500
                    text-white font-medium hover:shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-shadow"
                  whileHover={{ scale: 1.05 }}
                >
                  Practice Again
                </motion.button>
                <motion.button
                  className="px-6 py-3 rounded-full glass text-white/60 font-medium
                    hover:text-white hover:bg-white/5 transition-all"
                  whileHover={{ scale: 1.05 }}
                >
                  View Detailed Report
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
