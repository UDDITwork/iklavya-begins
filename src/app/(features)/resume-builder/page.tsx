'use client'

import { motion } from 'framer-motion'
import ParticleField from '@/components/animations/ParticleField'
import GlowingOrb from '@/components/animations/GlowingOrb'
import ResumePreview from '@/components/features/ResumePreview'

export default function ResumeBuilderPage() {
  return (
    <div className="min-h-screen bg-[#030014] relative overflow-hidden">
      <ParticleField particleCount={40} className="opacity-20" />
      <GlowingOrb size={300} color="rgba(6,182,212,0.06)" x="15%" y="40%" />
      <GlowingOrb size={250} color="rgba(139,92,246,0.06)" x="85%" y="60%" delay={2} />

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold gradient-text mb-2">AI Resume Builder</h1>
          <p className="text-white/40">Build ATS-optimized resumes with AI assistance</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <ResumePreview />
        </motion.div>
      </div>
    </div>
  )
}
