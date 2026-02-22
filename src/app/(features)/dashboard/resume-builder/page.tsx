'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Loader2, Plus, FileText, Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'
import ResumeCard from '@/components/resume/ResumeCard'
import { staggerContainer, staggerItem } from '@/lib/animations'

interface ResumeSession {
  id: string
  title: string
  started_at: string
  status: string
  message_count: number
}

export default function ResumeBuilderPage() {
  const router = useRouter()
  const [sessions, setSessions] = useState<ResumeSession[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    loadSessions()
  }, [])

  async function loadSessions() {
    try {
      const res = await fetch('/api/resume/sessions')
      if (res.ok) {
        const data = await res.json()
        setSessions(data.sessions || [])
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }

  async function handleCreate() {
    setCreating(true)
    try {
      const res = await fetch('/api/resume/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'New Resume' }),
      })

      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || 'Failed to create resume session')
        return
      }

      const data = await res.json()
      router.push(`/resume-session/${data.id}`)
    } catch {
      toast.error('Something went wrong')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="p-6 sm:p-8 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-green-50/60 flex items-center justify-center text-green-800">
            <FileText size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">AI Resume Builder</h1>
            <p className="text-sm text-gray-500 flex items-center gap-1">
              <Sparkles size={12} /> Build ATS-optimized resumes with AI
            </p>
          </div>
        </div>

        <button
          onClick={handleCreate}
          disabled={creating}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg border-2 border-green-800 text-green-800 text-sm font-medium hover:bg-green-50 transition-colors disabled:opacity-50"
        >
          {creating ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Plus size={16} />
          )}
          Naya Resume Banao
        </button>
      </div>

      {/* Sessions grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={24} className="animate-spin text-gray-400" />
        </div>
      ) : sessions.length === 0 ? (
        <div className="text-center py-20 rounded-xl border border-dashed border-gray-200">
          <FileText size={32} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-400 mb-1">No resumes yet</p>
          <p className="text-gray-300 text-xs">
            Click &quot;Naya Resume Banao&quot; to start building your first resume with AI
          </p>
        </div>
      ) : (
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="grid grid-cols-1 sm:grid-cols-2 gap-4"
        >
          {sessions.map((session) => (
            <motion.div key={session.id} variants={staggerItem}>
              <ResumeCard session={session} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  )
}
