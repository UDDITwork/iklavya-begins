'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import SessionCard from '@/components/dashboard/SessionCard'
import { staggerContainer, staggerItem } from '@/lib/animations'

interface Session {
  id: string
  title: string
  started_at: string
  status: string
  questions_asked_count: number
  analysis_generated: number
}

export default function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
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
    load()
  }, [])

  return (
    <div className="p-6 sm:p-8 max-w-5xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">My Sessions</h1>
      <p className="text-sm text-gray-500 mb-8">All your career guidance sessions</p>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={24} className="animate-spin text-gray-400" />
        </div>
      ) : sessions.length === 0 ? (
        <div className="text-center py-20 rounded-xl border border-dashed border-gray-200">
          <p className="text-gray-400">No sessions found. Start one from the dashboard.</p>
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
              <SessionCard session={session} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  )
}
