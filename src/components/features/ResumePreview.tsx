'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { FileText, Download, Sparkles, Check } from 'lucide-react'

interface ResumeSection {
  title: string
  content: string
}

const templates = [
  { id: 'modern', name: 'Modern', color: '#3b82f6' },
  { id: 'minimal', name: 'Minimal', color: '#8b5cf6' },
  { id: 'creative', name: 'Creative', color: '#ec4899' },
  { id: 'executive', name: 'Executive', color: '#f59e0b' },
]

const sampleSections: ResumeSection[] = [
  { title: 'Experience', content: 'Software Engineer Intern at TechCorp\nDeveloped REST APIs serving 10K+ requests/day' },
  { title: 'Education', content: 'B.Tech Computer Science, IIT Delhi\nCGPA: 8.9/10 | 2021 - 2025' },
  { title: 'Skills', content: 'Python, JavaScript, React, Node.js, SQL, Docker, AWS' },
  { title: 'Projects', content: 'AI Chat Application - Built with Next.js & OpenAI API\nE-commerce Platform - Full stack with payment integration' },
]

export default function ResumePreview() {
  const [activeTemplate, setActiveTemplate] = useState('modern')
  const [atsScore, setAtsScore] = useState(78)
  const [aiSuggestion, setAiSuggestion] = useState('')
  const [showSuggestion, setShowSuggestion] = useState(false)

  const triggerAISuggestion = () => {
    setShowSuggestion(true)
    setAiSuggestion('')
    const suggestion = 'Consider adding quantifiable metrics to your experience bullets. For example: "Improved API response time by 40%"'
    let i = 0
    const interval = setInterval(() => {
      if (i < suggestion.length) {
        setAiSuggestion(suggestion.slice(0, i + 1))
        i++
      } else {
        clearInterval(interval)
        setAtsScore(85)
      }
    }, 30)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[600px]">
      {/* Left: Editor */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <FileText size={20} className="text-purple-400" />
          <h3 className="font-semibold text-lg">Resume Editor</h3>
        </div>

        {/* Template Selector */}
        <div>
          <label className="text-xs text-white/40 uppercase tracking-wider mb-2 block">Template</label>
          <div className="flex gap-2">
            {templates.map((t) => (
              <motion.button
                key={t.id}
                onClick={() => setActiveTemplate(t.id)}
                className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                  activeTemplate === t.id
                    ? 'text-white'
                    : 'text-white/40 hover:text-white/60'
                }`}
                style={{
                  background: activeTemplate === t.id ? `${t.color}20` : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${activeTemplate === t.id ? `${t.color}50` : 'rgba(255,255,255,0.05)'}`,
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {t.name}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Form Fields */}
        {sampleSections.map((section) => (
          <div key={section.title}>
            <label className="text-xs text-white/40 uppercase tracking-wider mb-1.5 block">
              {section.title}
            </label>
            <textarea
              defaultValue={section.content}
              rows={3}
              className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10
                text-sm text-white/80 placeholder:text-white/20 resize-none
                focus:outline-none focus:border-purple-500/50 focus:scale-[1.01]
                transition-all duration-300"
            />
          </div>
        ))}

        {/* AI Suggestion */}
        <motion.button
          onClick={triggerAISuggestion}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-500/10
            border border-purple-500/20 text-purple-400 text-sm hover:bg-purple-500/15 transition-colors"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Sparkles size={16} />
          Get AI Suggestions
        </motion.button>

        {showSuggestion && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10"
          >
            <div className="text-xs text-blue-400 mb-1 flex items-center gap-1">
              <Sparkles size={12} /> AI Suggestion
            </div>
            <p className="text-sm text-white/60">
              {aiSuggestion}
              <motion.span
                animate={{ opacity: [1, 0, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                |
              </motion.span>
            </p>
          </motion.div>
        )}
      </div>

      {/* Right: Preview */}
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg">Live Preview</h3>

          {/* ATS Score */}
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12">
              <svg className="w-12 h-12 -rotate-90" viewBox="0 0 48 48">
                <circle cx="24" cy="24" r="20" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
                <motion.circle
                  cx="24" cy="24" r="20"
                  fill="none"
                  stroke={atsScore >= 80 ? '#10b981' : atsScore >= 60 ? '#f59e0b' : '#ef4444'}
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 20}`}
                  animate={{ strokeDashoffset: 2 * Math.PI * 20 * (1 - atsScore / 100) }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-xs font-bold">
                {atsScore}
              </span>
            </div>
            <span className="text-xs text-white/40">ATS Score</span>
          </div>
        </div>

        {/* Resume Preview Card */}
        <motion.div
          className="rounded-xl bg-white p-6 text-gray-900 shadow-2xl min-h-[500px]"
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          style={{
            borderTop: `4px solid ${templates.find(t => t.id === activeTemplate)?.color || '#3b82f6'}`,
          }}
        >
          <div className="mb-4 pb-3 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Arjun Mehta</h2>
            <p className="text-sm text-gray-500">arjun.mehta@email.com | +91 98765 43210 | Delhi, India</p>
          </div>

          {sampleSections.map((section, i) => (
            <motion.div
              key={section.title}
              className="mb-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.1 }}
            >
              <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-1"
                style={{ color: templates.find(t => t.id === activeTemplate)?.color }}>
                {section.title}
              </h3>
              <p className="text-xs text-gray-600 whitespace-pre-line leading-relaxed">
                {section.content}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Export */}
        <motion.button
          className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl
            bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium
            hover:shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-shadow"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Download size={16} />
          Export as PDF
        </motion.button>
      </div>
    </div>
  )
}
