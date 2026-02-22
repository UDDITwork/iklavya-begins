'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Plus, Loader2, MessageSquare, FileText, Sparkles, ArrowRight,
  TrendingUp, Target, BookOpen
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/store/auth-store'
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

  if (!user) return null

  const recentSessions = sessions.slice(0, 4)
  const activeSessions = sessions.filter(s => s.status === 'active').length
  const completedSessions = sessions.filter(s => s.status === 'completed').length

  return (
    <div className="p-6 sm:p-8 max-w-6xl">
      {/* Welcome Banner */}
      <motion.div
        variants={fadeInUp}
        initial="initial"
        animate="animate"
        transition={fadeInUpTransition}
        className="mb-8"
      >
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-900 via-green-800 to-emerald-900 p-7 sm:p-8 text-white">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-1/2 w-40 h-40 bg-white/5 rounded-full translate-y-1/2" />

          <div className="relative z-10">
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">
              Welcome back, {user.name.split(' ')[0]}
            </h1>
            <p className="text-green-200/80 text-sm mb-6">
              Continue your career readiness journey
            </p>

            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 backdrop-blur-sm text-sm">
                <MessageSquare size={15} className="text-green-300" />
                <span className="font-semibold">{sessions.length}</span>
                <span className="text-green-200/70">Sessions</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 backdrop-blur-sm text-sm">
                <TrendingUp size={15} className="text-green-300" />
                <span className="font-semibold">{activeSessions}</span>
                <span className="text-green-200/70">Active</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 backdrop-blur-sm text-sm">
                <Target size={15} className="text-green-300" />
                <span className="font-semibold">{completedSessions}</span>
                <span className="text-green-200/70">Completed</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Feature Cards */}
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8"
      >
        <motion.div variants={staggerItem}>
          <div className="spotlight-card rounded-2xl bg-gradient-to-br from-green-50/50 to-white border border-gray-200 shadow-sm overflow-hidden hover:shadow-lg hover:border-green-200 transition-all duration-300">
            <div className="h-1.5 bg-gradient-to-r from-green-700 to-emerald-600" />
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center text-green-800">
                  <MessageSquare size={22} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">AI Career Guidance</h2>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <Sparkles size={10} /> Personalized career advice from AI
                  </p>
                </div>
              </div>
              <ul className="space-y-2.5 mb-6 text-sm text-gray-600">
                <li className="flex items-center gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-600 shrink-0" />
                  Explore career paths based on your interests
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-600 shrink-0" />
                  Get stream &amp; course recommendations
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-600 shrink-0" />
                  Understand job market &amp; salary trends
                </li>
              </ul>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleNewSession}
                  disabled={creating}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-green-800 text-white text-sm font-medium hover:bg-green-900 transition-colors shadow-sm disabled:opacity-50"
                >
                  {creating ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
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

        <motion.div variants={staggerItem}>
          <div className="spotlight-card rounded-2xl bg-gradient-to-br from-cyan-50/50 to-white border border-gray-200 shadow-sm overflow-hidden hover:shadow-lg hover:border-cyan-200 transition-all duration-300">
            <div className="h-1.5 bg-gradient-to-r from-cyan-700 to-teal-600" />
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-cyan-100 flex items-center justify-center text-cyan-800">
                  <FileText size={22} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">AI Resume Builder</h2>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <Sparkles size={10} /> Build ATS-optimized resumes with AI
                  </p>
                </div>
              </div>
              <ul className="space-y-2.5 mb-6 text-sm text-gray-600">
                <li className="flex items-center gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-600 shrink-0" />
                  AI writes professional summaries &amp; bullets
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-600 shrink-0" />
                  ATS-friendly formatting
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-600 shrink-0" />
                  Download as PDF in multiple templates
                </li>
              </ul>
              <Link href="/dashboard/resume-builder">
                <button
                  onClick={() => playPop()}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg border-2 border-cyan-700 text-cyan-700 text-sm font-medium hover:bg-cyan-50 transition-colors shadow-sm"
                >
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
        <div className="flex items-center justify-center py-16">
          <Loader2 size={24} className="animate-spin text-gray-400" />
        </div>
      ) : recentSessions.length > 0 ? (
        <motion.div
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          transition={{ ...fadeInUpTransition, delay: 0.2 }}
        >
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold text-gray-900">Recent Activity</h2>
              <Link href="/dashboard/career-guidance">
                <span className="text-sm text-green-800 font-medium hover:underline flex items-center gap-1">
                  View All <ArrowRight size={14} />
                </span>
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {recentSessions.map((session) => (
                <SessionCard key={session.id} session={session} />
              ))}
            </div>
          </div>
        </motion.div>
      ) : (
        <motion.div
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          transition={{ ...fadeInUpTransition, delay: 0.2 }}
        >
          <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center shadow-sm">
            <div className="flex items-center justify-center gap-2 mb-5">
              <div className="w-14 h-14 rounded-xl bg-green-50 flex items-center justify-center text-green-300">
                <MessageSquare size={28} />
              </div>
              <div className="w-12 h-12 rounded-xl bg-cyan-50 flex items-center justify-center text-cyan-300 -ml-4 mt-4">
                <FileText size={22} />
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-300 -ml-3 mt-1">
                <BookOpen size={18} />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No sessions yet</h3>
            <p className="text-sm text-gray-400 mb-6 max-w-sm mx-auto">
              Start your first AI career guidance session to explore career paths, get recommendations, and build your roadmap.
            </p>
            <button
              onClick={handleNewSession}
              disabled={creating}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-green-800 text-white text-sm font-medium hover:bg-green-900 transition-colors shadow-sm disabled:opacity-50"
            >
              {creating ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
              Start First Session
            </button>
          </div>
        </motion.div>
      )}
    </div>
  )
}
