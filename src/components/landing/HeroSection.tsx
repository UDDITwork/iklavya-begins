'use client'

import { motion } from 'framer-motion'
import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import {
  Mic, FileText, Award, BarChart3, Zap, MessageCircle,
  BookOpen, Shield, Bell, Users
} from 'lucide-react'
import TextReveal from '@/components/animations/TextReveal'
import MagneticButton from '@/components/animations/MagneticButton'
import ParticleField from '@/components/animations/ParticleField'
import GlowingOrb from '@/components/animations/GlowingOrb'

const HeroScene = dynamic(() => import('@/components/animations/HeroScene'), {
  ssr: false,
})

const orbitIcons = [
  { icon: Mic, label: 'AI Interview', color: '#3b82f6' },
  { icon: BookOpen, label: 'Courses', color: '#8b5cf6' },
  { icon: FileText, label: 'Resume', color: '#06b6d4' },
  { icon: BarChart3, label: 'Skills', color: '#10b981' },
  { icon: Zap, label: 'Live Quiz', color: '#f59e0b' },
  { icon: MessageCircle, label: 'Career AI', color: '#ec4899' },
  { icon: Award, label: 'Certifications', color: '#f97316' },
  { icon: Shield, label: 'Admin', color: '#6366f1' },
  { icon: Users, label: 'Mentorship', color: '#14b8a6' },
  { icon: Bell, label: 'Alerts', color: '#ef4444' },
]

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background layers */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#030014] via-[#0a0025] to-[#030014]" />
      <GlowingOrb size={500} color="rgba(59, 130, 246, 0.1)" x="20%" y="30%" />
      <GlowingOrb size={400} color="rgba(139, 92, 246, 0.1)" x="80%" y="60%" delay={2} />
      <GlowingOrb size={350} color="rgba(236, 72, 153, 0.08)" x="50%" y="80%" delay={4} />
      <ParticleField particleCount={150} connectionDistance={120} />

      {/* 3D Scene */}
      <div className="absolute inset-0 opacity-60">
        <Suspense fallback={null}>
          <HeroScene />
        </Suspense>
      </div>

      {/* Orbiting Icons */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="relative w-[500px] h-[500px] md:w-[600px] md:h-[600px]">
          {orbitIcons.map((item, index) => {
            const angle = (index / orbitIcons.length) * Math.PI * 2
            const radius = 240
            return (
              <motion.div
                key={item.label}
                className="absolute"
                style={{
                  left: '50%',
                  top: '50%',
                }}
                animate={{
                  x: [
                    Math.cos(angle) * radius,
                    Math.cos(angle + Math.PI * 2) * radius,
                  ],
                  y: [
                    Math.sin(angle) * radius,
                    Math.sin(angle + Math.PI * 2) * radius,
                  ],
                }}
                transition={{
                  duration: 25 + index * 3,
                  repeat: Infinity,
                  ease: 'linear',
                }}
              >
                <motion.div
                  className="flex flex-col items-center gap-1"
                  whileHover={{ scale: 1.3 }}
                  style={{ transform: 'translate(-50%, -50%)' }}
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center backdrop-blur-md border border-white/10"
                    style={{
                      background: `${item.color}20`,
                      boxShadow: `0 0 20px ${item.color}30`,
                    }}
                  >
                    <item.icon size={22} style={{ color: item.color }} />
                  </div>
                  <span className="text-[10px] text-white/50 font-medium whitespace-nowrap">
                    {item.label}
                  </span>
                </motion.div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-6"
        >
          <span className="inline-block px-4 py-1.5 rounded-full text-sm font-medium
            bg-gradient-to-r from-blue-500/10 to-purple-500/10
            border border-blue-500/20 text-blue-300">
            AI-Powered Career Platform
          </span>
        </motion.div>

        <TextReveal
          text="IKLAVYA"
          as="h1"
          className="text-6xl md:text-8xl font-bold tracking-tight gradient-text mb-4"
          delay={0.3}
        />

        <motion.p
          className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          Student Career Readiness Portal
        </motion.p>

        <motion.p
          className="text-base md:text-lg text-white/40 max-w-xl mx-auto mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1 }}
        >
          AI-powered interviews, personalized courses, smart resume building,
          and career guidance — everything you need to launch your career.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <MagneticButton href="#features">
            Explore Features
          </MagneticButton>
          <MagneticButton
            className="!bg-transparent border border-white/20 hover:border-white/40
              hover:!shadow-[0_0_20px_rgba(255,255,255,0.1)]"
          >
            Watch Demo
          </MagneticButton>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 cursor-pointer"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        onClick={() => {
          document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })
        }}
      >
        <span className="text-xs text-white/30 tracking-widest uppercase">Scroll</span>
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          className="text-white/30"
        >
          <path
            d="M10 4L10 16M10 16L4 10M10 16L16 10"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </motion.div>
    </section>
  )
}
