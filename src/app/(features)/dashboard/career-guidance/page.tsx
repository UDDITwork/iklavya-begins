'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Plus, Loader2, MessageSquare, Sparkles, TrendingUp, BookOpen } from 'lucide-react'
import toast from 'react-hot-toast'
import SessionCard from '@/components/dashboard/SessionCard'
import { playPop } from '@/lib/sounds'
import { fadeInUp, fadeInUpTransition, staggerContainer, staggerItem } from '@/lib/animations'

interface Session {
  id: string
  title: string
  started_at: string
  status: string
  questions_asked_count: number
  analysis_generated: number
}

export default function CareerGuidancePage() {
  const router = useRouter()
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    fetchSessions()
  }, [])

  async function fetchSessions() {
    try {
      const res = await fetch('/api/sessions')
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

  async function handleNewSession() {
    playPop()
    setCreating(true)
    try {
      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Career Guidance Session' }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Failed to create session')
        return
      }
      router.push(`/session/${data.id}`)
    } catch {
      toast.error('Something went wrong')
    } finally {
      setCreating(false)
    }
  }

  const activeSessions = sessions.filter((s) => s.status === 'active')
  const completedSessions = sessions.filter((s) => s.status === 'completed')

  return (
    <div className="p-6 sm:p-8 max-w-5xl">
      {/* Header Card */}
      <motion.div
        variants={fadeInUp}
        initial="initial"
        animate="animate"
        transition={fadeInUpTransition}
        className="mb-6"
      >
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center text-green-800">
                <MessageSquare size={22} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">AI Career Guidance</h1>
                <p className="text-sm text-gray-500 flex items-center gap-1">
                  <Sparkles size={12} /> Get personalized career advice from AI
                </p>
              </div>
            </div>

            <button
              onClick={handleNewSession}
              disabled={creating}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-green-800 text-white text-sm font-medium hover:bg-green-900 transition-colors shadow-sm disabled:opacity-50"
            >
              {creating ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
              Start New Session
            </button>
          </div>
        </div>
      </motion.div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={24} className="animate-spin text-gray-400" />
        </div>
      ) : sessions.length === 0 ? (
        <motion.div
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          transition={{ ...fadeInUpTransition, delay: 0.1 }}
        >
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-sm">
            <div className="flex items-center justify-center gap-2 mb-6">
              <div className="w-16 h-16 rounded-xl bg-green-50 flex items-center justify-center text-green-300">
                <MessageSquare size={30} />
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-300 -ml-4 mt-4">
                <TrendingUp size={22} />
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-300 -ml-3 mt-1">
                <BookOpen size={18} />
              </div>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">Start Your First Career Guidance Session</h2>
            <p className="text-sm text-gray-500 mb-8 max-w-md mx-auto leading-relaxed">
              Our AI counselor will help you discover career paths aligned with your interests,
              skills, and goals. Each session ends with a personalized analysis and roadmap.
            </p>
            <button
              onClick={handleNewSession}
              disabled={creating}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-green-800 text-white text-sm font-medium hover:bg-green-900 transition-colors shadow-sm disabled:opacity-50"
            >
              {creating ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
              Start First Session
            </button>
          </div>
        </motion.div>
      ) : (
        <div className="space-y-6">
          {activeSessions.length > 0 && (
            <motion.div
              variants={fadeInUp}
              initial="initial"
              animate="animate"
              transition={{ ...fadeInUpTransition, delay: 0.1 }}
            >
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <h2 className="text-base font-semibold text-gray-900 mb-4">Active Sessions</h2>
                <motion.div
                  variants={staggerContainer}
                  initial="initial"
                  animate="animate"
                  className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                >
                  {activeSessions.map((session) => (
                    <motion.div key={session.id} variants={staggerItem}>
                      <SessionCard session={session} />
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </motion.div>
          )}

          {completedSessions.length > 0 && (
            <motion.div
              variants={fadeInUp}
              initial="initial"
              animate="animate"
              transition={{ ...fadeInUpTransition, delay: 0.15 }}
            >
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <h2 className="text-base font-semibold text-gray-900 mb-4">Completed Sessions</h2>
                <motion.div
                  variants={staggerContainer}
                  initial="initial"
                  animate="animate"
                  className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                >
                  {completedSessions.map((session) => (
                    <motion.div key={session.id} variants={staggerItem}>
                      <SessionCard session={session} />
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </motion.div>
          )}
        </div>
      )}
    </div>
  )
}
