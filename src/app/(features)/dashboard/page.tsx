'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Plus, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/store/auth-store'
import SessionCard from '@/components/dashboard/SessionCard'
import { fadeInUp, fadeInUpTransition, staggerContainer, staggerItem } from '@/lib/animations'

interface Session {
  id: string
  title: string
  started_at: string
  status: string
  questions_asked_count: number
  analysis_generated: number
}

export default function DashboardPage() {
  const router = useRouter()
  const { user } = useAuthStore()
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

  if (!user) return null

  const activeSessions = sessions.filter((s) => s.status === 'active')
  const completedSessions = sessions.filter((s) => s.status === 'completed')

  return (
    <div className="p-6 sm:p-8 max-w-5xl">
      <motion.div
        variants={fadeInUp}
        initial="initial"
        animate="animate"
        transition={fadeInUpTransition}
      >
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {user.name.split(' ')[0]}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Continue your career readiness journey
            </p>
          </div>
          <button
            onClick={handleNewSession}
            disabled={creating}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg border-2 border-green-800 bg-green-800 text-white text-sm font-medium hover:bg-green-900 transition-colors duration-200 disabled:opacity-50"
          >
            {creating ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Plus size={16} />
            )}
            New Session
          </button>
        </div>
      </motion.div>

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
          className="text-center py-20 rounded-xl border border-dashed border-gray-200"
        >
          <p className="text-gray-400 mb-4">No sessions yet. Start your first AI career guidance session!</p>
          <button
            onClick={handleNewSession}
            disabled={creating}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border-2 border-green-800 text-green-800 text-sm font-medium hover:bg-green-50 transition-colors"
          >
            <Plus size={16} />
            Start First Session
          </button>
        </motion.div>
      ) : (
        <>
          {activeSessions.length > 0 && (
            <div className="mb-8">
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
          )}

          {completedSessions.length > 0 && (
            <div>
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
          )}
        </>
      )}
    </div>
  )
}
