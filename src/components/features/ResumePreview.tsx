'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { FileText, Download, Sparkles } from 'lucide-react'

interface ResumeSection {
  title: string
  content: string
}

const templates = [
  { id: 'modern', name: 'Modern', color: '#1E40AF' },
  { id: 'minimal', name: 'Minimal', color: '#374151' },
  { id: 'creative', name: 'Creative', color: '#166534' },
  { id: 'executive', name: 'Executive', color: '#92400E' },
]

const sampleSections: ResumeSection[] = [
  { title: 'Experience', content: 'Management Trainee at GlobalCorp\nLed cross-functional team of 8 for product launch' },
  { title: 'Education', content: 'B.Tech, IIT Delhi\nCGPA: 8.9/10 | 2021 - 2025' },
  { title: 'Skills', content: 'Communication, Leadership, Negotiation, Sales, Time Management, Public Speaking' },
  { title: 'Achievements', content: 'Best Speaker Award - Inter-college Debate Championship\nLed sales team to 140% quarterly target achievement' },
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
          <FileText size={20} className="text-blue-800" />
          <h3 className="font-semibold text-lg text-gray-900">Resume Editor</h3>
        </div>

        <div>
          <label className="text-xs text-gray-500 uppercase tracking-wider mb-2 block">Template</label>
          <div className="flex gap-2">
            {templates.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTemplate(t.id)}
                className={`px-3 py-1.5 rounded-lg text-sm transition-all duration-200 border ${
                  activeTemplate === t.id
                    ? 'text-blue-800 bg-blue-50 border-blue-200'
                    : 'text-gray-500 bg-white border-gray-200 hover:border-gray-300'
                }`}
              >
                {t.name}
              </button>
            ))}
          </div>
        </div>

        {sampleSections.map((section) => (
          <div key={section.title}>
            <label className="text-xs text-gray-500 uppercase tracking-wider mb-1.5 block">
              {section.title}
            </label>
            <textarea
              defaultValue={section.content}
              rows={3}
              className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200
                text-sm text-gray-700 placeholder:text-gray-400 resize-none
                focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500
                transition-all duration-200"
            />
          </div>
        ))}

        <button
          onClick={triggerAISuggestion}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-50
            border border-blue-200 text-blue-800 text-sm hover:bg-blue-100 transition-colors duration-200"
        >
          <Sparkles size={16} />
          Get AI Suggestions
        </button>

        {showSuggestion && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="p-4 rounded-xl bg-blue-50 border border-blue-100"
          >
            <div className="text-xs text-blue-800 mb-1 flex items-center gap-1">
              <Sparkles size={12} /> AI Suggestion
            </div>
            <p className="text-sm text-gray-600">
              {aiSuggestion}
              <motion.span
                animate={{ opacity: [1, 0, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="text-blue-800"
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
          <h3 className="font-semibold text-lg text-gray-900">Live Preview</h3>

          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12">
              <svg className="w-12 h-12 -rotate-90" viewBox="0 0 48 48">
                <circle cx="24" cy="24" r="20" fill="none" stroke="#E5E7EB" strokeWidth="3" />
                <motion.circle
                  cx="24" cy="24" r="20"
                  fill="none"
                  stroke={atsScore >= 80 ? '#166534' : atsScore >= 60 ? '#92400E' : '#991B1B'}
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 20}`}
                  animate={{ strokeDashoffset: 2 * Math.PI * 20 * (1 - atsScore / 100) }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-gray-900">
                {atsScore}
              </span>
            </div>
            <span className="text-xs text-gray-500">ATS Score</span>
          </div>
        </div>

        <div
          className="rounded-xl bg-white p-6 border border-gray-200 shadow-sm min-h-[500px]"
          style={{
            borderTop: `4px solid ${templates.find(t => t.id === activeTemplate)?.color || '#1E40AF'}`,
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
              <h3 className="text-sm font-bold uppercase tracking-wider mb-1"
                style={{ color: templates.find(t => t.id === activeTemplate)?.color }}>
                {section.title}
              </h3>
              <p className="text-xs text-gray-600 whitespace-pre-line leading-relaxed">
                {section.content}
              </p>
            </motion.div>
          ))}
        </div>

        <button
          className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg
            bg-blue-800 hover:bg-blue-900 text-white font-medium transition-colors duration-200"
        >
          <Download size={16} />
          Export as PDF
        </button>
      </div>
    </div>
  )
}
