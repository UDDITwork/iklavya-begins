'use client'

import Link from 'next/link'
import { Clock, FileText, ArrowRight } from 'lucide-react'
import ResumePreview from '@/components/resume-editor/ResumePreview'

interface ResumeSession {
  id: string
  title: string
  started_at: string
  status: string
  message_count: number
  template: string
  resume_data?: Record<string, unknown> | null
}

export default function ResumeCard({ session }: { session: ResumeSession }) {
  const isActive = session.status === 'active'
  const date = new Date(session.started_at).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const previewData = session.resume_data as any
  const hasPreview = !isActive && previewData && previewData.personal_info

  return (
    <Link href={`/resume-session/${session.id}`}>
      <div className="rounded-xl bg-white border border-gray-200 overflow-hidden hover:border-green-300 hover:shadow-md transition-all duration-200 cursor-pointer group">
        {/* Preview Thumbnail */}
        <div className="relative h-52 overflow-hidden bg-white border-b border-gray-100">
          {hasPreview ? (
            <div className="absolute inset-0 overflow-hidden">
              <div
                className="origin-top-left pointer-events-none"
                style={{
                  transform: 'scale(0.32)',
                  transformOrigin: 'top center',
                  width: '794px',
                  position: 'relative',
                  left: '50%',
                  marginLeft: '-397px',
                }}
              >
                <ResumePreview
                  data={previewData}
                  template={session.template || 'professional'}
                />
              </div>
            </div>
          ) : isActive ? (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50">
              <div className="text-center">
                <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center mx-auto mb-2">
                  <FileText size={22} className="text-amber-600" />
                </div>
                <p className="text-xs font-medium text-amber-700">In Progress</p>
                <p className="text-[10px] text-amber-500 mt-0.5">{session.message_count} messages</p>
              </div>
            </div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <FileText size={28} className="text-gray-200 mx-auto mb-2" />
                <p className="text-[10px] text-gray-300">No preview</p>
              </div>
            </div>
          )}

          {/* Fade at bottom */}
          {hasPreview && (
            <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-white to-transparent" />
          )}

          {/* Status badge */}
          {!isActive && hasPreview && (
            <div className="absolute top-2 right-2">
              <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full bg-green-600 text-white shadow-sm">
                Ready
              </span>
            </div>
          )}

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-green-800/0 group-hover:bg-green-800/5 transition-colors flex items-center justify-center">
            <span className="opacity-0 group-hover:opacity-100 transition-opacity text-sm font-medium text-green-800 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-sm">
              {isActive ? 'Continue Building' : 'View Resume'}
            </span>
          </div>
        </div>

        {/* Card Footer */}
        <div className="p-3.5">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm font-semibold text-gray-900 truncate">{session.title}</h3>
            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0 ml-2 ${
              isActive ? 'bg-amber-50 text-amber-600' : 'bg-green-50 text-green-600'
            }`}>
              {isActive ? 'Building' : 'Completed'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-[11px] text-gray-400">
              <span className="flex items-center gap-1"><Clock size={10} /> {date}</span>
              <span className="flex items-center gap-1"><FileText size={10} /> {session.message_count} msgs</span>
            </div>
            <span className="text-[11px] text-green-700 font-medium flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
              {isActive ? 'Continue' : 'View'} <ArrowRight size={10} />
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
