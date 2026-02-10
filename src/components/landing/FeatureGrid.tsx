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
    description: 'Practice with an AI interviewer that analyzes your voice, confidence, and clarity in real-time.',
  },
  {
    icon: BookOpen,
    title: 'AI Video Courses',
    description: 'Curated course catalog with AI-powered interactive quizzes and progress tracking.',
  },
  {
    icon: FileText,
    title: 'AI Resume Builder',
    description: 'Split-screen editor with live preview, AI writing assistant, and ATS score optimization.',
  },
  {
    icon: BarChart3,
    title: 'Skill Assessment Engine',
    description: 'Radar charts, progress tracking, and AI-powered personalized learning roadmaps.',
  },
  {
    icon: Zap,
    title: 'Live Quiz Broadcasts',
    description: 'Real-time quiz arena with leaderboards, streaks, and competitive scoring.',
  },
  {
    icon: MessageCircle,
    title: 'AI Career Guidance',
    description: 'AI chat coach with streaming responses, personalized action plans, and career mapping.',
  },
  {
    icon: Award,
    title: 'Certifications',
    description: 'Earn verifiable certificates with QR code verification and LinkedIn sharing.',
  },
  {
    icon: Shield,
    title: 'Admin Analytics',
    description: 'Dashboard with activity heatmaps, conversion funnels, and live metrics.',
  },
  {
    icon: Users,
    title: 'Support & Mentorship',
    description: 'Instant chat support, FAQ search, mentor booking, and ticket tracking.',
  },
  {
    icon: Bell,
    title: 'Smart Notifications',
    description: 'Multi-channel alerts via WhatsApp, email, and push notifications.',
  },
]

export default function FeatureGrid() {
  const [ref, inView] = useInView({ threshold: 0.1, triggerOnce: true })

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
            10 powerful AI-driven modules designed to transform your career readiness journey.
          </p>
        </motion.div>

        <motion.div
          ref={ref}
          variants={staggerContainer}
          initial="initial"
          animate={inView ? 'animate' : 'initial'}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={staggerItem}
              className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-md hover:-translate-y-1 transition-all duration-200"
            >
              <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center mb-4">
                <feature.icon size={20} className="text-blue-800" />
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
