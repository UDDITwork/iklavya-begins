'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useRef, useEffect, useCallback } from 'react'
import {
  Mic, MicOff, Video, VideoOff, Phone, Clock, MessageSquare, Bot, User
} from 'lucide-react'
import AIAvatarScene from '@/components/features/AIAvatarScene'

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
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">AI Interview Simulation</h1>
            <p className="text-sm text-gray-500">Practice with our AI interviewer</p>
          </div>
          {phase === 'interview' && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Clock size={14} />
              <span>Question {currentQuestion + 1}/{interviewQuestions.length}</span>
            </div>
          )}
        </motion.div>

        <AnimatePresence mode="wait">
          {phase === 'setup' && (
            <motion.div
              key="setup"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-2xl mx-auto text-center py-20"
            >
              <div className="w-40 h-40 mx-auto mb-8 rounded-full overflow-hidden border border-gray-200">
                <AIAvatarScene />
              </div>
              <h2 className="text-3xl font-semibold text-gray-900 mb-4">Ready for Your Interview?</h2>
              <p className="text-gray-500 mb-8 max-w-md mx-auto">
                Our AI interviewer will ask you {interviewQuestions.length} questions.
                Speak naturally — we&apos;ll analyze your confidence, clarity, and filler words in real-time.
              </p>
              <button
                onClick={startInterview}
                className="px-8 py-3 rounded-lg bg-blue-800 hover:bg-blue-900 text-white font-medium transition-colors duration-200"
              >
                Start Interview
              </button>
            </motion.div>
          )}

          {phase === 'interview' && (
            <motion.div
              key="interview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 lg:grid-cols-4 gap-6"
            >
              <div className="lg:col-span-3 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[400px]">
                  <div className="rounded-2xl overflow-hidden border border-gray-200 relative">
                    <AIAvatarScene speaking={!speaking} />
                    <div className="absolute bottom-3 left-3 px-3 py-1 rounded-full bg-white/90 border border-gray-200 text-xs text-gray-600">
                      AI Interviewer
                    </div>
                  </div>

                  <div className="rounded-2xl border border-gray-200 bg-gray-50 flex items-center justify-center relative">
                    <div className="w-24 h-24 rounded-full bg-blue-50 flex items-center justify-center">
                      <User size={32} className="text-blue-800" />
                    </div>
                    <div className="absolute bottom-3 left-3 px-3 py-1 rounded-full bg-white/90 border border-gray-200 text-xs text-gray-600">
                      You {speaking ? '(speaking)' : ''}
                    </div>
                    <div className="absolute bottom-3 right-3 flex items-end gap-[1.5px] h-6">
                      {waveformData.map((h, i) => (
                        <div
                          key={i}
                          className="w-[2px] rounded-full transition-all duration-100"
                          style={{
                            height: h,
                            background: speaking
                              ? h > 20 ? '#991B1B' : h > 12 ? '#92400E' : '#166534'
                              : '#E5E7EB',
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <motion.div
                  key={currentQuestion}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-5 rounded-xl bg-white border border-gray-200 shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    <MessageSquare size={18} className="text-blue-800 mt-0.5 shrink-0" />
                    <div>
                      <div className="text-xs text-gray-400 mb-1">Current Question</div>
                      <p className="text-gray-800 font-medium">
                        {interviewQuestions[currentQuestion]}
                      </p>
                    </div>
                  </div>
                </motion.div>

                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className={`w-11 h-11 rounded-full flex items-center justify-center transition-colors ${
                      isMuted ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-gray-50 border border-gray-200 text-gray-600'
                    }`}
                  >
                    {isMuted ? <MicOff size={18} /> : <Mic size={18} />}
                  </button>
                  <button
                    onClick={() => setIsVideoOn(!isVideoOn)}
                    className={`w-11 h-11 rounded-full flex items-center justify-center transition-colors ${
                      !isVideoOn ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-gray-50 border border-gray-200 text-gray-600'
                    }`}
                  >
                    {isVideoOn ? <Video size={18} /> : <VideoOff size={18} />}
                  </button>
                  <button
                    onClick={nextQuestion}
                    className="px-6 h-11 rounded-lg bg-blue-800 hover:bg-blue-900 text-white font-medium text-sm transition-colors duration-200"
                  >
                    {currentQuestion < interviewQuestions.length - 1 ? 'Next Question' : 'End Interview'}
                  </button>
                  <button
                    onClick={endInterview}
                    className="w-11 h-11 rounded-full bg-red-50 text-red-600 border border-red-200 flex items-center justify-center"
                  >
                    <Phone size={18} />
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-4">
                  <h4 className="text-xs text-gray-500 uppercase tracking-wider mb-3">Confidence</h4>
                  <div className="h-40 w-full relative rounded-lg overflow-hidden bg-gray-50">
                    <motion.div
                      className="absolute bottom-0 left-0 right-0 rounded-lg"
                      style={{
                        background: 'linear-gradient(to top, #166534, #92400E, #991B1B)',
                      }}
                      animate={{ height: `${speaking ? 65 : 40}%` }}
                      transition={{ duration: 0.5 }}
                    />
                    <div className="absolute inset-0 flex flex-col justify-between py-2 px-2">
                      {['Assertive', 'Confident', 'Calm', 'Nervous'].map((label) => (
                        <span key={label} className="text-[9px] text-gray-400">{label}</span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-4">
                  <h4 className="text-xs text-gray-500 uppercase tracking-wider mb-2">Filler Words</h4>
                  <motion.div
                    key={fillerCount}
                    className="text-3xl font-bold text-center"
                    style={{ color: fillerCount > 10 ? '#991B1B' : fillerCount > 5 ? '#92400E' : '#166534' }}
                    animate={{ scale: [1.2, 1] }}
                  >
                    {fillerCount}
                  </motion.div>
                  <p className="text-[10px] text-gray-400 text-center mt-1">um, uh, like detected</p>
                </div>

                <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-4 max-h-[200px] overflow-y-auto">
                  <h4 className="text-xs text-gray-500 uppercase tracking-wider mb-2">Transcript</h4>
                  <div className="space-y-1">
                    {transcript.map((t, i) => (
                      <p key={i} className="text-xs text-gray-500">{t}</p>
                    ))}
                    {speaking && (
                      <span className="text-xs text-blue-800">
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

          {phase === 'results' && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl mx-auto"
            >
              <div className="text-center mb-10">
                <h2 className="text-3xl font-semibold text-gray-900 mb-2">Interview Analysis</h2>
                <p className="text-gray-500">Here&apos;s how you performed</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                {Object.entries(sampleScores).map(([key, value], i) => (
                  <motion.div
                    key={key}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="rounded-xl bg-white border border-gray-200 shadow-sm p-5 text-center"
                  >
                    <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </div>
                    <div className="text-3xl font-bold mb-2" style={{
                      color: key === 'fillerWords'
                        ? (value > 10 ? '#991B1B' : '#166534')
                        : (value >= 80 ? '#166534' : value >= 60 ? '#92400E' : '#991B1B')
                    }}>
                      {value}{key === 'fillerWords' ? '' : '%'}
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{
                          background: key === 'fillerWords'
                            ? (value > 10 ? '#991B1B' : '#166534')
                            : (value >= 80 ? '#166534' : value >= 60 ? '#92400E' : '#991B1B'),
                        }}
                        initial={{ width: 0 }}
                        animate={{ width: `${key === 'fillerWords' ? Math.min(value * 5, 100) : value}%` }}
                        transition={{ duration: 1, delay: i * 0.08 }}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row justify-center gap-3">
                <button
                  onClick={() => {
                    setPhase('setup')
                    setCurrentQuestion(0)
                    setFillerCount(0)
                    setTranscript([])
                  }}
                  className="px-6 py-3 rounded-lg bg-blue-800 hover:bg-blue-900 text-white font-medium transition-colors duration-200"
                >
                  Practice Again
                </button>
                <button className="px-6 py-3 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium transition-colors duration-200">
                  View Detailed Report
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
