'use client'

import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import {
  Mic, BookOpen, FileText, BarChart3, Zap,
  MessageCircle, Award, Shield, Users, Bell
} from 'lucide-react'
import { staggerContainer, staggerItem } from '@/lib/animations'

const features = [
  {
    icon: Mic,
    title: 'AI Interview Simulation',
    description: 'Practice with a 3D AI interviewer that analyzes your voice, confidence, and body language in real-time.',
    color: '#3b82f6',
    span: 'md:col-span-2',
    hoverContent: 'waveform',
  },
  {
    icon: BookOpen,
    title: 'AI Video Courses',
    description: 'Netflix-style course catalog with AI avatar presenters and interactive quizzes.',
    color: '#8b5cf6',
    span: '',
    hoverContent: 'progress',
  },
  {
    icon: FileText,
    title: 'AI Resume Builder',
    description: 'Split-screen editor with live preview, AI writing assistant, and ATS score optimization.',
    color: '#06b6d4',
    span: '',
    hoverContent: 'typing',
  },
  {
    icon: BarChart3,
    title: 'Skill Assessment Engine',
    description: 'Animated radar charts, progress tracking, and AI-powered learning roadmaps.',
    color: '#10b981',
    span: '',
    hoverContent: 'chart',
  },
  {
    icon: Zap,
    title: 'Live Quiz Broadcasts',
    description: 'Game show arena with real-time leaderboards, streaks, and confetti celebrations.',
    color: '#f59e0b',
    span: 'md:col-span-2',
    hoverContent: 'countdown',
  },
  {
    icon: MessageCircle,
    title: 'AI Career Guidance',
    description: 'Futuristic AI chat with streaming responses, avatar coach, and personalized action plans.',
    color: '#ec4899',
    span: '',
    hoverContent: 'chat',
  },
  {
    icon: Award,
    title: 'Certifications',
    description: 'Trophy room with ceremony animations, QR verification, and badge showcase.',
    color: '#f97316',
    span: '',
    hoverContent: 'stamp',
  },
  {
    icon: Shield,
    title: 'Admin Analytics',
    description: 'Mission control with live heatmaps, geographic data, and conversion funnels.',
    color: '#6366f1',
    span: 'md:col-span-2',
    hoverContent: 'heatmap',
  },
  {
    icon: Users,
    title: 'Support & Mentorship',
    description: 'Instant chat support, FAQ search, mentor booking, and ticket tracking.',
    color: '#14b8a6',
    span: '',
    hoverContent: 'widget',
  },
  {
    icon: Bell,
    title: 'Smart Notifications',
    description: 'WhatsApp, email, and push alerts with animated toast notifications.',
    color: '#ef4444',
    span: '',
    hoverContent: 'bell',
  },
]

function FeatureCard({
  feature,
  index,
}: {
  feature: (typeof features)[0]
  index: number
}) {
  return (
    <motion.div
      variants={staggerItem}
      className={`group relative rounded-2xl p-6 cursor-pointer overflow-hidden ${feature.span}`}
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.06)',
      }}
      whileHover={{
        scale: 1.02,
        y: -4,
        boxShadow: `0 0 40px ${feature.color}20, 0 20px 60px rgba(0,0,0,0.3)`,
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      {/* Hover gradient border */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"
        style={{
          background: `linear-gradient(135deg, ${feature.color}15, transparent, ${feature.color}10)`,
        }}
      />
      <div
        className="absolute inset-[0] rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `linear-gradient(135deg, ${feature.color}30, transparent) padding-box, linear-gradient(135deg, ${feature.color}50, transparent) border-box`,
          border: '1px solid transparent',
          borderRadius: 'inherit',
          mask: 'linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
        }}
      />

      <div className="relative z-10">
        {/* Icon */}
        <motion.div
          className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
          style={{
            background: `${feature.color}15`,
            boxShadow: `0 0 0 ${feature.color}00`,
          }}
          whileHover={{
            boxShadow: `0 0 25px ${feature.color}40`,
          }}
        >
          <feature.icon size={24} style={{ color: feature.color }} />
        </motion.div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-transparent group-hover:bg-clip-text"
          style={{
            backgroundImage: `linear-gradient(135deg, white, ${feature.color})`,
          }}
        >
          {feature.title}
        </h3>

        {/* Description */}
        <p className="text-sm text-white/40 group-hover:text-white/60 transition-colors leading-relaxed">
          {feature.description}
        </p>

        {/* Hover micro-animation area */}
        <div className="mt-4 h-8 overflow-hidden">
          <motion.div
            className="flex items-center gap-2 text-xs font-medium"
            style={{ color: feature.color }}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <HoverAnimation type={feature.hoverContent} color={feature.color} />
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}

function HoverAnimation({ type, color }: { type: string; color: string }) {
  switch (type) {
    case 'waveform':
      return (
        <div className="flex items-end gap-[2px] h-5 opacity-0 group-hover:opacity-100 transition-opacity">
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              className="w-[3px] rounded-full"
              style={{ background: color }}
              animate={{
                height: [4, Math.random() * 16 + 4, 4],
              }}
              transition={{
                duration: 0.5 + Math.random() * 0.5,
                repeat: Infinity,
                delay: i * 0.05,
              }}
            />
          ))}
        </div>
      )
    case 'progress':
      return (
        <div className="w-full opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ background: color }}
              initial={{ width: '0%' }}
              whileInView={{ width: '75%' }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
            />
          </div>
        </div>
      )
    case 'typing':
      return (
        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
          <span className="text-white/40">AI writing</span>
          <motion.span
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            |
          </motion.span>
        </div>
      )
    case 'chart':
      return (
        <div className="flex items-end gap-1 h-5 opacity-0 group-hover:opacity-100 transition-opacity">
          {[40, 65, 50, 80, 70].map((h, i) => (
            <motion.div
              key={i}
              className="w-3 rounded-t"
              style={{ background: color }}
              initial={{ height: 0 }}
              whileInView={{ height: `${h}%` }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            />
          ))}
        </div>
      )
    case 'countdown':
      return (
        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
          <motion.span
            className="text-lg font-bold"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            3
          </motion.span>
          <span className="text-white/40">Live now</span>
        </div>
      )
    case 'chat':
      return (
        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
          <span className="text-white/40">AI thinking</span>
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: color }}
                animate={{ y: [0, -4, 0] }}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  delay: i * 0.15,
                }}
              />
            ))}
          </div>
        </div>
      )
    case 'stamp':
      return (
        <motion.div
          className="opacity-0 group-hover:opacity-100 transition-opacity"
          animate={{ rotate: [0, -5, 0] }}
          transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
        >
          <Award size={16} style={{ color }} />
        </motion.div>
      )
    case 'heatmap':
      return (
        <div className="grid grid-cols-7 gap-[2px] opacity-0 group-hover:opacity-100 transition-opacity">
          {Array.from({ length: 21 }).map((_, i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-[2px]"
              style={{ background: color }}
              initial={{ opacity: 0.1 }}
              animate={{ opacity: [0.1, 0.3 + Math.random() * 0.7, 0.1] }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.08,
              }}
            />
          ))}
        </div>
      )
    case 'widget':
      return (
        <motion.div
          className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1"
          animate={{ x: [10, 0] }}
          transition={{ duration: 0.3 }}
        >
          <div
            className="w-2 h-2 rounded-full animate-pulse"
            style={{ background: color }}
          />
          <span className="text-white/40">Online</span>
        </motion.div>
      )
    case 'bell':
      return (
        <motion.div
          className="opacity-0 group-hover:opacity-100 transition-opacity"
          animate={{ rotate: [0, 15, -15, 0] }}
          transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1.5 }}
        >
          <Bell size={16} style={{ color }} />
        </motion.div>
      )
    default:
      return null
  }
}

export default function FeatureGrid() {
  const [ref, inView] = useInView({ threshold: 0.1, triggerOnce: true })

  return (
    <section id="features" className="relative py-24 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="text-sm font-medium text-blue-400 tracking-widest uppercase mb-4 block">
            Platform Features
          </span>
          <h2 className="text-3xl md:text-5xl font-bold gradient-text mb-4">
            Everything You Need to Succeed
          </h2>
          <p className="text-white/40 max-w-2xl mx-auto text-lg">
            10 powerful AI-driven modules designed to transform your career readiness journey.
          </p>
        </motion.div>

        {/* Bento Grid */}
        <motion.div
          ref={ref}
          variants={staggerContainer}
          initial="initial"
          animate={inView ? 'animate' : 'initial'}
          className="grid grid-cols-1 md:grid-cols-4 gap-4"
        >
          {features.map((feature, index) => (
            <FeatureCard key={feature.title} feature={feature} index={index} />
          ))}
        </motion.div>
      </div>
    </section>
  )
}
