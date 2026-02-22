'use client'

import { useState } from 'react'
import { FileText, Download, ChevronDown, ChevronUp, Loader2 } from 'lucide-react'
import TemplateSelector from './TemplateSelector'

interface ResumeData {
  personal_info?: {
    name?: string
    email?: string
    phone?: string
    location?: string
  }
  objective?: string
  education?: { degree?: string; institution?: string; year?: string }[]
  skills?: {
    technical?: string[]
    soft?: string[]
    languages?: string[]
    tools?: string[]
  }
}

interface ResumePreviewCardProps {
  resumeId: string
  resumeJson: string
  template: string
  onTemplateChange: (template: string) => void
}

export default function ResumePreviewCard({
  resumeId,
  resumeJson,
  template,
  onTemplateChange,
}: ResumePreviewCardProps) {
  const [expanded, setExpanded] = useState(true)
  const [downloading, setDownloading] = useState(false)

  let data: ResumeData = {}
  try {
    data = JSON.parse(resumeJson)
  } catch { /* ignore */ }

  const allSkills = [
    ...(data.skills?.technical || []),
    ...(data.skills?.soft || []),
    ...(data.skills?.tools || []),
  ].slice(0, 8)

  async function handleDownload() {
    setDownloading(true)
    try {
      const res = await fetch(`/api/resume/${resumeId}/download`)
      if (!res.ok) throw new Error('Download failed')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `resume-${template}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      // silent fail — user will see no file downloaded
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="mx-auto max-w-[85%] sm:max-w-[75%] rounded-xl border-2 border-green-800 bg-white overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-5 py-4 bg-green-50/40"
      >
        <div className="flex items-center gap-2">
          <FileText size={18} className="text-green-800" />
          <span className="text-sm font-semibold text-green-800">Resume Generated!</span>
        </div>
        {expanded ? (
          <ChevronUp size={16} className="text-green-800" />
        ) : (
          <ChevronDown size={16} className="text-green-800" />
        )}
      </button>

      {expanded && (
        <div className="p-5 space-y-5">
          {/* Mini preview */}
          {data.personal_info && (
            <div>
              <h3 className="text-base font-semibold text-gray-900">
                {data.personal_info.name}
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                {[data.personal_info.email, data.personal_info.phone, data.personal_info.location]
                  .filter(Boolean)
                  .join(' | ')}
              </p>
            </div>
          )}

          {data.objective && (
            <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">
              {data.objective}
            </p>
          )}

          {data.education && data.education.length > 0 && (
            <div>
              <h4 className="text-xs text-gray-400 uppercase tracking-wider mb-2">Education</h4>
              {data.education.slice(0, 2).map((edu, i) => (
                <p key={i} className="text-xs text-gray-700">
                  {edu.degree} — {edu.institution} {edu.year && `(${edu.year})`}
                </p>
              ))}
            </div>
          )}

          {allSkills.length > 0 && (
            <div>
              <h4 className="text-xs text-gray-400 uppercase tracking-wider mb-2">Skills</h4>
              <div className="flex flex-wrap gap-1.5">
                {allSkills.map((skill, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-green-50 text-green-800 border border-green-200"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Template selector */}
          <div>
            <h4 className="text-xs text-gray-400 uppercase tracking-wider mb-3">Choose Template</h4>
            <TemplateSelector
              resumeId={resumeId}
              currentTemplate={template}
              onTemplateChange={onTemplateChange}
            />
          </div>

          {/* Download button */}
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border-2 border-green-800 text-green-800 text-sm font-medium hover:bg-green-50 transition-colors disabled:opacity-50"
          >
            {downloading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Download size={14} />
            )}
            Download PDF Resume
          </button>
        </div>
      )}
    </div>
  )
}
