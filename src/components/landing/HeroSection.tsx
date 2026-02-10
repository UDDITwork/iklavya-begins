'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  Mic, BookOpen, FileText, BarChart3, Zap,
  MessageCircle, Award, Shield, Users, Bell
} from 'lucide-react'

const features = [
  { icon: Mic, label: 'AI Interview' },
  { icon: BookOpen, label: 'Courses' },
  { icon: FileText, label: 'Resume' },
  { icon: BarChart3, label: 'Skills' },
  { icon: Zap, label: 'Quiz' },
]

export default function HeroSection() {
  return (
    <section className="relative bg-white py-20 md:py-32">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="max-w-3xl">
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
            className="text-4xl md:text-6xl font-semibold tracking-tight text-gray-900 mb-4"
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
            AI-powered interviews, personalized courses, smart resume building,
            and career guidance — everything you need to launch your career.
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
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.35 }}
          className="mt-16 flex flex-wrap gap-3"
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
    </section>
  )
}
