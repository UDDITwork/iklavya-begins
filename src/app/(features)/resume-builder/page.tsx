'use client'

import { motion } from 'framer-motion'
import ResumePreview from '@/components/features/ResumePreview'

export default function ResumeBuilderPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-2">AI Resume Builder</h1>
          <p className="text-gray-500">Build ATS-optimized resumes with AI assistance</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <ResumePreview />
        </motion.div>
      </div>
    </div>
  )
}
