'use client'

import Link from 'next/link'
import { MessageSquare, Clock, BarChart3, Download } from 'lucide-react'

interface Session {
  id: string
  title: string
  started_at: string
  status: string
  questions_asked_count: number
  analysis_generated: number
}

export default function SessionCard({ session }: { session: Session }) {
  const isActive = session.status === 'active'
  const date = new Date(session.started_at).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

  return (
    <div
      className={`spotlight-card rounded-xl bg-white border border-gray-200 shadow-sm p-5 hover:shadow-md transition-all duration-200 border-l-4 ${
        isActive ? 'border-l-green-600' : 'border-l-gray-300'
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
            isActive ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-500'
          }`}>
            <MessageSquare size={16} />
          </div>
          <h3 className="text-sm font-semibold text-gray-900 line-clamp-1">{session.title}</h3>
        </div>
        <span
          className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
            isActive
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-gray-100 text-gray-500 border border-gray-200'
          }`}
        >
          {isActive ? 'Active' : 'Completed'}
        </span>
      </div>

      <div className="flex items-center gap-4 text-xs text-gray-400 mb-4">
        <span className="flex items-center gap-1">
          <Clock size={12} />
          {date}
        </span>
        <span className="flex items-center gap-1">
          <MessageSquare size={12} />
          {session.questions_asked_count} questions
        </span>
      </div>

      <div className="flex gap-2">
        {isActive ? (
          <Link href={`/session/${session.id}`} className="flex-1">
            <button className="w-full px-4 py-2 rounded-lg bg-green-800 text-white text-xs font-medium hover:bg-green-900 transition-colors duration-200">
              Resume
            </button>
          </Link>
        ) : (
          <>
            {session.analysis_generated === 1 && (
              <>
                <Link href={`/session/${session.id}`} className="flex-1">
                  <button className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 text-gray-700 text-xs font-medium hover:bg-gray-50 transition-colors">
                    <BarChart3 size={12} />
                    Analysis
                  </button>
                </Link>
                <a
                  href={`/api/sessions/${session.id}/report`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1"
                >
                  <button className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 text-gray-700 text-xs font-medium hover:bg-gray-50 transition-colors">
                    <Download size={12} />
                    Report
                  </button>
                </a>
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}
