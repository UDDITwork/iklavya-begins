'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Plus, Loader2, MessageSquare, FileText, Sparkles, ArrowRight } from 'lucide-react'
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

  const recentSessions = sessions.slice(0, 4)

  return (
    <div className="p-6 sm:p-8 max-w-5xl">
      {/* Welcome */}
      <motion.div
        variants={fadeInUp}
        initial="initial"
        animate="animate"
        transition={fadeInUpTransition}
      >
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user.name.split(' ')[0]}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Continue your career readiness journey
          </p>
        </div>
      </motion.div>

      {/* Feature Cards */}
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-10"
      >
        {/* AI Career Guidance Card */}
        <motion.div variants={staggerItem}>
          <div className="rounded-2xl bg-white border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200">
            <div className="h-1.5 bg-green-800" />
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-xl bg-green-50/60 flex items-center justify-center text-green-800">
                  <MessageSquare size={22} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">AI Career Guidance</h2>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <Sparkles size={10} /> Personalized career advice from AI
                  </p>
                </div>
              </div>

              <ul className="space-y-2 mb-5 text-sm text-gray-500">
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-green-600" />
                  Explore career paths based on your interests
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-green-600" />
                  Get stream &amp; course recommendations
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-green-600" />
                  Understand job market &amp; salary trends
                </li>
              </ul>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleNewSession}
                  disabled={creating}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-green-800 text-white text-sm font-medium hover:bg-green-900 transition-colors duration-200 disabled:opacity-50"
                >
                  {creating ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Plus size={14} />
                  )}
                  Start New Session
                </button>
                <Link href="/dashboard/career-guidance">
                  <span className="flex items-center gap-1 text-sm text-green-800 font-medium hover:underline">
                    View All <ArrowRight size={14} />
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </motion.div>

        {/* AI Resume Builder Card */}
        <motion.div variants={staggerItem}>
          <div className="rounded-2xl bg-white border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200">
            <div className="h-1.5 bg-cyan-700" />
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-xl bg-cyan-50/60 flex items-center justify-center text-cyan-800">
                  <FileText size={22} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">AI Resume Builder</h2>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <Sparkles size={10} /> Build ATS-optimized resumes with AI
                  </p>
                </div>
              </div>

              <ul className="space-y-2 mb-5 text-sm text-gray-500">
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-cyan-600" />
                  AI writes professional summaries &amp; bullets
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-cyan-600" />
                  ATS-friendly formatting
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-cyan-600" />
                  Download as PDF
                </li>
              </ul>

              <Link href="/dashboard/resume-builder">
                <button className="flex items-center gap-2 px-5 py-2.5 rounded-lg border-2 border-cyan-700 text-cyan-700 text-sm font-medium hover:bg-cyan-50 transition-colors duration-200">
                  <FileText size={14} />
                  Build Resume
                  <ArrowRight size={14} />
                </button>
              </Link>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Recent Activity */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={24} className="animate-spin text-gray-400" />
        </div>
      ) : recentSessions.length > 0 ? (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-900">Recent Activity</h2>
            <Link href="/dashboard/career-guidance">
              <span className="text-sm text-green-800 font-medium hover:underline flex items-center gap-1">
                View All <ArrowRight size={14} />
              </span>
            </Link>
          </div>
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            {recentSessions.map((session) => (
              <motion.div key={session.id} variants={staggerItem}>
                <SessionCard session={session} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      ) : (
        <motion.div
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          transition={{ ...fadeInUpTransition, delay: 0.2 }}
          className="text-center py-12 rounded-xl border border-dashed border-gray-200"
        >
          <p className="text-gray-400 text-sm">No sessions yet. Start your first AI career guidance session above!</p>
        </motion.div>
      )}
    </div>
  )
}
