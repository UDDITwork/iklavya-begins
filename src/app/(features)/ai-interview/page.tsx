'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useRef, useEffect, useCallback } from 'react'
import {
  Mic, MicOff, Video, VideoOff, Phone, Clock, MessageSquare, User, Volume2,
  Bot, TrendingUp, Award, AlertCircle, Lightbulb, Activity,
  Briefcase, BarChart3, Handshake, Scale, Users
} from 'lucide-react'
import Image from 'next/image'
import AIAvatarScene from '@/components/features/AIAvatarScene'
import InterviewStageScene from '@/components/illustrations/scenes/InterviewStageScene'

/* ─── Types ─── */

interface FillerToast {
  id: number
  word: string
}

interface TranscriptEntry {
  speaker: 'ai' | 'user'
  time: string
  text?: string
  segments?: { text: string; type: 'normal' | 'filler' }[]
}

/* ─── Constants ─── */

const scenarioIcons: Record<string, React.ElementType> = {
  job: Briefcase,
  sales: BarChart3,
  negotiation: Handshake,
  conflict: Scale,
  team: Users,
}

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

const averageScores = {
  confidence: 65,
  clarity: 72,
  persuasiveness: 58,
  fillerFrequency: 18,
  pace: 68,
  structure: 70,
}

const voiceMetrics = [
  { label: 'Pace', value: 'Moderate', detail: '142 wpm — ideal range', color: '#166534' },
  { label: 'Tone', value: 'Assertive', detail: 'Steady pitch, good projection', color: '#166534' },
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

const radarData = [
  { label: 'Confidence', value: 72, avg: 65 },
  { label: 'Clarity', value: 85, avg: 72 },
  { label: 'Persuasion', value: 68, avg: 58 },
  { label: 'Pace', value: 74, avg: 68 },
  { label: 'Structure', value: 80, avg: 70 },
  { label: 'Stability', value: 68, avg: 60 },
]

const questionPerformance = [
  { q: 1, score: 82, label: 'Strong opener' },
  { q: 2, score: 65, label: 'Hesitant start' },
  { q: 3, score: 48, label: 'Low confidence' },
  { q: 4, score: 78, label: 'Good recovery' },
  { q: 5, score: 88, label: 'Strong close' },
]

const wordFrequency = [
  { word: 'team', count: 8, filler: false },
  { word: 'um', count: 7, filler: true },
  { word: 'leadership', count: 6, filler: false },
  { word: 'project', count: 5, filler: false },
  { word: 'communication', count: 5, filler: false },
  { word: 'strategy', count: 4, filler: false },
  { word: 'goal', count: 4, filler: false },
  { word: 'like', count: 3, filler: true },
  { word: 'collaboration', count: 3, filler: false },
  { word: 'experience', count: 3, filler: false },
  { word: 'challenge', count: 3, filler: false },
  { word: 'you know', count: 2, filler: true },
  { word: 'solution', count: 2, filler: false },
  { word: 'basically', count: 2, filler: true },
]

const transcriptData: TranscriptEntry[] = [
  {
    speaker: 'ai',
    text: 'Tell me about yourself and what motivates you.',
    time: '0:12',
  },
  {
    speaker: 'user',
    time: '0:18',
    segments: [
      { text: "Thank you. I'm a final year student focused on ", type: 'normal' },
      { text: 'um', type: 'filler' },
      { text: ' business development and team leadership. What motivates me is ', type: 'normal' },
      { text: 'like', type: 'filler' },
      { text: ' seeing real impact from collaboration — I led a team of 8 at our college fest and increased participation by 40%.', type: 'normal' },
    ],
  },
  {
    speaker: 'ai',
    text: 'Describe a situation where you demonstrated leadership.',
    time: '1:42',
  },
  {
    speaker: 'user',
    time: '1:48',
    segments: [
      { text: 'During our annual hackathon, two team members had conflicting ideas. I stepped in and ', type: 'normal' },
      { text: 'you know', type: 'filler' },
      { text: ' facilitated a structured discussion, helping each person present their viewpoint. We ', type: 'normal' },
      { text: 'basically', type: 'filler' },
      { text: ' combined the best elements and delivered our project ahead of schedule.', type: 'normal' },
    ],
  },
]

const fillerWordList = ['um', 'uh', 'like', 'you know', 'basically']

/* ─── Helpers ─── */

function getScoreColor(score: number) {
  if (score > 85) return '#D97706'
  if (score > 70) return '#16A34A'
  if (score >= 50) return '#EA580C'
  return '#DC2626'
}

function getScoreBg(score: number) {
  if (score > 85) return '#FEF3C7'
  if (score > 70) return '#DCFCE7'
  if (score >= 50) return '#FFEDD5'
  return '#FEE2E2'
}

function getScoreGrade(score: number) {
  if (score > 85) return 'Outstanding'
  if (score > 70) return 'Great'
  if (score >= 50) return 'Good'
  return 'Needs Work'
}

/* ─── Sub-components: Results ─── */

function ScoreCelebration({ color }: { color: string }) {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i / 12) * 360
        const distance = 70 + Math.random() * 30
        const rad = (angle * Math.PI) / 180
        return (
          <motion.div
            key={i}
            className="absolute left-1/2 top-1/2 w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: color }}
            initial={{ x: 0, y: 0, opacity: 0.8 }}
            animate={{
              x: Math.cos(rad) * distance,
              y: Math.sin(rad) * distance,
              opacity: 0,
              scale: 0,
            }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          />
        )
      })}
    </div>
  )
}

function AnimatedScoreRing({ score }: { score: number }) {
  const [displayScore, setDisplayScore] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [showGrade, setShowGrade] = useState(false)

  useEffect(() => {
    const duration = 2000
    let start: number | null = null
    let animFrame: number

    const step = (timestamp: number) => {
      if (!start) start = timestamp
      const elapsed = timestamp - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplayScore(Math.round(eased * score))

      if (progress < 1) {
        animFrame = requestAnimationFrame(step)
      } else {
        setRevealed(true)
        setTimeout(() => setShowGrade(true), 300)
      }
    }

    const timeout = setTimeout(() => {
      animFrame = requestAnimationFrame(step)
    }, 600)

    return () => {
      clearTimeout(timeout)
      cancelAnimationFrame(animFrame)
    }
  }, [score])

  const color = getScoreColor(score)
  const grade = getScoreGrade(score)
  const size = 200
  const strokeWidth = 8
  const radius = (size - strokeWidth * 2) / 2
  const circumference = 2 * Math.PI * radius
  const previousScore = 68

  return (
    <div className="relative inline-flex flex-col items-center">
      <div className="relative">
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none" stroke="#F3F4F6" strokeWidth={strokeWidth}
          />
          <motion.circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none" stroke={color} strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference - (score / 100) * circumference }}
            transition={{ duration: 2, ease: [0.33, 1, 0.68, 1], delay: 0.6 }}
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className="text-5xl font-bold tabular-nums"
            style={{ color }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {displayScore}
          </motion.span>
          <span className="text-xs text-gray-400 mt-1">out of 100</span>
        </div>

        {revealed && score > 80 && <ScoreCelebration color={color} />}
      </div>

      <AnimatePresence>
        {showGrade && (
          <motion.div
            initial={{ opacity: 0, scale: 0, y: -5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
            className="mt-3 px-5 py-1.5 rounded-full text-sm font-semibold flex items-center gap-1.5"
            style={{ backgroundColor: getScoreBg(score), color }}
          >
            <Award size={14} />
            {grade}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2.8 }}
        className="mt-3 flex items-center gap-3 text-xs"
      >
        <span className="flex items-center gap-1 text-green-600">
          <TrendingUp size={11} />
          +{score - previousScore} from last session
        </span>
        <span className="text-gray-300">|</span>
        <span className="text-gray-500">
          Avg: {Math.round(Object.values(averageScores).slice(0, 5).reduce((a, b) => a + b, 0) / 5)}
        </span>
      </motion.div>
    </div>
  )
}

function RadarChart({ data }: { data: { label: string; value: number; avg: number }[] }) {
  const size = 260
  const cx = size / 2
  const cy = size / 2
  const maxR = 95
  const n = data.length

  function pt(i: number, r: number): [number, number] {
    const a = (Math.PI * 2 * i) / n - Math.PI / 2
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)]
  }

  function poly(values: number[]) {
    return values.map((v, i) => pt(i, (v / 100) * maxR).join(',')).join(' ')
  }

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-full max-w-[260px] mx-auto">
      {/* Grid rings */}
      {[25, 50, 75, 100].map(level => (
        <polygon
          key={level}
          points={Array.from({ length: n }, (_, i) => pt(i, (level / 100) * maxR).join(',')).join(' ')}
          fill="none" stroke="#E5E7EB" strokeWidth={0.5}
        />
      ))}

      {/* Axis lines */}
      {data.map((_, i) => {
        const [ex, ey] = pt(i, maxR)
        return <line key={i} x1={cx} y1={cy} x2={ex} y2={ey} stroke="#E5E7EB" strokeWidth={0.5} />
      })}

      {/* Average ghost polygon */}
      <motion.polygon
        points={poly(data.map(d => d.avg))}
        fill="rgba(209,213,219,0.12)"
        stroke="#D1D5DB"
        strokeWidth={1}
        strokeDasharray="3 2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.7 }}
        transition={{ delay: 2.2 }}
      />

      {/* Data polygon fill */}
      <motion.polygon
        points={poly(data.map(d => d.value))}
        fill="rgba(22,101,52,0.08)"
        stroke="none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.6 }}
      />

      {/* Data polygon stroke */}
      <motion.polygon
        points={poly(data.map(d => d.value))}
        fill="none"
        stroke="#166534"
        strokeWidth={2}
        strokeLinejoin="round"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.8 }}
      />

      {/* Data dots */}
      {data.map((d, i) => {
        const [px, py] = pt(i, (d.value / 100) * maxR)
        return (
          <motion.circle
            key={i}
            cx={px} cy={py} r={3.5}
            fill="white" stroke="#166534" strokeWidth={2}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 1.5 + i * 0.08 }}
          />
        )
      })}

      {/* Labels */}
      {data.map((d, i) => {
        const [lx, ly] = pt(i, maxR + 22)
        const anchor = lx < cx - 10 ? 'end' : lx > cx + 10 ? 'start' : 'middle'
        return (
          <text key={d.label} x={lx} y={ly} textAnchor={anchor} dominantBaseline="middle"
            style={{ fontSize: '10px' }} className="fill-gray-500">
            {d.label}
          </text>
        )
      })}

      {/* Value labels near dots */}
      {data.map((d, i) => {
        const [px, py] = pt(i, (d.value / 100) * maxR)
        return (
          <motion.text
            key={`v-${i}`}
            x={px} y={py - 10}
            textAnchor="middle"
            style={{ fontSize: '9px' }}
            className="fill-green-800 font-semibold"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2 + i * 0.05 }}
          >
            {d.value}
          </motion.text>
        )
      })}

      {/* Legend */}
      <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.5 }}>
        <rect x={8} y={size - 28} width={8} height={8} rx={1.5} fill="#166534" opacity={0.15} stroke="#166534" strokeWidth={1} />
        <text x={20} y={size - 21} style={{ fontSize: '9px' }} className="fill-gray-500">You</text>
        <rect x={50} y={size - 28} width={8} height={8} rx={1.5} fill="#D1D5DB" opacity={0.3} stroke="#D1D5DB" strokeWidth={1} strokeDasharray="2 1" />
        <text x={62} y={size - 21} style={{ fontSize: '9px' }} className="fill-gray-400">Average</text>
      </motion.g>
    </svg>
  )
}

function QuestionTimeline({ data }: { data: typeof questionPerformance }) {
  const [hoveredQ, setHoveredQ] = useState<number | null>(null)

  return (
    <div>
      <div className="flex gap-1.5 h-14 rounded-xl overflow-hidden">
        {data.map((q, i) => (
          <div
            key={q.q}
            className="relative flex-1 cursor-pointer rounded-lg overflow-hidden"
            onMouseEnter={() => setHoveredQ(q.q)}
            onMouseLeave={() => setHoveredQ(null)}
          >
            <motion.div
              className="absolute inset-0"
              style={{ backgroundColor: getScoreColor(q.score) }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.12 + (q.score / 100) * 0.25 }}
              transition={{ delay: 0.3 + i * 0.12, duration: 0.5 }}
            />
            <motion.div
              className="absolute bottom-0 left-0 right-0 opacity-20"
              style={{ backgroundColor: getScoreColor(q.score) }}
              initial={{ height: 0 }}
              animate={{ height: `${(q.score / 100) * 100}%` }}
              transition={{ delay: 0.5 + i * 0.12, duration: 0.6, ease: 'easeOut' }}
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
              <span className="text-xs font-bold" style={{ color: getScoreColor(q.score) }}>
                Q{q.q}
              </span>
              <span className="text-[9px] text-gray-400">{q.score}</span>
            </div>

            {q.score < 55 && (
              <motion.div
                className="absolute top-1 right-1 z-10"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1.2 + i * 0.1 }}
              >
                <AlertCircle size={10} className="text-red-400" />
              </motion.div>
            )}

            <AnimatePresence>
              {hoveredQ === q.q && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="absolute -bottom-14 left-1/2 -translate-x-1/2 px-3 py-2 rounded-lg bg-gray-900 text-white text-[10px] whitespace-nowrap z-20 shadow-lg"
                >
                  <div className="font-medium">{q.label}</div>
                  <div className="text-gray-400">Score: {q.score}/100</div>
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mt-2 px-1">
        <span className="text-[9px] text-gray-400">Start</span>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-[9px] text-green-600">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" /> Strong
          </span>
          <span className="flex items-center gap-1 text-[9px] text-orange-500">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-400" /> Moderate
          </span>
          <span className="flex items-center gap-1 text-[9px] text-red-500">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400" /> Weak
          </span>
        </div>
        <span className="text-[9px] text-gray-400">End</span>
      </div>
    </div>
  )
}

function WordCloud({ data }: { data: typeof wordFrequency }) {
  const maxCount = Math.max(...data.map(d => d.count))

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 py-3">
      {data.map((item, i) => {
        const scale = 0.65 + (item.count / maxCount) * 0.55
        return (
          <motion.span
            key={item.word}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 + i * 0.05 }}
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-medium ${
              item.filler
                ? 'bg-red-50 text-red-500 border border-red-200'
                : 'bg-green-50/40 text-green-800 border border-green-200'
            }`}
            style={{ fontSize: `${scale}rem` }}
          >
            {item.word}
            <span className="text-[8px] opacity-40">{item.count}</span>
          </motion.span>
        )
      })}
    </div>
  )
}

function AnnotatedTranscript({ data }: { data: TranscriptEntry[] }) {
  return (
    <div className="space-y-3 max-h-[280px] overflow-y-auto pr-2">
      {data.map((entry, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 + i * 0.12 }}
          className="flex gap-2.5"
        >
          <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
            entry.speaker === 'ai' ? 'bg-gray-100 text-gray-500' : 'bg-green-50/40 text-green-800'
          }`}>
            {entry.speaker === 'ai' ? <Bot size={11} /> : <User size={11} />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[10px] font-medium text-gray-400">
                {entry.speaker === 'ai' ? 'AI Interviewer' : 'You'}
              </span>
              <span className="text-[9px] text-gray-300">{entry.time}</span>
            </div>
            <div className="text-xs text-gray-600 leading-relaxed">
              {entry.segments
                ? entry.segments.map((seg, j) =>
                    seg.type === 'filler'
                      ? <span key={j} className="mx-0.5 px-1 py-px rounded bg-red-50 text-red-500 text-[10px] font-semibold border border-red-100">{seg.text}</span>
                      : <span key={j}>{seg.text}</span>
                  )
                : <span className="text-gray-700 font-medium">{entry.text}</span>
              }
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

function InterviewTimer({ startTime }: { startTime: number }) {
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000))
    }, 1000)
    return () => clearInterval(interval)
  }, [startTime])

  const mins = Math.floor(elapsed / 60)
  const secs = elapsed % 60
  const isLong = elapsed > 600

  return (
    <div className={`flex items-center gap-1.5 font-mono text-sm ${isLong ? 'text-red-500' : 'text-gray-500'}`}>
      <Clock size={14} />
      <span>{String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}</span>
      {isLong && (
        <motion.span
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
          className="text-[9px] text-red-400"
        >
          wrap up
        </motion.span>
      )}
    </div>
  )
}

/* ─── Main Component ─── */

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
  const [fillerToasts, setFillerToasts] = useState<FillerToast[]>([])
  const [interviewStartTime, setInterviewStartTime] = useState(0)
  const animRef = useRef<number>(0)

  const questions = scenarioQuestions[selectedScenario.id]

  const overallScore = Math.round(
    (sampleScores.confidence + sampleScores.clarity + sampleScores.persuasiveness +
      sampleScores.pace + sampleScores.structure) / 5
  )

  // Waveform animation
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

  // Speaking toggle + filler word detection
  useEffect(() => {
    if (phase !== 'interview') return
    const interval = setInterval(() => {
      setSpeaking((s) => !s)
      if (Math.random() > 0.65) {
        setFillerCount((c) => c + 1)
        const word = fillerWordList[Math.floor(Math.random() * fillerWordList.length)]
        const id = Date.now()
        setFillerToasts((prev) => [...prev, { id, word }])
        setTimeout(() => {
          setFillerToasts((prev) => prev.filter((t) => t.id !== id))
        }, 2500)
      }
    }, 3000)
    return () => clearInterval(interval)
  }, [phase])

  const startInterview = () => {
    setPhase('interview')
    setInterviewStartTime(Date.now())
  }

  const endInterview = () => setPhase('results')

  const nextQuestion = useCallback(() => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((c) => c + 1)
      setTranscript((t) => [...t, `Q${currentQuestion + 1}: Answered`])
    } else {
      endInterview()
    }
  }, [currentQuestion, questions.length])

  return (
    <div className="min-h-screen bg-white">
      {/* Filler word toasts — interview phase */}
      <div className="fixed top-20 right-4 z-50 space-y-2 pointer-events-none">
        <AnimatePresence>
          {fillerToasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 60, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 60, scale: 0.9 }}
              className="px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-xs text-red-600 flex items-center gap-2 shadow-sm"
            >
              <AlertCircle size={12} />
              Filler: &ldquo;{toast.word}&rdquo;
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-3 sm:gap-6">
            <div className="flex-1">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold text-gray-900">Personal Interview Preparation</h1>
              <p className="text-sm text-gray-500">AI trained on Indian interview formats &mdash; HR, technical, behavioral &amp; salary negotiation through text, voice &amp; video</p>
            </div>
            <div className="hidden md:block w-48 h-40">
              <Image src="/ai interviewer.png" alt="AI Interview Simulation" width={200} height={160} className="object-contain w-full h-full" />
            </div>
          </div>
          {phase === 'interview' && (
            <div className="flex items-center gap-4">
              <InterviewTimer startTime={interviewStartTime} />
              <div className="text-sm text-gray-400">
                Q {currentQuestion + 1}/{questions.length}
              </div>
            </div>
          )}
        </motion.div>

        <AnimatePresence mode="wait">
          {/* ─── SETUP PHASE ─── */}
          {phase === 'setup' && (
            <motion.div
              key="setup"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-3xl mx-auto py-12"
            >
              <div className="text-center mb-10 relative">
                {/* Background scene illustration */}
                <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
                  <InterviewStageScene className="w-[400px] h-[300px]" />
                </div>
                <div className="relative z-10">
                <div className="w-36 h-36 mx-auto mb-6 rounded-full overflow-hidden border border-gray-200">
                  <AIAvatarScene />
                </div>
                <h2 className="text-3xl font-semibold text-gray-900 mb-3">Choose Your Scenario</h2>
                <p className="text-gray-500 max-w-lg mx-auto">
                  AI assumes a role and evaluates your speech patterns, confidence, clarity, and persuasiveness in real-time.
                </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 mb-4 sm:mb-8">
                {scenarios.map((s) => {
                  const ScenarioIcon = (scenarioIcons[s.id] || Briefcase) as typeof Briefcase
                  return (
                    <button
                      key={s.id}
                      onClick={() => setSelectedScenario(s)}
                      className={`p-4 rounded-xl border text-left transition-all duration-200 ${
                        selectedScenario.id === s.id
                          ? 'bg-green-50/40 border-green-200 shadow-sm'
                          : 'bg-white border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <ScenarioIcon size={18} className={selectedScenario.id === s.id ? 'text-green-800' : 'text-gray-400'} />
                        <span className="font-medium text-gray-900 text-sm">{s.label}</span>
                      </div>
                      <div className="text-xs text-gray-400">AI plays: {s.role}</div>
                    </button>
                  )
                })}
              </div>

              {/* Preview questions for selected scenario */}
              <motion.div
                key={selectedScenario.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl bg-white border border-gray-200 p-3 sm:p-4 md:p-5 mb-6"
              >
                <h4 className="font-medium text-gray-900 text-sm mb-3">
                  Sample Questions — {selectedScenario.label}
                </h4>
                <div className="space-y-2">
                  {questions.slice(0, 3).map((q, i) => (
                    <motion.div
                      key={q}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.08 }}
                      className="flex items-start gap-2 text-sm text-gray-600"
                    >
                      <span className="text-[10px] text-gray-300 mt-0.5 shrink-0 w-4">{i + 1}.</span>
                      {q}
                    </motion.div>
                  ))}
                  <p className="text-[11px] text-gray-400 pl-4">+ {questions.length - 3} more questions</p>
                </div>
              </motion.div>

              <div className="rounded-xl bg-gray-50 border border-gray-200 p-3 sm:p-4 md:p-5 mb-8">
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
                      <div className="w-1.5 h-1.5 rounded-full bg-green-700" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-center">
                <button
                  onClick={startInterview}
                  className="px-6 sm:px-8 py-3 min-h-[44px] w-full sm:w-auto rounded-lg border-2 border-green-800 text-green-800 bg-white hover:bg-green-50 font-medium transition-colors duration-200"
                >
                  Start {selectedScenario.label}
                </button>
                <p className="text-[11px] text-gray-400 mt-2">Full audio/video with real-time transcription</p>
              </div>
            </motion.div>
          )}

          {/* ─── INTERVIEW PHASE ─── */}
          {phase === 'interview' && (
            <motion.div
              key="interview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 lg:grid-cols-4 gap-6"
            >
              <div className="lg:col-span-3 space-y-4">
                <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-green-50/40 border border-green-200">
                  {(() => { const I = (scenarioIcons[selectedScenario.id] || Briefcase) as typeof Briefcase; return <I size={16} className="text-green-800" /> })()}
                  <span className="text-sm font-medium text-green-800">{selectedScenario.label}</span>
                  <span className="text-xs text-green-700">AI role: {selectedScenario.role}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-auto min-h-[250px] sm:min-h-[300px] md:h-[400px]">
                  {/* AI video */}
                  <div className="rounded-2xl overflow-hidden border border-gray-200 relative">
                    <AIAvatarScene speaking={!speaking} />
                    <div className="absolute bottom-3 left-3 px-3 py-1 rounded-full bg-white/90 border border-gray-200 text-xs text-gray-600">
                      AI {selectedScenario.role}
                    </div>
                  </div>

                  {/* User video */}
                  <div className="rounded-2xl border border-gray-200 bg-gray-50 flex items-center justify-center relative">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full bg-green-50/40 flex items-center justify-center">
                      <User size={32} className="text-green-800" />
                    </div>
                    <div className="absolute bottom-3 left-3 px-3 py-1 rounded-full bg-white/90 border border-gray-200 text-xs text-gray-600">
                      You {speaking ? '(speaking)' : ''}
                    </div>

                    {/* Color-shifting waveform */}
                    <div className="absolute bottom-3 right-3 flex items-end gap-[1.5px] h-6">
                      {waveformData.map((h, i) => (
                        <div
                          key={i}
                          className="w-[2px] rounded-full transition-all duration-75"
                          style={{
                            height: h,
                            background: speaking
                              ? `hsl(${Math.max(0, 120 - (h / 34) * 120)}, 65%, 42%)`
                              : '#E5E7EB',
                          }}
                        />
                      ))}
                    </div>

                    {/* REC indicator */}
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

                {/* Current prompt */}
                <motion.div
                  key={currentQuestion}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 sm:p-4 md:p-5 rounded-xl bg-white border border-gray-200 shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    <MessageSquare size={18} className="text-green-800 mt-0.5 shrink-0" />
                    <div>
                      <div className="text-xs text-gray-400 mb-1">Current Prompt</div>
                      <p className="text-gray-800 font-medium">{questions[currentQuestion]}</p>
                    </div>
                  </div>
                </motion.div>

                {/* Controls */}
                <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
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
                    className="px-4 sm:px-6 h-10 sm:h-11 min-h-[44px] rounded-lg border-2 border-green-800 text-green-800 bg-white hover:bg-green-50 font-medium text-sm transition-colors duration-200"
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

              {/* Sidebar */}
              <div className="space-y-2 sm:space-y-3 lg:space-y-4">
                {/* Confidence meter */}
                <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-3 sm:p-4">
                  <h4 className="text-xs text-gray-500 uppercase tracking-wider mb-3">Confidence Level</h4>
                  <div className="h-32 sm:h-40 w-full relative rounded-lg overflow-hidden bg-gray-50">
                    <motion.div
                      className="absolute bottom-0 left-0 right-0 rounded-lg"
                      style={{ background: 'linear-gradient(to top, #166534, #92400E, #991B1B)' }}
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

                {/* Filler counter */}
                <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-3 sm:p-4">
                  <h4 className="text-xs text-gray-500 uppercase tracking-wider mb-2">Filler Words</h4>
                  <motion.div
                    key={fillerCount}
                    className="text-3xl font-bold text-center tabular-nums"
                    style={{ color: fillerCount > 10 ? '#991B1B' : fillerCount > 5 ? '#92400E' : '#166534' }}
                    animate={{ scale: [1.2, 1] }}
                  >
                    {fillerCount}
                  </motion.div>
                  <p className="text-[10px] text-gray-400 text-center mt-1">&quot;um&quot;, &quot;uh&quot;, &quot;like&quot;, &quot;you know&quot;</p>
                </div>

                {/* Live voice analysis */}
                <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-3 sm:p-4">
                  <h4 className="text-xs text-gray-500 uppercase tracking-wider mb-2">Voice Analysis</h4>
                  <div className="space-y-2">
                    {['Pace', 'Tone', 'Clarity'].map((m) => (
                      <div key={m} className="flex items-center justify-between">
                        <span className="text-[10px] text-gray-500">{m}</span>
                        <div className="h-1.5 w-16 bg-gray-100 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full rounded-full bg-green-700"
                            animate={{ width: speaking ? `${55 + Math.random() * 35}%` : '40%' }}
                            transition={{ duration: 0.8 }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Live transcript */}
                <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-3 sm:p-4 max-h-[200px] overflow-y-auto">
                  <h4 className="text-xs text-gray-500 uppercase tracking-wider mb-2">Live Transcript</h4>
                  <div className="space-y-1">
                    {transcript.map((t, i) => (
                      <p key={i} className="text-xs text-gray-500">{t}</p>
                    ))}
                    {speaking && (
                      <span className="text-xs text-green-800">
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

          {/* ─── RESULTS PHASE ─── */}
          {phase === 'results' && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-5xl mx-auto"
            >
              {/* Header */}
              <div className="text-center mb-10">
                <motion.h2
                  className="text-3xl font-semibold text-gray-900 mb-2"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  Performance Report
                </motion.h2>
                <motion.p
                  className="text-gray-500"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.15 }}
                >
                  {selectedScenario.label} — AI role: {selectedScenario.role}
                </motion.p>
              </div>

              {/* Score Reveal */}
              <div className="flex justify-center mb-12">
                <AnimatedScoreRing score={overallScore} />
              </div>

              {/* Radar Chart + Sub-Scores */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-6 md:mb-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="rounded-2xl bg-white border border-gray-200 shadow-sm p-6"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <Activity size={16} className="text-green-800" />
                    <h3 className="font-semibold text-gray-900">Skills Radar</h3>
                  </div>
                  <RadarChart data={radarData} />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="rounded-2xl bg-white border border-gray-200 shadow-sm p-6"
                >
                  <h3 className="font-semibold text-gray-900 mb-4">Score Breakdown</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(sampleScores).map(([key, value], i) => {
                      const isFillerKey = key === 'fillerFrequency'
                      const scoreForColor = isFillerKey ? (value > 10 ? 30 : value > 5 ? 60 : 80) : value
                      const avgVal = averageScores[key as keyof typeof averageScores]
                      const diff = isFillerKey ? avgVal - value : value - avgVal
                      return (
                        <motion.div
                          key={key}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.5 + i * 0.06 }}
                          className="p-3 rounded-xl bg-gray-50 border border-gray-100"
                        >
                          <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </div>
                          <div className="flex items-end gap-1.5">
                            <span className="text-2xl font-bold tabular-nums" style={{ color: getScoreColor(scoreForColor) }}>
                              {value}{isFillerKey ? '' : '%'}
                            </span>
                            {diff !== 0 && (
                              <span className={`text-[10px] pb-1 font-medium ${diff > 0 ? 'text-green-600' : 'text-red-500'}`}>
                                {diff > 0 ? '+' : ''}{diff}{isFillerKey ? '' : '%'}
                              </span>
                            )}
                          </div>
                          <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <motion.div
                              className="h-full rounded-full"
                              style={{ background: getScoreColor(scoreForColor) }}
                              initial={{ width: 0 }}
                              animate={{ width: `${isFillerKey ? Math.min(value * 5, 100) : value}%` }}
                              transition={{ duration: 1, delay: 0.6 + i * 0.06 }}
                            />
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                </motion.div>
              </div>

              {/* Interview Timeline */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="rounded-2xl bg-white border border-gray-200 shadow-sm p-6 mb-8"
              >
                <div className="flex items-center gap-2 mb-4">
                  <Activity size={16} className="text-green-800" />
                  <h3 className="font-semibold text-gray-900">Question-by-Question Timeline</h3>
                </div>
                <QuestionTimeline data={questionPerformance} />
              </motion.div>

              {/* Voice Analysis */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="rounded-2xl bg-white border border-gray-200 shadow-sm p-6 mb-6"
              >
                <div className="flex items-center gap-2 mb-5">
                  <Volume2 size={16} className="text-green-800" />
                  <h3 className="font-semibold text-gray-900">Voice Analysis Breakdown</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {voiceMetrics.map((m, i) => (
                    <motion.div
                      key={m.label}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.8 + i * 0.05 }}
                      className="p-3 rounded-lg bg-gray-50 border border-gray-100"
                    >
                      <div className="text-xs text-gray-400 mb-1">{m.label}</div>
                      <div className="text-sm font-semibold" style={{ color: m.color }}>{m.value}</div>
                      <div className="text-[10px] text-gray-400 mt-0.5">{m.detail}</div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Confidence + Communication */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-6 md:mb-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.85 }}
                  className="rounded-2xl bg-white border border-gray-200 shadow-sm p-6"
                >
                  <h3 className="font-semibold text-gray-900 mb-4">Confidence Indicators</h3>
                  <div className="space-y-4">
                    {confidenceIndicators.map((c, i) => {
                      const barColor = c.inverted
                        ? (c.score < 40 ? '#16A34A' : '#DC2626')
                        : getScoreColor(c.score)
                      return (
                        <div key={c.label}>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-sm text-gray-600">{c.label}</span>
                            <span className="text-xs font-medium tabular-nums" style={{ color: barColor }}>
                              {c.score}%
                            </span>
                          </div>
                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <motion.div
                              className="h-full rounded-full"
                              style={{ background: barColor }}
                              initial={{ width: 0 }}
                              animate={{ width: `${c.score}%` }}
                              transition={{ duration: 1, delay: 0.9 + i * 0.1 }}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.95 }}
                  className="rounded-2xl bg-white border border-gray-200 shadow-sm p-6"
                >
                  <h3 className="font-semibold text-gray-900 mb-4">Communication Quality</h3>
                  <div className="space-y-4">
                    {communicationScores.map((c, i) => (
                      <div key={c.label}>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-sm text-gray-600">{c.label}</span>
                          <span className="text-xs font-medium tabular-nums" style={{ color: getScoreColor(c.score) }}>
                            {c.score}%
                          </span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full rounded-full"
                            style={{ background: getScoreColor(c.score) }}
                            initial={{ width: 0 }}
                            animate={{ width: `${c.score}%` }}
                            transition={{ duration: 1, delay: 1 + i * 0.1 }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </div>

              {/* Word Cloud + Annotated Transcript */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-6 md:mb-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.05 }}
                  className="rounded-2xl bg-white border border-gray-200 shadow-sm p-6"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900">Word Frequency</h3>
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1 text-[9px] text-green-700">
                        <span className="w-2 h-2 rounded bg-green-100 border border-green-200" /> Keywords
                      </span>
                      <span className="flex items-center gap-1 text-[9px] text-red-500">
                        <span className="w-2 h-2 rounded bg-red-50 border border-red-200" /> Fillers
                      </span>
                    </div>
                  </div>
                  <WordCloud data={wordFrequency} />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.15 }}
                  className="rounded-2xl bg-white border border-gray-200 shadow-sm p-6"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900">Annotated Transcript</h3>
                    <span className="text-[10px] text-red-400 bg-red-50 px-2 py-0.5 rounded border border-red-100">
                      {transcriptData.reduce((acc, e) =>
                        acc + (e.segments?.filter(s => s.type === 'filler').length || 0), 0
                      )} fillers detected
                    </span>
                  </div>
                  <AnnotatedTranscript data={transcriptData} />
                </motion.div>
              </div>

              {/* AI Improvement Suggestions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 }}
                className="rounded-2xl bg-green-50/40 border border-green-200 p-6 mb-8"
              >
                <div className="flex items-center gap-2 mb-4">
                  <Lightbulb size={16} className="text-green-800" />
                  <h3 className="font-semibold text-green-900">AI Improvement Suggestions</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    {
                      title: 'Reduce Filler Words',
                      tip: 'Practice the 2-second pause technique. When you feel "um" coming, simply pause. Silence sounds more confident than fillers.',
                    },
                    {
                      title: 'Strengthen Openings',
                      tip: 'Start with a clear thesis before elaborating. Your structure score can improve 15+ points with stronger opening statements.',
                    },
                    {
                      title: 'Vocal Stability',
                      tip: 'Try box breathing (4-4-4-4) before responding to tough questions. Your voice wavered on Q3 — this technique helps.',
                    },
                    {
                      title: 'Add Concrete Examples',
                      tip: 'Your persuasiveness would jump from 68 to 80+ by using specific data points and quantified results in your arguments.',
                    },
                  ].map((suggestion, i) => (
                    <motion.div
                      key={suggestion.title}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.3 + i * 0.1 }}
                      className="p-4 rounded-xl bg-white/60 border border-green-200"
                    >
                      <div className="text-sm font-semibold text-green-900 mb-1">{suggestion.title}</div>
                      <p className="text-xs text-green-700 leading-relaxed">{suggestion.tip}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Action buttons */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.5 }}
                className="flex flex-col sm:flex-row justify-center gap-3 mb-8"
              >
                <button
                  onClick={() => {
                    setPhase('setup')
                    setCurrentQuestion(0)
                    setFillerCount(0)
                    setTranscript([])
                    setFillerToasts([])
                  }}
                  className="px-6 py-3 rounded-lg border-2 border-green-800 text-green-800 bg-white hover:bg-green-50 font-medium transition-colors duration-200"
                >
                  Practice Again
                </button>
                <button className="px-6 py-3 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium transition-colors duration-200">
                  Download Full Report
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
