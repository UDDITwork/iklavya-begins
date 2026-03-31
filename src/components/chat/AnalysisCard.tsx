'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BarChart3, Map, Download, ChevronDown, ChevronUp, Trophy, Zap, TrendingUp } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import CounselorAvatar from './CounselorAvatar'

interface AnalysisCardProps {
  sessionId: string
  analysisMarkdown?: string
  analysisJson?: string
  roadmapJson?: string
}

export default function AnalysisCard({
  sessionId,
  analysisMarkdown,
  analysisJson,
  roadmapJson,
}: AnalysisCardProps) {
  const [expanded, setExpanded] = useState(true)

  let careers: { title: string; match_score: number; reason: string }[] = []
  let roadmapSteps: { order: number; title: string; description: string; timeline: string }[] = []

  try {
    if (analysisJson) {
      const data = JSON.parse(analysisJson)
      careers = data.top_careers || []
    }
  } catch { /* ignore parse errors */ }

  try {
    if (roadmapJson) {
      const data = JSON.parse(roadmapJson)
      roadmapSteps = data.steps || []
    }
  } catch { /* ignore parse errors */ }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="mx-auto max-w-[92%] sm:max-w-[80%] rounded-2xl border-2 border-green-800 bg-white overflow-hidden shadow-lg"
    >
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-5 py-4 bg-gradient-to-r from-green-800 to-green-700"
      >
        <div className="flex items-center gap-3">
          <CounselorAvatar mood="celebrating" size={36} />
          <div className="text-left">
            <span className="text-sm font-bold text-white block">Career Analysis Complete!</span>
            <span className="text-[11px] text-green-200">Your personalised report is ready</span>
          </div>
        </div>
        {expanded
          ? <ChevronUp size={16} className="text-white/80" />
          : <ChevronDown size={16} className="text-white/80" />
        }
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="p-5 space-y-6">

              {/* Top Careers with visual match bars */}
              {careers.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Trophy size={14} className="text-green-800" />
                    <h3 className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Top Career Matches</h3>
                  </div>
                  <div className="space-y-3">
                    {careers.map((career, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -15 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.15 + i * 0.08 }}
                        className="p-3 rounded-xl bg-gray-50 border border-gray-100"
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <p className="text-sm font-semibold text-gray-900">{career.title}</p>
                          <span className="text-xs font-bold text-green-800 bg-green-50 border border-green-200 rounded-full px-2 py-0.5">
                            {career.match_score}%
                          </span>
                        </div>
                        {/* Animated match bar */}
                        <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden mb-2">
                          <motion.div
                            className="h-full rounded-full bg-gradient-to-r from-green-600 to-green-400"
                            initial={{ width: 0 }}
                            animate={{ width: `${career.match_score}%` }}
                            transition={{ duration: 0.8, delay: 0.3 + i * 0.1, ease: 'easeOut' }}
                          />
                        </div>
                        <p className="text-xs text-gray-500 leading-relaxed">{career.reason}</p>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Markdown analysis */}
              {analysisMarkdown && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="border-l-2 border-green-700 pl-4"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Zap size={13} className="text-green-700" />
                    <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Full Analysis</span>
                  </div>
                  <div className="prose prose-sm max-w-none prose-headings:text-gray-900 prose-headings:font-semibold prose-p:text-gray-600 prose-li:text-gray-600 prose-strong:text-gray-800">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {analysisMarkdown}
                    </ReactMarkdown>
                  </div>
                </motion.div>
              )}

              {/* Roadmap */}
              {roadmapSteps.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp size={14} className="text-green-800" />
                    <h3 className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Career Roadmap</h3>
                  </div>
                  <div className="relative">
                    {/* Vertical line */}
                    <div className="absolute left-3.5 top-4 bottom-4 w-0.5 bg-green-100" />
                    <div className="space-y-4">
                      {roadmapSteps.map((step, i) => (
                        <motion.div
                          key={step.order}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.45 + i * 0.07 }}
                          className="flex gap-3 relative"
                        >
                          <div className="w-7 h-7 rounded-full bg-green-800 text-white flex items-center justify-center text-xs font-bold shrink-0 z-10 shadow-sm">
                            {step.order}
                          </div>
                          <div className="bg-white border border-gray-100 rounded-xl p-3 flex-1 shadow-sm">
                            <p className="text-sm font-semibold text-gray-900">{step.title}</p>
                            <p className="text-[11px] text-green-700 font-medium mt-0.5">{step.timeline}</p>
                            <p className="text-xs text-gray-500 leading-relaxed mt-1">{step.description}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Download + View Report buttons */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="flex flex-wrap gap-3 pt-1"
              >
                <a
                  href={`/api/sessions/${sessionId}/report`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-green-800 text-white text-sm font-medium hover:bg-green-900 transition-colors shadow-sm"
                >
                  <Download size={14} />
                  Download PDF Report
                </a>
                <a
                  href={`/session/${sessionId}/report`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-green-800 text-green-800 text-sm font-medium hover:bg-green-50 transition-colors"
                >
                  <BarChart3 size={14} />
                  View Visual Report
                </a>
              </motion.div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
