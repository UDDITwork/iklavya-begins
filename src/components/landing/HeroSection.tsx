'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  Mic, BookOpen, FileText, BarChart3, Zap, TrendingUp, MessageSquare
} from 'lucide-react'
import SkillConstellationHero from '@/components/illustrations/scenes/SkillConstellationHero'
import FloatingShapes from '@/components/illustrations/decorative/FloatingShapes'

const features = [
  { icon: Mic, label: 'AI Interview' },
  { icon: BookOpen, label: 'Courses' },
  { icon: FileText, label: 'Resume' },
  { icon: BarChart3, label: 'Skills' },
  { icon: Zap, label: 'Quiz' },
]

/* ─── Floating UI Preview Cards ─── */

function ConfidenceCard() {
  return (
    <motion.div
      className="absolute top-6 right-0 w-52 bg-white rounded-xl border border-gray-200 shadow-lg p-4"
      initial={{ opacity: 0, y: 20, x: 10 }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      transition={{ delay: 0.6, duration: 0.5 }}
    >
      <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-2">Confidence Score</div>
      <div className="flex items-end gap-2 mb-3">
        <span className="text-3xl font-bold text-gray-900">78</span>
        <span className="text-xs text-green-600 font-medium pb-1 flex items-center gap-0.5">
          <TrendingUp size={10} /> +12
        </span>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-blue-600"
          initial={{ width: 0 }}
          animate={{ width: '78%' }}
          transition={{ delay: 1.2, duration: 1, ease: 'easeOut' }}
        />
      </div>
    </motion.div>
  )
}

function SkillBarsCard() {
  const skills = [
    { name: 'Communication', value: 82, color: '#1E40AF' },
    { name: 'Leadership', value: 68, color: '#166534' },
    { name: 'Negotiation', value: 45, color: '#92400E' },
  ]
  return (
    <motion.div
      className="absolute bottom-16 -left-4 w-56 bg-white rounded-xl border border-gray-200 shadow-lg p-4"
      initial={{ opacity: 0, y: 20, x: -10 }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      transition={{ delay: 0.8, duration: 0.5 }}
    >
      <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-3">Skill Proficiency</div>
      <div className="space-y-2.5">
        {skills.map((s, i) => (
          <div key={s.name}>
            <div className="flex justify-between text-[11px] mb-1">
              <span className="text-gray-600">{s.name}</span>
              <span className="text-gray-400">{s.value}%</span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ background: s.color }}
                initial={{ width: 0 }}
                animate={{ width: `${s.value}%` }}
                transition={{ delay: 1.4 + i * 0.15, duration: 0.8, ease: 'easeOut' }}
              />
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  )
}

function ChatPreviewCard() {
  return (
    <motion.div
      className="absolute top-1/2 -translate-y-1/2 left-8 w-48 bg-white rounded-xl border border-gray-200 shadow-lg p-3"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 1, duration: 0.5 }}
    >
      <div className="flex items-center gap-2 mb-2">
        <div className="w-5 h-5 rounded-full bg-blue-50 flex items-center justify-center">
          <MessageSquare size={10} className="text-blue-700" />
        </div>
        <span className="text-[10px] text-gray-400">AI Career Coach</span>
      </div>
      <div className="space-y-1.5">
        <div className="px-2.5 py-1.5 rounded-lg bg-gray-50 text-[10px] text-gray-600 leading-relaxed">
          Your communication score improved by 15% this week
        </div>
        <div className="flex justify-end">
          <div className="px-2.5 py-1.5 rounded-lg bg-blue-600 text-[10px] text-white">
            Show roadmap
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function WaveformCard() {
  return (
    <motion.div
      className="absolute bottom-4 right-8 w-44 bg-white rounded-xl border border-gray-200 shadow-lg p-3"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.2, duration: 0.5 }}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] text-gray-400">Voice Analysis</span>
        <motion.div
          className="w-2 h-2 rounded-full bg-green-500"
          animate={{ opacity: [1, 0.4, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      </div>
      <div className="flex items-end gap-[2px] h-6">
        {Array.from({ length: 18 }).map((_, i) => (
          <motion.div
            key={i}
            className="w-[3px] rounded-full bg-blue-300"
            animate={{ height: ['4px', `${6 + Math.random() * 16}px`, '4px'] }}
            transition={{
              duration: 0.7 + Math.random() * 0.4,
              repeat: Infinity,
              delay: i * 0.05,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>
    </motion.div>
  )
}

function HeroVisual() {
  return (
    <div className="relative w-full h-full">
      {/* Skill constellation illustration — background layer */}
      <div className="absolute inset-0 flex items-center justify-center opacity-25">
        <SkillConstellationHero className="w-[340px] h-[340px] lg:w-[400px] lg:h-[400px]" />
      </div>

      {/* Floating cards — foreground layer */}
      <ConfidenceCard />
      <SkillBarsCard />
      <ChatPreviewCard />
      <WaveformCard />
    </div>
  )
}

export default function HeroSection() {
  return (
    <section className="relative bg-white py-20 md:py-32 hero-mesh overflow-hidden">
      {/* Background floating shapes */}
      <FloatingShapes />

      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Text Column */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="mb-6"
            >
              <span className="inline-block px-3 py-1 rounded-full text-sm font-medium
                bg-blue-50 text-blue-800 border border-blue-100">
                AI-Powered Career Platform
              </span>
            </motion.div>

            <motion.h1
              className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-gray-900 mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              IKLAVYA
            </motion.h1>

            <motion.p
              className="text-lg md:text-xl text-gray-600 mb-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 }}
            >
              Student Career Readiness Portal
            </motion.p>

            <motion.p
              className="text-base text-gray-500 max-w-xl mb-10 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              AI-powered soft skill simulations, confidence scoring, communication
              courses, and career guidance — everything you need to launch your career.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.25 }}
              className="flex flex-col sm:flex-row gap-3"
            >
              <Link href="/ai-interview">
                <button className="px-6 py-3 rounded-lg bg-blue-800 hover:bg-blue-900 text-white font-medium transition-colors duration-200">
                  Explore Features
                </button>
              </Link>
              <Link href="/ai-courses">
                <button className="px-6 py-3 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium transition-colors duration-200">
                  Browse Courses
                </button>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.35 }}
              className="mt-10 flex flex-wrap gap-3"
            >
              {features.map((f) => (
                <div
                  key={f.label}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-50 border border-gray-100 text-sm text-gray-600"
                >
                  <f.icon size={16} className="text-blue-800" />
                  {f.label}
                </div>
              ))}
            </motion.div>
          </div>

          {/* Floating Product Preview — desktop only */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="hidden md:block h-[420px] lg:h-[460px] relative"
          >
            <HeroVisual />
          </motion.div>
        </div>
      </div>
    </section>
  )
}
