'use client'

import { motion } from 'framer-motion'
import { Download, Eye, Link2, Sparkles } from 'lucide-react'
import Image from 'next/image'
import ResumePreview from '@/components/features/ResumePreview'

export default function ResumeBuilderPage() {
  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Premium Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div className="flex items-center gap-3 sm:gap-6">
            <div className="hidden md:block w-48 h-40">
              <Image src="/man filling resume.png" alt="AI Resume Builder" width={200} height={160} className="object-contain w-full h-full" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">AI Resume Builder</h1>
              <p className="text-gray-500 text-sm">Build ATS-optimized resumes with AI assistance</p>
              <span className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full text-xs font-medium
                bg-green-50/40 text-green-800 border border-green-200">
                <Sparkles size={12} /> AI-Powered
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="hidden sm:flex items-center gap-1.5 px-4 sm:px-5 py-2.5 min-h-[44px] rounded-lg text-sm text-gray-600
              bg-white border border-gray-200 hover:bg-gray-50 hover:shadow-sm transition-all">
              <Eye size={16} /> Preview PDF
            </button>
            <button className="flex items-center gap-1.5 px-4 sm:px-5 py-2.5 min-h-[44px] rounded-lg text-sm font-medium text-green-800
              border-2 border-green-800 bg-white hover:bg-green-50 hover:shadow-md transition-all">
              <Download size={16} /> Download PDF
            </button>
            <button className="hidden sm:flex items-center gap-1.5 px-4 sm:px-5 py-2.5 min-h-[44px] rounded-lg text-sm text-gray-500
              hover:text-gray-700 hover:bg-gray-100 transition-all">
              <Link2 size={16} /> Share
            </button>
          </div>
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
