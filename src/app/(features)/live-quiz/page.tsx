'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import LiveQuizArena from '@/components/features/LiveQuizArena'
import QuizTrophySpot from '@/components/illustrations/spots/QuizTrophySpot'

export default function LiveQuizPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-6">
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-2">Live Quiz Arena</h1>
              <p className="text-gray-500">Compete in real-time with thousands of students</p>
            </div>
            <div className="hidden md:block w-48 h-40">
              <Image src="/gamifed quiz competition.png" alt="Live Quiz Arena" width={200} height={160} className="object-contain w-full h-full" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <LiveQuizArena />
        </motion.div>
      </div>
    </div>
  )
}
