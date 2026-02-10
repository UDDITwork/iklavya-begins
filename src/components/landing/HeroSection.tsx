'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { lazy, Suspense } from 'react'
import {
  Mic, BookOpen, FileText, BarChart3, Zap,
} from 'lucide-react'

const HeroMesh = lazy(() => import('@/components/three/HeroMesh'))

const features = [
  { icon: Mic, label: 'AI Interview' },
  { icon: BookOpen, label: 'Courses' },
  { icon: FileText, label: 'Resume' },
  { icon: BarChart3, label: 'Skills' },
  { icon: Zap, label: 'Quiz' },
]

function MeshFallback() {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-48 h-48 rounded-full bg-gradient-to-br from-blue-100 to-indigo-50 animate-pulse" />
    </div>
  )
}

export default function HeroSection() {
  return (
    <section className="relative bg-white py-20 md:py-32 hero-mesh">
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

          {/* 3D Element Column — desktop only */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="hidden md:block h-[400px] lg:h-[450px] relative"
          >
            <Suspense fallback={<MeshFallback />}>
              <HeroMesh />
            </Suspense>
          </motion.div>

          {/* Mobile decorative element */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="md:hidden flex justify-center py-4"
          >
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 opacity-60" />
          </motion.div>
        </div>
      </div>
    </section>
  )
}
