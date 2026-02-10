'use client'

import { motion, useMotionValue, useTransform, animate } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { useEffect, useRef, useCallback, useState } from 'react'

/* ─── Spotlight Card Wrapper ─── */
function SpotlightCard({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  const cardRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = cardRef.current?.getBoundingClientRect()
    if (!rect) return
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    cardRef.current?.style.setProperty('--mouse-x', `${x}px`)
    cardRef.current?.style.setProperty('--mouse-y', `${y}px`)
  }, [])

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      className={`spotlight-card gradient-border-hover bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ${className}`}
    >
      {children}
    </div>
  )
}

/* ─── Mini Demos ─── */

function WaveformDemo() {
  return (
    <div className="flex items-end gap-[3px] h-10 mt-3">
      {Array.from({ length: 14 }).map((_, i) => (
        <motion.div
          key={i}
          className="w-[3px] rounded-full bg-blue-400"
          animate={{ height: ['8px', `${12 + Math.random() * 24}px`, '8px'] }}
          transition={{
            duration: 0.8 + Math.random() * 0.4,
            repeat: Infinity,
            delay: i * 0.07,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}

function ProgressRingDemo() {
  const [ref, inView] = useInView({ threshold: 0.5, triggerOnce: true })
  const progress = useMotionValue(0)
  const display = useTransform(progress, (v) => `${Math.round(v)}%`)
  const strokeDash = useTransform(progress, (v) => `${(v / 100) * 157} 157`)

  useEffect(() => {
    if (inView) animate(progress, 78, { duration: 1.8, ease: 'easeOut' })
  }, [inView, progress])

  return (
    <div ref={ref} className="flex items-center justify-center mt-3">
      <svg width="64" height="64" viewBox="0 0 60 60">
        <circle cx="30" cy="30" r="25" fill="none" stroke="#E5E7EB" strokeWidth="4" />
        <motion.circle
          cx="30" cy="30" r="25" fill="none" stroke="#1E40AF" strokeWidth="4"
          strokeLinecap="round" strokeDasharray="0 157"
          style={{ strokeDasharray: strokeDash }}
          transform="rotate(-90 30 30)"
        />
        <motion.text x="30" y="33" textAnchor="middle" className="text-[11px] font-semibold fill-gray-700">
          {display}
        </motion.text>
      </svg>
    </div>
  )
}

function ResumeDemo() {
  return (
    <div className="mt-3 space-y-1.5">
      {[85, 60, 45, 70].map((w, i) => (
        <motion.div
          key={i}
          className="h-[5px] rounded-full bg-gray-200"
          initial={{ width: 0 }}
          animate={{ width: `${w}%` }}
          transition={{ duration: 0.6, delay: 0.8 + i * 0.2, ease: 'easeOut' }}
        >
          <motion.div className="h-full rounded-full bg-blue-200" style={{ width: '100%' }} />
        </motion.div>
      ))}
      <motion.div
        className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-50 border border-green-200 text-[9px] font-semibold text-green-700"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 2, duration: 0.3 }}
      >
        ATS: 92
      </motion.div>
    </div>
  )
}

function RadarDemo() {
  const [ref, inView] = useInView({ threshold: 0.5, triggerOnce: true })
  const points = [
    [30, 6], [54, 18], [54, 42], [30, 54], [6, 42], [6, 18],
  ] as const
  const values = [0.8, 0.6, 0.7, 0.45, 0.9, 0.55]

  const dataPoints = values.map((v, i) => {
    const cx = 30, cy = 30
    const px = points[i][0], py = points[i][1]
    return [cx + (px - cx) * v, cy + (py - cy) * v]
  })
  const pathD = dataPoints.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0]},${p[1]}`).join(' ') + ' Z'

  return (
    <div ref={ref} className="flex items-center justify-center mt-3">
      <svg width="64" height="64" viewBox="0 0 60 60">
        <polygon
          points={points.map((p) => p.join(',')).join(' ')}
          fill="none" stroke="#E5E7EB" strokeWidth="1"
        />
        <polygon
          points={points.map((p, i) => {
            const cx = 30, cy = 30
            return `${cx + (p[0] - cx) * 0.5},${cy + (p[1] - cy) * 0.5}`
          }).join(' ')}
          fill="none" stroke="#E5E7EB" strokeWidth="0.5"
        />
        <motion.path
          d={pathD}
          fill="rgba(30,64,175,0.1)" stroke="#1E40AF" strokeWidth="1.5"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8 }}
        />
      </svg>
    </div>
  )
}

function QuizDemo() {
  const [active, setActive] = useState(0)
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setActive((prev) => {
        if (prev < 2) { setChecked(false); return prev + 1 }
        setChecked(true)
        return prev
      })
    }, 700)
    const reset = setInterval(() => { setActive(0); setChecked(false) }, 4000)
    return () => { clearInterval(interval); clearInterval(reset) }
  }, [])

  return (
    <div className="mt-3 space-y-1.5">
      {['A', 'B', 'C'].map((opt, i) => (
        <motion.div
          key={opt}
          className={`h-6 rounded-md flex items-center px-2 text-[10px] font-medium border transition-all duration-200 ${
            i === active
              ? i === 1 && checked
                ? 'bg-green-50 border-green-300 text-green-700'
                : 'bg-blue-50 border-blue-200 text-blue-700'
              : 'bg-gray-50 border-gray-200 text-gray-400'
          }`}
          animate={i === active ? { scale: [1, 1.02, 1] } : {}}
          transition={{ duration: 0.3 }}
        >
          {opt}. Option {i + 1} {i === 1 && checked && '✓'}
        </motion.div>
      ))}
    </div>
  )
}

function ChatDemo() {
  const [showReply, setShowReply] = useState(false)

  useEffect(() => {
    const t1 = setTimeout(() => setShowReply(true), 1500)
    const t2 = setTimeout(() => setShowReply(false), 5000)
    const interval = setInterval(() => {
      setShowReply(false)
      setTimeout(() => setShowReply(true), 1500)
    }, 6000)
    return () => { clearTimeout(t1); clearTimeout(t2); clearInterval(interval) }
  }, [])

  return (
    <div className="mt-3 space-y-1.5">
      <div className="flex justify-end">
        <div className="px-2 py-1 rounded-lg bg-blue-100 text-[9px] text-blue-800">
          Career advice?
        </div>
      </div>
      {showReply ? (
        <motion.div
          className="px-2 py-1 rounded-lg bg-gray-100 text-[9px] text-gray-600 max-w-[80%]"
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Focus on DSA + system design for top roles
        </motion.div>
      ) : (
        <div className="flex gap-1 px-2 py-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-gray-300"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function CertDemo() {
  const [ref, inView] = useInView({ threshold: 0.5, triggerOnce: true })
  return (
    <div ref={ref} className="flex items-center justify-center mt-3">
      <svg width="64" height="48" viewBox="0 0 64 48">
        <motion.rect
          x="2" y="2" width="60" height="44" rx="4" fill="none" stroke="#D1D5DB" strokeWidth="1.5"
          strokeDasharray="208"
          initial={{ strokeDashoffset: 208 }}
          animate={inView ? { strokeDashoffset: 0 } : {}}
          transition={{ duration: 1.5, ease: 'easeInOut' }}
        />
        <motion.path
          d="M22 24 L28 30 L42 18"
          fill="none" stroke="#166534" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={inView ? { pathLength: 1, opacity: 1 } : {}}
          transition={{ delay: 1.5, duration: 0.5 }}
        />
      </svg>
    </div>
  )
}

function BarChartDemo() {
  const [ref, inView] = useInView({ threshold: 0.5, triggerOnce: true })
  const heights = [60, 40, 80, 55, 70]
  return (
    <div ref={ref} className="flex items-end gap-1.5 h-12 mt-3 justify-center">
      {heights.map((h, i) => (
        <motion.div
          key={i}
          className="w-3 rounded-t-sm bg-blue-300"
          initial={{ height: 0 }}
          animate={inView ? { height: `${h}%` } : {}}
          transition={{ duration: 0.6, delay: 0.2 + i * 0.12, ease: 'easeOut' }}
        />
      ))}
    </div>
  )
}

function CalendarDemo() {
  const [booked, setBooked] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setBooked(true), 1800)
    const reset = setInterval(() => {
      setBooked(false)
      setTimeout(() => setBooked(true), 1800)
    }, 5000)
    return () => { clearTimeout(t); clearInterval(reset) }
  }, [])

  return (
    <div className="mt-3 flex items-center gap-2">
      <svg width="28" height="28" viewBox="0 0 28 28">
        <rect x="2" y="4" width="24" height="22" rx="3" fill="none" stroke="#D1D5DB" strokeWidth="1.5" />
        <line x1="2" y1="10" x2="26" y2="10" stroke="#E5E7EB" strokeWidth="1" />
        <motion.line
          x1="14" y1="14" x2="14" y2="20"
          stroke="#1E40AF" strokeWidth="1.5" strokeLinecap="round"
          style={{ transformOrigin: '14px 14px' }}
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        />
        <circle cx="14" cy="14" r="1" fill="#1E40AF" />
      </svg>
      {booked && (
        <motion.span
          className="text-[9px] font-semibold px-2 py-0.5 rounded-full bg-green-50 border border-green-200 text-green-700"
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
        >
          Booked
        </motion.span>
      )}
    </div>
  )
}

function NotifDemo() {
  return (
    <div className="mt-3 space-y-1">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="h-5 rounded-md bg-gray-50 border border-gray-200 px-2 flex items-center text-[8px] text-gray-500"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 + i * 0.3, duration: 0.4 }}
        >
          {['New course available', 'Interview in 2hrs', 'Quiz starts soon'][i]}
        </motion.div>
      ))}
    </div>
  )
}

/* ─── Feature Data ─── */

const features = [
  {
    title: 'AI Interview Simulation',
    description: 'Role-play as job candidate, salesperson, or negotiator. AI analyzes speech patterns, confidence, and persuasiveness in real-time.',
    demo: WaveformDemo,
    span: 'md:col-span-2',
  },
  {
    title: 'Soft Skill Courses',
    description: 'Communication, Sales, Leadership, Time Management — AI-powered courses with interactive simulations.',
    demo: ProgressRingDemo,
    span: '',
  },
  {
    title: 'AI Resume Builder',
    description: 'Split-screen editor with live preview and ATS score optimization.',
    demo: ResumeDemo,
    span: '',
  },
  {
    title: 'Skill Assessment',
    description: 'Proficiency levels from Beginner to Skilled with visual bars. Tracks communication, confidence, and leadership.',
    demo: RadarDemo,
    span: '',
  },
  {
    title: 'Live Quiz Broadcasts',
    description: 'Real-time soft skill quizzes with leaderboards, streaks, and competitive scoring.',
    demo: QuizDemo,
    span: 'md:col-span-2',
  },
  {
    title: 'AI Career Guidance',
    description: 'Chat coach with personalized roadmaps for Sales, HR, Consulting, and Management roles.',
    demo: ChatDemo,
    span: '',
  },
  {
    title: 'Certifications',
    description: 'Earn verifiable certificates with QR verification.',
    demo: CertDemo,
    span: '',
  },
  {
    title: 'Admin Analytics',
    description: 'Dashboard with heatmaps, funnels, and live metrics.',
    demo: BarChartDemo,
    span: '',
  },
  {
    title: 'Support & Mentorship',
    description: 'Book sessions with communication coaches and leadership mentors.',
    demo: CalendarDemo,
    span: '',
  },
  {
    title: 'Smart Notifications',
    description: 'Multi-channel alerts via WhatsApp, email, and push.',
    demo: NotifDemo,
    span: '',
  },
]

/* ─── Main Grid ─── */

export default function FeatureGrid() {
  const [ref, inView] = useInView({ threshold: 0.05, triggerOnce: true })

  return (
    <section id="features" className="relative py-20 md:py-24 px-4 sm:px-6 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
        >
          <span className="text-sm font-medium text-blue-800 tracking-widest uppercase mb-4 block">
            Platform Features
          </span>
          <h2 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-4">
            Everything You Need to Succeed
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto text-base leading-relaxed">
            10 AI-driven modules evaluating soft skills through interactive simulations, role-play, and visual reports.
          </p>
        </motion.div>

        <div
          ref={ref}
          className="grid grid-cols-1 md:grid-cols-3 gap-5"
        >
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              className={feature.span}
            >
              <SpotlightCard className="h-full">
                <h3 className="text-base font-semibold text-gray-900 mb-1">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {feature.description}
                </p>
                <feature.demo />
              </SpotlightCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
