'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useRef, useEffect, useCallback } from 'react'
import {
  Mic, MicOff, Video, VideoOff, Phone, Clock, MessageSquare, User, Volume2
} from 'lucide-react'
import AIAvatarScene from '@/components/features/AIAvatarScene'

const scenarios = [
  { id: 'job', label: 'Job Interview Q&A', role: 'HR Manager' },
  { id: 'sales', label: 'Sales Pitch', role: 'Client' },
  { id: 'negotiation', label: 'Negotiation', role: 'Stakeholder' },
  { id: 'conflict', label: 'Conflict Resolution', role: 'Team Lead' },
  { id: 'team', label: 'Team Discussion', role: 'Manager' },
]

const scenarioQuestions: Record<string, string[]> = {
  job: [
    'Tell me about yourself and what motivates you.',
    'Describe a situation where you demonstrated leadership.',
    'How do you handle feedback and criticism?',
    'Walk me through a time you resolved a conflict in a team.',
    'Where do you see yourself in 5 years?',
  ],
  sales: [
    'Pitch your product to me in under 2 minutes.',
    'I am not convinced this solves my problem. Why should I care?',
    'Your competitor offers the same at a lower price. Respond.',
    'I need to think about it. What would you say?',
    'Close the deal — ask for my commitment.',
  ],
  negotiation: [
    'Present your opening position and justify it.',
    'I cannot meet that price. Counter my offer.',
    'What concessions are you willing to make?',
    'We seem stuck. Propose a creative solution.',
    'Summarize the agreement and confirm next steps.',
  ],
  conflict: [
    'A team member is consistently missing deadlines. Address this.',
    'Two colleagues disagree on the project direction. Mediate.',
    'Your idea was rejected by the team. How do you respond?',
    'A client is upset about a delayed delivery. Handle the conversation.',
    'You need to give difficult feedback to a peer. Proceed.',
  ],
  team: [
    'Kick off the meeting and set the agenda.',
    'A team member proposes a risky approach. Facilitate the discussion.',
    'Delegate tasks for the upcoming sprint.',
    'Someone is not contributing equally. Address it diplomatically.',
    'Wrap up the meeting with clear action items.',
  ],
}

const sampleScores = {
  confidence: 72,
  clarity: 85,
  persuasiveness: 68,
  fillerFrequency: 12,
  pace: 74,
  structure: 80,
}

const voiceMetrics = [
  { label: 'Pace', value: 'Moderate', detail: '142 wpm — ideal range', color: '#166534' },
  { label: 'Tone', value: 'Assertive', detail: 'Steady pitch, good projection', color: '#1E40AF' },
  { label: 'Volume', value: 'Consistent', detail: 'Minor dips during transitions', color: '#166534' },
  { label: 'Pauses', value: '3 long pauses', detail: 'Work on smoother transitions', color: '#92400E' },
  { label: 'Filler Words', value: '12 detected', detail: '"um" (7), "like" (3), "you know" (2)', color: '#991B1B' },
  { label: 'Vocal Stability', value: 'Good', detail: 'Slight hesitation on Q3', color: '#92400E' },
]

const confidenceIndicators = [
  { label: 'Hesitation', score: 35, inverted: true },
  { label: 'Assertiveness', score: 72, inverted: false },
  { label: 'Vocal Stability', score: 68, inverted: false },
]

const communicationScores = [
  { label: 'Structure', score: 80 },
  { label: 'Logical Flow', score: 75 },
  { label: 'Conciseness', score: 62 },
  { label: 'Persuasiveness', score: 68 },
]

export default function AIInterviewPage() {
  const [phase, setPhase] = useState<'setup' | 'interview' | 'results'>('setup')
  const [selectedScenario, setSelectedScenario] = useState(scenarios[0])
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOn, setIsVideoOn] = useState(true)
  const [speaking, setSpeaking] = useState(false)
  const [fillerCount, setFillerCount] = useState(0)
  const [transcript, setTranscript] = useState<string[]>([])
  const [waveformData, setWaveformData] = useState<number[]>(new Array(40).fill(4))
  const animRef = useRef<number>(0)

  const questions = scenarioQuestions[selectedScenario.id]

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
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((c) => c + 1)
      setTranscript((t) => [...t, `Q${currentQuestion + 1}: Answered`])
    } else {
      endInterview()
    }
  }, [currentQuestion, questions.length])

  const overallScore = Math.round(
    (sampleScores.confidence + sampleScores.clarity + sampleScores.persuasiveness +
      sampleScores.pace + sampleScores.structure) / 5
  )

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
            <p className="text-sm text-gray-500">Interactive role-play scenarios with real-time voice & confidence analysis</p>
          </div>
          {phase === 'interview' && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Clock size={14} />
              <span>Question {currentQuestion + 1}/{questions.length}</span>
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
              className="max-w-3xl mx-auto py-12"
            >
              <div className="text-center mb-10">
                <div className="w-36 h-36 mx-auto mb-6 rounded-full overflow-hidden border border-gray-200">
                  <AIAvatarScene />
                </div>
                <h2 className="text-3xl font-semibold text-gray-900 mb-3">Choose Your Scenario</h2>
                <p className="text-gray-500 max-w-lg mx-auto">
                  AI assumes a role and evaluates your speech patterns, confidence, clarity, and persuasiveness in real-time with visual reports.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-10">
                {scenarios.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSelectedScenario(s)}
                    className={`p-4 rounded-xl border text-left transition-all duration-200 ${
                      selectedScenario.id === s.id
                        ? 'bg-blue-50 border-blue-200 shadow-sm'
                        : 'bg-white border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium text-gray-900 text-sm">{s.label}</div>
                    <div className="text-xs text-gray-400 mt-1">AI plays: {s.role}</div>
                  </button>
                ))}
              </div>

              <div className="rounded-xl bg-gray-50 border border-gray-200 p-5 mb-8">
                <h4 className="font-medium text-gray-900 text-sm mb-3">What gets analyzed:</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    'Pace, Tone & Volume',
                    'Filler Words & Pauses',
                    'Confidence & Assertiveness',
                    'Vocal Stability',
                    'Logical Flow & Structure',
                    'Persuasiveness Score',
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-2 text-xs text-gray-600">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-center">
                <button
                  onClick={startInterview}
                  className="px-8 py-3 rounded-lg bg-blue-800 hover:bg-blue-900 text-white font-medium transition-colors duration-200"
                >
                  Start {selectedScenario.label}
                </button>
                <p className="text-[11px] text-gray-400 mt-2">Full audio/video with real-time transcription</p>
              </div>
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
                <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-blue-50 border border-blue-100">
                  <span className="text-sm font-medium text-blue-800">{selectedScenario.label}</span>
                  <span className="text-xs text-blue-600">AI role: {selectedScenario.role}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[400px]">
                  <div className="rounded-2xl overflow-hidden border border-gray-200 relative">
                    <AIAvatarScene speaking={!speaking} />
                    <div className="absolute bottom-3 left-3 px-3 py-1 rounded-full bg-white/90 border border-gray-200 text-xs text-gray-600">
                      AI {selectedScenario.role}
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
                    <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2 py-1 rounded-full bg-red-50 border border-red-200">
                      <motion.div
                        className="w-2 h-2 rounded-full bg-red-500"
                        animate={{ opacity: [1, 0.3, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      />
                      <span className="text-[10px] text-red-600 font-medium">REC</span>
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
                      <div className="text-xs text-gray-400 mb-1">Current Prompt</div>
                      <p className="text-gray-800 font-medium">
                        {questions[currentQuestion]}
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
                    {currentQuestion < questions.length - 1 ? 'Next Question' : 'End Session'}
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
                  <h4 className="text-xs text-gray-500 uppercase tracking-wider mb-3">Confidence Level</h4>
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
                      {['Assertive', 'Confident', 'Calm', 'Hesitant'].map((label) => (
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
                  <p className="text-[10px] text-gray-400 text-center mt-1">&quot;um&quot;, &quot;uh&quot;, &quot;like&quot;, &quot;you know&quot;</p>
                </div>

                <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-4">
                  <h4 className="text-xs text-gray-500 uppercase tracking-wider mb-2">Voice Analysis</h4>
                  <div className="space-y-2">
                    {['Pace', 'Tone', 'Clarity'].map((m) => (
                      <div key={m} className="flex items-center justify-between">
                        <span className="text-[10px] text-gray-500">{m}</span>
                        <motion.div className="h-1.5 w-16 bg-gray-100 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full rounded-full bg-blue-400"
                            animate={{ width: speaking ? `${55 + Math.random() * 35}%` : '40%' }}
                            transition={{ duration: 0.8 }}
                          />
                        </motion.div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-4 max-h-[200px] overflow-y-auto">
                  <h4 className="text-xs text-gray-500 uppercase tracking-wider mb-2">Live Transcript</h4>
                  <div className="space-y-1">
                    {transcript.map((t, i) => (
                      <p key={i} className="text-xs text-gray-500">{t}</p>
                    ))}
                    {speaking && (
                      <span className="text-xs text-blue-800">
                        Transcribing
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
              className="max-w-5xl mx-auto"
            >
              <div className="text-center mb-10">
                <h2 className="text-3xl font-semibold text-gray-900 mb-2">Performance Report</h2>
                <p className="text-gray-500">
                  {selectedScenario.label} — AI role: {selectedScenario.role}
                </p>
              </div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center mb-10"
              >
                <div className="inline-flex flex-col items-center p-8 rounded-2xl bg-white border border-gray-200 shadow-sm">
                  <div className="text-xs text-gray-400 uppercase tracking-wider mb-2">Overall Score</div>
                  <motion.div
                    className="text-6xl font-bold"
                    style={{ color: overallScore >= 75 ? '#166534' : overallScore >= 55 ? '#92400E' : '#991B1B' }}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                  >
                    {overallScore}
                  </motion.div>
                  <div className="text-sm text-gray-500 mt-1">out of 100</div>
                </div>
              </motion.div>

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
                      color: key === 'fillerFrequency'
                        ? (value > 10 ? '#991B1B' : '#166534')
                        : (value >= 75 ? '#166534' : value >= 55 ? '#92400E' : '#991B1B')
                    }}>
                      {value}{key === 'fillerFrequency' ? '' : '%'}
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{
                          background: key === 'fillerFrequency'
                            ? (value > 10 ? '#991B1B' : '#166534')
                            : (value >= 75 ? '#166534' : value >= 55 ? '#92400E' : '#991B1B'),
                        }}
                        initial={{ width: 0 }}
                        animate={{ width: `${key === 'fillerFrequency' ? Math.min(value * 5, 100) : value}%` }}
                        transition={{ duration: 1, delay: i * 0.08 }}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="rounded-2xl bg-white border border-gray-200 shadow-sm p-6 mb-6"
              >
                <div className="flex items-center gap-2 mb-5">
                  <Volume2 size={16} className="text-blue-800" />
                  <h3 className="font-semibold text-gray-900">Voice Analysis Breakdown</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {voiceMetrics.map((m, i) => (
                    <motion.div
                      key={m.label}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + i * 0.05 }}
                      className="p-3 rounded-lg bg-gray-50 border border-gray-100"
                    >
                      <div className="text-xs text-gray-400 mb-1">{m.label}</div>
                      <div className="text-sm font-semibold" style={{ color: m.color }}>{m.value}</div>
                      <div className="text-[10px] text-gray-400 mt-0.5">{m.detail}</div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="rounded-2xl bg-white border border-gray-200 shadow-sm p-6"
                >
                  <h3 className="font-semibold text-gray-900 mb-4">Confidence Indicators</h3>
                  <div className="space-y-4">
                    {confidenceIndicators.map((c, i) => (
                      <div key={c.label}>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-sm text-gray-600">{c.label}</span>
                          <span className="text-xs font-medium" style={{
                            color: c.inverted
                              ? (c.score < 40 ? '#166534' : '#991B1B')
                              : (c.score >= 70 ? '#166534' : c.score >= 50 ? '#92400E' : '#991B1B')
                          }}>
                            {c.score}%
                          </span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full rounded-full"
                            style={{
                              background: c.inverted
                                ? (c.score < 40 ? '#166534' : '#991B1B')
                                : (c.score >= 70 ? '#166534' : c.score >= 50 ? '#92400E' : '#991B1B'),
                            }}
                            initial={{ width: 0 }}
                            animate={{ width: `${c.score}%` }}
                            transition={{ duration: 1, delay: 0.8 + i * 0.1 }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="rounded-2xl bg-white border border-gray-200 shadow-sm p-6"
                >
                  <h3 className="font-semibold text-gray-900 mb-4">Communication Quality</h3>
                  <div className="space-y-4">
                    {communicationScores.map((c, i) => (
                      <div key={c.label}>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-sm text-gray-600">{c.label}</span>
                          <span className="text-xs font-medium" style={{
                            color: c.score >= 75 ? '#166534' : c.score >= 55 ? '#92400E' : '#991B1B'
                          }}>
                            {c.score}%
                          </span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full rounded-full"
                            style={{
                              background: c.score >= 75 ? '#166534' : c.score >= 55 ? '#92400E' : '#991B1B',
                            }}
                            initial={{ width: 0 }}
                            animate={{ width: `${c.score}%` }}
                            transition={{ duration: 1, delay: 0.9 + i * 0.1 }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                className="rounded-2xl bg-blue-50 border border-blue-100 p-6 mb-8"
              >
                <h3 className="font-semibold text-blue-900 mb-3">AI Improvement Suggestions</h3>
                <ul className="space-y-2">
                  {[
                    'Reduce filler words by pausing briefly instead of using "um" or "like" — practice the 2-second pause technique.',
                    'Strengthen your opening statements with a clear thesis before elaborating. Your structure score can improve 15+ points.',
                    'Work on vocal stability during difficult questions — try breathing exercises before responding.',
                    'Your persuasiveness would benefit from using concrete examples and data points in your arguments.',
                  ].map((tip, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-blue-800">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </motion.div>

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
                  Download Full Report
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
