'use client'

import { motion } from 'framer-motion'
import LiveQuizArena from '@/components/features/LiveQuizArena'

export default function LiveQuizPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-2">Live Quiz Arena</h1>
          <p className="text-gray-500">Compete in real-time with thousands of students</p>
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
