'use client'

import { useState } from 'react'
import { BarChart3, Map, Download, ChevronDown, ChevronUp } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

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
    <div className="mx-auto max-w-[85%] sm:max-w-[75%] rounded-xl border-2 border-green-800 bg-white overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-5 py-4 bg-green-50/40"
      >
        <div className="flex items-center gap-2">
          <BarChart3 size={18} className="text-green-800" />
          <span className="text-sm font-semibold text-green-800">Career Analysis Complete</span>
        </div>
        {expanded ? <ChevronUp size={16} className="text-green-800" /> : <ChevronDown size={16} className="text-green-800" />}
      </button>

      {expanded && (
        <div className="p-5 space-y-6">
          {/* Top Careers */}
          {careers.length > 0 && (
            <div>
              <h3 className="text-xs text-gray-400 uppercase tracking-wider mb-3">Top Career Matches</h3>
              <div className="space-y-3">
                {careers.map((career, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100">
                    <div className="w-10 h-10 rounded-lg bg-green-50 border border-green-200 flex items-center justify-center text-green-800 text-xs font-bold shrink-0">
                      {career.match_score}%
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{career.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{career.reason}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Markdown analysis */}
          {analysisMarkdown && (
            <div className="border-l-2 border-green-800 pl-4">
              <div className="prose prose-sm max-w-none prose-headings:text-gray-900 prose-p:text-gray-600 prose-li:text-gray-600">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {analysisMarkdown}
                </ReactMarkdown>
              </div>
            </div>
          )}

          {/* Roadmap */}
          {roadmapSteps.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Map size={14} className="text-green-800" />
                <h3 className="text-xs text-gray-400 uppercase tracking-wider">Career Roadmap</h3>
              </div>
              <div className="space-y-3">
                {roadmapSteps.map((step) => (
                  <div key={step.order} className="flex gap-3">
                    <div className="w-7 h-7 rounded-full bg-green-800 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                      {step.order}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{step.title}</p>
                      <p className="text-xs text-gray-400 mb-0.5">{step.timeline}</p>
                      <p className="text-xs text-gray-500 leading-relaxed">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Download button */}
          <a
            href={`/api/sessions/${sessionId}/report`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border-2 border-green-800 text-green-800 text-sm font-medium hover:bg-green-50 transition-colors"
          >
            <Download size={14} />
            Download PDF Report
          </a>
        </div>
      )}
    </div>
  )
}
