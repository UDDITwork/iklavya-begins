'use client'

import { useEffect, useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  Plus, Loader2, MessageSquare, FileText, Clock,
  BarChart3, Calendar, Flame, ArrowRight, Activity, Camera,
  type LucideIcon,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/store/auth-store'
import { playPop } from '@/lib/sounds'
import { fadeInUp, fadeInUpTransition, staggerContainer, staggerItem } from '@/lib/animations'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface CareerSession {
  id: string
  title: string
  started_at: string
  status: string
  questions_asked_count: number
  analysis_generated: number
}

interface ResumeSession {
  id: string
  title: string
  started_at: string
  status: string
  message_count: number
}

interface DayActivity {
  date: string
  count: number
  level: 0 | 1 | 2 | 3 | 4
}

interface MergedSession {
  id: string
  title: string
  started_at: string
  status: string
  count: number
  countLabel: string
  type: 'career' | 'resume'
}

/* ------------------------------------------------------------------ */
/*  AnimatedCounter                                                    */
/* ------------------------------------------------------------------ */

function AnimatedCounter({ value, duration = 800 }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    if (value === 0) { setDisplay(0); return }
    let start: number | null = null
    let raf: number
    const step = (ts: number) => {
      if (!start) start = ts
      const progress = Math.min((ts - start) / duration, 1)
      setDisplay(Math.floor(progress * value))
      if (progress < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [value, duration])

  return <span>{display.toLocaleString()}</span>
}

/* ------------------------------------------------------------------ */
/*  StatCard                                                           */
/* ------------------------------------------------------------------ */

const colorMap: Record<string, { bg: string; text: string }> = {
  green:  { bg: 'bg-green-50',  text: 'text-green-700' },
  blue:   { bg: 'bg-blue-50',   text: 'text-blue-700' },
  purple: { bg: 'bg-purple-50', text: 'text-purple-700' },
  amber:  { bg: 'bg-amber-50',  text: 'text-amber-700' },
}

function StatCard({
  icon: Icon,
  value,
  label,
  color,
}: {
  icon: LucideIcon
  value: number
  label: string
  color: string
}) {
  const c = colorMap[color] || colorMap.green
  return (
    <motion.div variants={staggerItem}>
      <div className="spotlight-card bg-white rounded-xl border border-gray-200 shadow-sm p-5 h-full">
        <div className="flex items-center gap-3 mb-3">
          <div className={`w-9 h-9 rounded-lg ${c.bg} ${c.text} flex items-center justify-center`}>
            <Icon size={18} />
          </div>
        </div>
        <p className="text-2xl font-bold text-gray-900 leading-none">
          <AnimatedCounter value={value} />
        </p>
        <p className="text-xs text-gray-500 mt-1.5">{label}</p>
      </div>
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/*  ActivityHeatmap                                                    */
/* ------------------------------------------------------------------ */

const HEATMAP_COLORS = [
  'bg-gray-100',
  'bg-green-200',
  'bg-green-400',
  'bg-green-600',
  'bg-green-800',
]

const DAY_LABELS = ['', 'Mon', '', 'Wed', '', 'Fri', '']

function ActivityHeatmap({ data }: { data: DayActivity[] }) {
  // Compute month labels from the Sunday (index 0) of each week column
  const monthLabels = useMemo(() => {
    const labels: { col: number; label: string }[] = []
    let lastMonth = -1
    for (let i = 0; i < data.length; i += 7) {
      const d = new Date(data[i].date)
      const month = d.getMonth()
      if (month !== lastMonth) {
        labels.push({
          col: Math.floor(i / 7),
          label: d.toLocaleString('en', { month: 'short' }),
        })
        lastMonth = month
      }
    }
    return labels
  }, [data])

  const totalWeeks = Math.ceil(data.length / 7)

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Activity size={16} className="text-gray-400" />
          <h2 className="text-sm font-semibold text-gray-900">Activity</h2>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
          <span>Less</span>
          {HEATMAP_COLORS.map((c, i) => (
            <div key={i} className={`w-2.5 h-2.5 rounded-sm ${c}`} />
          ))}
          <span>More</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        {/* Month labels row */}
        <div className="flex ml-8" style={{ gap: 0 }}>
          {Array.from({ length: totalWeeks }).map((_, weekIdx) => {
            const ml = monthLabels.find((m) => m.col === weekIdx)
            return (
              <div
                key={weekIdx}
                className="text-[10px] text-gray-400 leading-none"
                style={{ width: 15, minWidth: 15 }}
              >
                {ml?.label || ''}
              </div>
            )
          })}
        </div>

        {/* Grid: day labels + cells */}
        <div className="flex mt-1">
          {/* Day labels column */}
          <div className="flex flex-col shrink-0" style={{ gap: 3, width: 28 }}>
            {DAY_LABELS.map((label, i) => (
              <div
                key={i}
                className="text-[10px] text-gray-400 leading-none flex items-center"
                style={{ height: 12 }}
              >
                {label}
              </div>
            ))}
          </div>

          {/* Heatmap grid */}
          <div
            className="grid"
            style={{
              gridTemplateRows: 'repeat(7, 12px)',
              gridAutoFlow: 'column',
              gridAutoColumns: '12px',
              gap: 3,
            }}
          >
            {data.map((day, i) => (
              <div
                key={i}
                className={`w-3 h-3 rounded-sm ${HEATMAP_COLORS[day.level]} transition-colors`}
                title={`${day.count} activit${day.count === 1 ? 'y' : 'ies'} on ${new Date(day.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  RecentSessions                                                     */
/* ------------------------------------------------------------------ */

function RecentSessions({ sessions }: { sessions: MergedSession[] }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 sm:p-6 h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-gray-900">Recent Sessions</h2>
        <Link
          href="/dashboard/career-guidance"
          className="flex items-center gap-1 text-xs text-gray-400 hover:text-green-700 transition-colors"
        >
          View all <ArrowRight size={12} />
        </Link>
      </div>

      {sessions.length === 0 ? (
        <p className="text-xs text-gray-400 py-6 text-center">
          No sessions yet. Start one to see activity here.
        </p>
      ) : (
        <div className="space-y-0">
          {sessions.map((s) => (
            <Link
              key={`${s.type}-${s.id}`}
              href={s.type === 'career' ? `/session/${s.id}` : `/resume-session/${s.id}`}
            >
              <div className="flex items-center gap-3 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 -mx-2 px-2 rounded-lg transition-colors">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    s.type === 'career'
                      ? 'bg-green-50 text-green-700'
                      : 'bg-cyan-50 text-cyan-700'
                  }`}
                >
                  {s.type === 'career' ? <MessageSquare size={14} /> : <FileText size={14} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{s.title}</p>
                  <p className="text-[11px] text-gray-400">
                    {new Date(s.started_at).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                    })}
                    {' -- '}
                    {s.count} {s.countLabel}
                  </p>
                </div>
                <span
                  className={`text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0 ${
                    s.status === 'active'
                      ? 'bg-green-50 text-green-700 border border-green-200'
                      : 'bg-gray-100 text-gray-500 border border-gray-200'
                  }`}
                >
                  {s.status === 'active' ? 'Active' : 'Done'}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  DailyActivityCard                                                  */
/* ------------------------------------------------------------------ */

function DailyActivityCard({
  sessionsToday,
  messagesToday,
  streak,
}: {
  sessionsToday: number
  messagesToday: number
  streak: number
}) {
  const rows = [
    { icon: Calendar, label: 'Sessions Today', value: sessionsToday },
    { icon: MessageSquare, label: 'Messages Today', value: messagesToday },
    { icon: Flame, label: 'Current Streak', value: streak, suffix: streak === 1 ? ' day' : ' days' },
  ]

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 sm:p-6 h-full">
      <h2 className="text-sm font-semibold text-gray-900 mb-4">Today</h2>
      <div className="space-y-0">
        {rows.map((r) => (
          <div
            key={r.label}
            className="flex items-center justify-between py-3.5 border-b border-gray-50 last:border-0"
          >
            <div className="flex items-center gap-2.5">
              <r.icon size={16} className="text-gray-400" />
              <span className="text-sm text-gray-600">{r.label}</span>
            </div>
            <span className="text-lg font-semibold text-gray-900">
              {r.value}
              {r.suffix || ''}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Dashboard Page                                                     */
/* ------------------------------------------------------------------ */

export default function DashboardPage() {
  const { user } = useAuthStore()
  const router = useRouter()
  const [careerSessions, setCareerSessions] = useState<CareerSession[]>([])
  const [resumeSessions, setResumeSessions] = useState<ResumeSession[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)

  const firstName = user?.name?.split(' ')[0] || 'there'

  useEffect(() => {
    async function load() {
      const [careerRes, resumeRes] = await Promise.allSettled([
        fetch('/api/sessions'),
        fetch('/api/resume/sessions'),
      ])
      if (careerRes.status === 'fulfilled' && careerRes.value.ok) {
        const data = await careerRes.value.json()
        setCareerSessions(data.sessions || [])
      }
      if (resumeRes.status === 'fulfilled' && resumeRes.value.ok) {
        const data = await resumeRes.value.json()
        setResumeSessions(data.sessions || [])
      }
      setLoading(false)
    }
    load()
  }, [])

  /* --- Computed stats --- */
  const stats = useMemo(() => {
    const totalSessions = careerSessions.length + resumeSessions.length
    const totalMessages =
      careerSessions.reduce((s, x) => s + x.questions_asked_count, 0) +
      resumeSessions.reduce((s, x) => s + x.message_count, 0)
    const resumesBuilt = resumeSessions.filter((s) => s.status === 'completed').length
    const estimatedMinutes = totalMessages * 2
    return { totalSessions, totalMessages, resumesBuilt, estimatedMinutes }
  }, [careerSessions, resumeSessions])

  /* --- Heatmap data --- */
  const heatmapData = useMemo(() => {
    const activityMap = new Map<string, number>()

    careerSessions.forEach((s) => {
      const key = new Date(s.started_at).toISOString().split('T')[0]
      activityMap.set(key, (activityMap.get(key) || 0) + s.questions_asked_count)
    })
    resumeSessions.forEach((s) => {
      const key = new Date(s.started_at).toISOString().split('T')[0]
      activityMap.set(key, (activityMap.get(key) || 0) + s.message_count)
    })

    const maxCount = Math.max(...Array.from(activityMap.values()), 1)

    const today = new Date()
    const dayOfWeek = today.getDay()
    const startDate = new Date(today)
    startDate.setDate(startDate.getDate() - (15 * 7 + dayOfWeek))

    const totalDays =
      Math.ceil((today.getTime() - startDate.getTime()) / (86400000)) + 1

    const days: DayActivity[] = []
    for (let i = 0; i < totalDays; i++) {
      const d = new Date(startDate)
      d.setDate(d.getDate() + i)
      const dateStr = d.toISOString().split('T')[0]
      const count = activityMap.get(dateStr) || 0
      const ratio = count / maxCount
      const level: DayActivity['level'] =
        count === 0 ? 0 : ratio <= 0.25 ? 1 : ratio <= 0.5 ? 2 : ratio <= 0.75 ? 3 : 4
      days.push({ date: dateStr, count, level })
    }
    return days
  }, [careerSessions, resumeSessions])

  /* --- Merged + sorted sessions for Recent Sessions --- */
  const mergedSessions = useMemo<MergedSession[]>(() => {
    const career: MergedSession[] = careerSessions.map((s) => ({
      id: s.id,
      title: s.title,
      started_at: s.started_at,
      status: s.status,
      count: s.questions_asked_count,
      countLabel: 'questions',
      type: 'career',
    }))
    const resume: MergedSession[] = resumeSessions.map((s) => ({
      id: s.id,
      title: s.title,
      started_at: s.started_at,
      status: s.status,
      count: s.message_count,
      countLabel: 'messages',
      type: 'resume',
    }))
    return [...career, ...resume]
      .sort((a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime())
      .slice(0, 6)
  }, [careerSessions, resumeSessions])

  /* --- Today's activity --- */
  const todayStats = useMemo(() => {
    const todayKey = new Date().toISOString().split('T')[0]

    let sessionsToday = 0
    let messagesToday = 0

    careerSessions.forEach((s) => {
      if (new Date(s.started_at).toISOString().split('T')[0] === todayKey) {
        sessionsToday++
        messagesToday += s.questions_asked_count
      }
    })
    resumeSessions.forEach((s) => {
      if (new Date(s.started_at).toISOString().split('T')[0] === todayKey) {
        sessionsToday++
        messagesToday += s.message_count
      }
    })

    // Streak: consecutive days with activity going backwards from today/yesterday
    const activitySet = new Set<string>()
    careerSessions.forEach((s) => activitySet.add(new Date(s.started_at).toISOString().split('T')[0]))
    resumeSessions.forEach((s) => activitySet.add(new Date(s.started_at).toISOString().split('T')[0]))

    let streak = 0
    const d = new Date()
    // If no activity today, start checking from yesterday
    if (!activitySet.has(todayKey)) {
      d.setDate(d.getDate() - 1)
    }
    for (let i = 0; i < 365; i++) {
      const key = d.toISOString().split('T')[0]
      if (activitySet.has(key)) {
        streak++
        d.setDate(d.getDate() - 1)
      } else {
        break
      }
    }

    return { sessionsToday, messagesToday, streak }
  }, [careerSessions, resumeSessions])

  /* --- New session handler --- */
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

  /* --- Render --- */

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 size={24} className="animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="p-6 sm:p-8 max-w-6xl">
      {/* Row 1: Welcome + Action */}
      <motion.div
        variants={fadeInUp}
        initial="initial"
        animate="animate"
        transition={fadeInUpTransition}
        className="mb-6"
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              Welcome back, {firstName}
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">
              Here is your activity overview
            </p>
          </div>
          <button
            onClick={handleNewSession}
            disabled={creating}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-green-800 text-white text-sm font-medium hover:bg-green-900 transition-colors shadow-sm disabled:opacity-50"
          >
            {creating ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
            New Session
          </button>
        </div>
      </motion.div>

      {/* Profile Image Reminder */}
      {!user?.profile_image && (
        <motion.div
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          transition={{ ...fadeInUpTransition, delay: 0.05 }}
          className="mb-5"
        >
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
              <Camera size={22} className="text-amber-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-amber-900">Complete your profile with a photo</p>
              <p className="text-xs text-amber-700 mt-0.5">
                Students with profile photos get 3x more engagement. Upload yours today!
              </p>
            </div>
            <Link
              href="/dashboard/profile"
              className="px-4 py-2.5 rounded-lg bg-amber-600 text-white text-xs font-medium hover:bg-amber-700 transition-colors shrink-0 shadow-sm"
            >
              Upload Photo
            </Link>
          </div>
        </motion.div>
      )}

      {/* Row 2: Stat Cards */}
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5"
      >
        <StatCard icon={BarChart3} value={stats.totalSessions} label="Total Sessions" color="green" />
        <StatCard icon={MessageSquare} value={stats.totalMessages} label="Messages Sent" color="blue" />
        <StatCard icon={FileText} value={stats.resumesBuilt} label="Resumes Built" color="purple" />
        <StatCard icon={Clock} value={stats.estimatedMinutes} label="Est. Minutes" color="amber" />
      </motion.div>

      {/* Row 3: Activity Heatmap */}
      <motion.div
        variants={fadeInUp}
        initial="initial"
        animate="animate"
        transition={{ ...fadeInUpTransition, delay: 0.15 }}
      >
        <ActivityHeatmap data={heatmapData} />
      </motion.div>

      {/* Row 4: Recent Sessions + Today */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 mt-5">
        <motion.div
          className="lg:col-span-3"
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          transition={{ ...fadeInUpTransition, delay: 0.2 }}
        >
          <RecentSessions sessions={mergedSessions} />
        </motion.div>
        <motion.div
          className="lg:col-span-2"
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          transition={{ ...fadeInUpTransition, delay: 0.25 }}
        >
          <DailyActivityCard
            sessionsToday={todayStats.sessionsToday}
            messagesToday={todayStats.messagesToday}
            streak={todayStats.streak}
          />
        </motion.div>
      </div>
    </div>
  )
}
