'use client'

import Link from 'next/link'
import { FileText, Clock, Download } from 'lucide-react'

interface ResumeSession {
  id: string
  title: string
  started_at: string
  status: string
  message_count: number
}

export default function ResumeCard({ session }: { session: ResumeSession }) {
  const isActive = session.status === 'active'
  const date = new Date(session.started_at).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

  return (
    <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-5 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-green-50/60 flex items-center justify-center text-green-800">
            <FileText size={16} />
          </div>
          <h3 className="text-sm font-semibold text-gray-900 line-clamp-1">{session.title}</h3>
        </div>
        <span
          className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
            isActive
              ? 'bg-amber-50 text-amber-700 border border-amber-200'
              : 'bg-green-50 text-green-700 border border-green-200'
          }`}
        >
          {isActive ? 'Building' : 'Completed'}
        </span>
      </div>

      <div className="flex items-center gap-4 text-xs text-gray-400 mb-4">
        <span className="flex items-center gap-1">
          <Clock size={12} />
          {date}
        </span>
        <span className="flex items-center gap-1">
          <FileText size={12} />
          {session.message_count} messages
        </span>
      </div>

      <div className="flex gap-2">
        {isActive ? (
          <Link href={`/resume-session/${session.id}`} className="flex-1">
            <button className="w-full px-4 py-2 rounded-lg border-2 border-green-800 text-green-800 text-xs font-medium hover:bg-green-50 transition-colors duration-200">
              Continue
            </button>
          </Link>
        ) : (
          <Link href={`/resume-session/${session.id}`} className="flex-1">
            <button className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-gray-300 text-gray-700 text-xs font-medium hover:bg-gray-50 transition-colors">
              <Download size={12} />
              View & Download
            </button>
          </Link>
        )}
      </div>
    </div>
  )
}
