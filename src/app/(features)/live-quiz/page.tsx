'use client'

import { motion } from 'framer-motion'
import ParticleField from '@/components/animations/ParticleField'
import GlowingOrb from '@/components/animations/GlowingOrb'
import LiveQuizArena from '@/components/features/LiveQuizArena'

export default function LiveQuizPage() {
  return (
    <div className="min-h-screen bg-[#030014] relative overflow-hidden">
      <ParticleField particleCount={50} className="opacity-20" />
      <GlowingOrb size={350} color="rgba(245,158,11,0.06)" x="15%" y="25%" />
      <GlowingOrb size={300} color="rgba(239,68,68,0.06)" x="85%" y="75%" delay={2} />

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold gradient-text mb-2">Live Quiz Arena</h1>
          <p className="text-white/40">Compete in real-time with thousands of students</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <LiveQuizArena />
        </motion.div>
      </div>
    </div>
  )
}
