'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Send, Loader2, Users, FileText, Briefcase,
  MessageSquare, Clock, BookOpen, ChevronRight, Sparkles,
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/store/auth-store'
import { playSend, playPop } from '@/lib/sounds'
import { fadeInUp, fadeInUpTransition, staggerContainer, staggerItem } from '@/lib/animations'
import BookSessionModal from '@/components/mentorship/BookSessionModal'
import MentorshipSessionCard from '@/components/mentorship/MentorshipSessionCard'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

interface ActivitySession {
  title: string
  date: string
  status: string
  questions: number
}

interface JobClick {
  title: string
  company: string
  date: string
}

interface ActivityContext {
  sessions: ActivitySession[]
  job_clicks: JobClick[]
  resume_count: number
  profile_completion: number
}

/* ------------------------------------------------------------------ */
/*  Mentor Data                                                        */
/* ------------------------------------------------------------------ */

interface MentorData {
  id: string
  name: string
  specialization: string | null
  bio: string | null
  profile_image: string | null
  expertise_json: string | null
  linkedin_url: string | null
  experience_years: number | null
  is_available: number
}

const ACCENT_COLORS = [
  'from-emerald-500 to-teal-500',
  'from-blue-500 to-indigo-500',
  'from-amber-500 to-orange-500',
  'from-violet-500 to-purple-500',
  'from-rose-500 to-pink-500',
  'from-cyan-500 to-sky-500',
]

/* ------------------------------------------------------------------ */
/*  Mentor Card                                                        */
/* ------------------------------------------------------------------ */

interface MentorSessionData {
  id: string
  topic: string
  status: string
  student_name: string
  mentor_name: string
  preferred_date?: string | null
  preferred_time?: string | null
  created_at: string
  updated_at: string
  unread_count: number
}

function MentorCard({ mentor, index, onBookSession }: { mentor: MentorData; index: number; onBookSession: (mentor: MentorData) => void }) {
  const initials = mentor.name.split(' ').map(n => n[0]).join('')
  const accent = ACCENT_COLORS[index % ACCENT_COLORS.length]
  const available = mentor.is_available === 1

  let expertiseTags: string[] = []
  if (mentor.expertise_json) {
    try {
      const parsed = JSON.parse(mentor.expertise_json)
      expertiseTags = Array.isArray(parsed) ? parsed : []
    } catch { /* ignore */ }
  }

  return (
    <motion.div variants={staggerItem}>
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r opacity-0 group-hover:opacity-100 rounded-2xl blur transition-opacity duration-300" style={{ backgroundImage: `linear-gradient(to right, var(--tw-gradient-stops))` }} />
        <div className="relative bg-white/80 backdrop-blur-xl rounded-xl border border-gray-200/60 p-5 hover:shadow-lg transition-all duration-300">
          <div className="flex items-start gap-3.5">
            {mentor.profile_image ? (
              <img
                src={mentor.profile_image}
                alt={mentor.name}
                className="w-11 h-11 rounded-xl object-cover shrink-0 shadow-sm"
              />
            ) : (
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${accent} flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm`}>
                {initials}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-0.5">
                <h3 className="text-sm font-semibold text-gray-900 truncate">{mentor.name}</h3>
                <span className={`w-2 h-2 rounded-full shrink-0 ${available ? 'bg-green-500' : 'bg-gray-300'}`} />
              </div>
              {mentor.specialization && (
                <p className="text-xs text-gray-500 mb-1">{mentor.specialization}</p>
              )}
              {mentor.bio && (
                <p className="text-[11px] text-gray-400 leading-relaxed line-clamp-2">{mentor.bio}</p>
              )}
              {mentor.experience_years != null && (
                <p className="text-[10px] text-gray-400 mt-1">{mentor.experience_years}+ years experience</p>
              )}
            </div>
          </div>
          {expertiseTags.length > 0 && (
            <div className="mt-2.5 flex flex-wrap gap-1">
              {expertiseTags.slice(0, 3).map(tag => (
                <span key={tag} className="px-1.5 py-0.5 rounded-md bg-gray-100 text-[10px] text-gray-500">
                  {tag}
                </span>
              ))}
            </div>
          )}
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[11px]">
                <Users size={12} className="text-gray-400" />
                <span className={available ? 'text-green-600 font-medium' : 'text-gray-400'}>
                  {available ? 'Available for mentorship' : 'Currently unavailable'}
                </span>
              </div>
              {available && (
                <button
                  onClick={() => onBookSession(mentor)}
                  className="px-2.5 py-1 rounded-lg bg-emerald-700 text-white text-[11px] font-medium hover:bg-emerald-800 transition-colors"
                >
                  Book Session &rarr;
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/*  Typing Indicator                                                   */
/* ------------------------------------------------------------------ */

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-4 py-3">
      <div className="flex gap-1">
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
            style={{ animationDelay: `${i * 150}ms` }}
          />
        ))}
      </div>
      <span className="text-xs text-gray-400 ml-1.5">Thinking...</span>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Quick Suggestions                                                  */
/* ------------------------------------------------------------------ */

const quickSuggestions = [
  'I feel confused about my career path',
  'Help me improve my resume',
  'Which skills should I focus on?',
  'Connect me with a mentor',
]

/* ------------------------------------------------------------------ */
/*  Main Page                                                          */
/* ------------------------------------------------------------------ */

export default function MentorshipPage() {
  const { user } = useAuthStore()
  const router = useRouter()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [activity, setActivity] = useState<ActivityContext | null>(null)
  const [mentors, setMentors] = useState<MentorData[]>([])
  const [mySessions, setMySessions] = useState<MentorSessionData[]>([])
  const [bookingMentor, setBookingMentor] = useState<MentorData | null>(null)
  const chatEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Fetch my mentorship sessions
  const fetchMySessions = useCallback(() => {
    fetch('/api/mentor-sessions/my')
      .then(res => res.ok ? res.json() : { sessions: [] })
      .then(data => setMySessions(data.sessions || []))
      .catch(() => {})
  }, [])

  useEffect(() => {
    fetchMySessions()
  }, [fetchMySessions])

  // Fetch activity context
  useEffect(() => {
    fetch('/api/mentorship/context')
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setActivity(data) })
      .catch(() => {})
  }, [])

  // Fetch verified mentors
  useEffect(() => {
    fetch('/api/mentors/verified')
      .then(res => res.ok ? res.json() : { mentors: [] })
      .then(data => setMentors(data.mentors || []))
      .catch(() => {})
  }, [])

  // Auto-scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streaming])

  const sendMessage = useCallback(async (text?: string) => {
    const msg = text || input.trim()
    if (!msg || streaming) return

    const userMsg: ChatMessage = { role: 'user', content: msg }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setStreaming(true)
    playSend()

    // Add empty assistant message for streaming
    setMessages(prev => [...prev, { role: 'assistant', content: '' }])

    try {
      const res = await fetch('/api/mentorship/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      })

      if (!res.ok) {
        throw new Error('Chat failed')
      }

      const reader = res.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) throw new Error('No stream')

      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))
              if (data.text) {
                setMessages(prev => {
                  const updated = [...prev]
                  const last = updated[updated.length - 1]
                  if (last.role === 'assistant') {
                    updated[updated.length - 1] = {
                      ...last,
                      content: last.content + data.text,
                    }
                  }
                  return updated
                })
              }
              if (data.error) {
                toast.error(data.error)
              }
            } catch {
              // skip malformed JSON
            }
          }
        }
      }

      playPop()
    } catch {
      // Remove empty assistant message on error
      setMessages(prev => prev.filter((_, i) => i !== prev.length - 1))
      toast.error('Something went wrong. Please try again.')
    } finally {
      setStreaming(false)
      inputRef.current?.focus()
    }
  }, [input, messages, streaming])

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short',
      })
    } catch { return '' }
  }

  return (
    <div className="p-4 sm:p-6 max-w-6xl">
      {/* Header */}
      <motion.div
        variants={fadeInUp} initial="initial" animate="animate"
        transition={fadeInUpTransition}
        className="mb-5"
      >
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-green-700 to-emerald-600 flex items-center justify-center text-white shadow-sm">
              <Users size={20} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Support & Mentorship</h1>
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <Sparkles size={11} /> Personal guidance powered by your profile, sessions & activity
              </p>
            </div>
          </div>
          {/* Admin: Seed real mentors */}
          {user?.role === 'admin' && mentors.length === 0 && (
            <button
              onClick={async () => {
                try {
                  const res = await fetch('/api/mentor/seed', { method: 'POST' })
                  const data = await res.json()
                  if (res.ok) {
                    toast.success(data.message || 'Mentors seeded!')
                    window.location.reload()
                  } else {
                    toast.error(data.error || 'Failed')
                  }
                } catch { toast.error('Failed to seed mentors') }
              }}
              className="mt-3 px-4 py-2 rounded-lg bg-emerald-700 text-white text-xs font-medium hover:bg-emerald-800 transition-colors"
            >
              Seed Real Mentor Profiles
            </button>
          )}
        </div>
      </motion.div>

      {/* Mentor Cards */}
      {mentors.length > 0 ? (
        <motion.div
          variants={staggerContainer} initial="initial" animate="animate"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-5"
        >
          {mentors.map((m, i) => <MentorCard key={m.id} mentor={m} index={i} onBookSession={setBookingMentor} />)}
        </motion.div>
      ) : (
        <div className="bg-white/80 rounded-xl border border-gray-200/60 p-6 mb-5 text-center">
          <Users size={20} className="mx-auto text-gray-300 mb-2" />
          <p className="text-sm text-gray-400">No mentors available yet. Check back soon!</p>
        </div>
      )}

      {/* My Mentorship Sessions */}
      {mySessions.length > 0 && (
        <motion.div
          variants={fadeInUp} initial="initial" animate="animate"
          transition={{ ...fadeInUpTransition, delay: 0.1 }}
          className="mb-5"
        >
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <MessageSquare size={14} className="text-emerald-600" />
              My Mentorship Sessions
              <span className="text-xs text-gray-400 font-normal">({mySessions.length})</span>
            </h2>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {mySessions.map(session => (
                <MentorshipSessionCard
                  key={session.id}
                  session={session}
                  viewAs="student"
                  onClick={() => router.push(`/dashboard/mentorship/chat/${session.id}`)}
                />
              ))}
            </div>
          </div>
        </motion.div>
      )}
      {mySessions.length === 0 && mentors.length > 0 && (
        <motion.div
          variants={fadeInUp} initial="initial" animate="animate"
          transition={{ ...fadeInUpTransition, delay: 0.1 }}
          className="mb-5"
        >
          <div className="bg-white/60 rounded-xl border border-gray-100 p-4 text-center">
            <p className="text-xs text-gray-400">No mentorship sessions yet. Book a session with a mentor above!</p>
          </div>
        </motion.div>
      )}

      {/* Book Session Modal */}
      {bookingMentor && (
        <BookSessionModal
          mentor={{ id: bookingMentor.id, name: bookingMentor.name, specialization: bookingMentor.specialization }}
          isOpen={!!bookingMentor}
          onClose={() => setBookingMentor(null)}
          onBooked={fetchMySessions}
        />
      )}

      {/* Main Content: Chat + Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Chat Area — spans 2 cols */}
        <motion.div
          variants={fadeInUp} initial="initial" animate="animate"
          transition={{ ...fadeInUpTransition, delay: 0.15 }}
          className="lg:col-span-2"
        >
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col" style={{ height: 'calc(100vh - 380px)', minHeight: '420px' }}>
            {/* Chat Header */}
            <div className="px-5 py-3.5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs font-medium text-gray-600">
                  Mentorship Assistant
                </span>
                <span className="text-[10px] text-gray-400">
                  — knows your profile & activity
                </span>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4" style={{ background: 'linear-gradient(180deg, #fafbfc 0%, #f3f4f6 100%)' }}>
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center px-4">
 <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-green-600 mb-4">
                    <MessageSquare size={24} />
                  </div>
                  <h3 className="text-base font-semibold text-gray-800 mb-1.5">
                    Hi{user?.name ? `, ${user.name.split(' ')[0]}` : ''}! How can I help today?
                  </h3>
                  <p className="text-xs text-gray-400 mb-5 max-w-sm">
                    I have context from your profile, career sessions, and job activity.
                    Ask me anything about your career journey.
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {quickSuggestions.map(s => (
                      <button
                        key={s}
                        onClick={() => sendMessage(s)}
                        className="px-3 py-1.5 rounded-full border border-gray-200 text-xs text-gray-600 hover:bg-white hover:border-green-300 hover:text-green-700 transition-all duration-200"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-green-800 text-white rounded-br-md shadow-sm'
                        : 'bg-white text-gray-800 border border-gray-150 rounded-bl-md shadow-sm'
                    }`}>
                      {msg.role === 'assistant' ? (
                        <div className="prose prose-sm prose-gray max-w-none [&>p]:my-1 [&>ul]:my-1 [&>ol]:my-1">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {msg.content || '...'}
                          </ReactMarkdown>
                        </div>
                      ) : (
                        <span className="whitespace-pre-wrap">{msg.content}</span>
                      )}
                    </div>
                  </div>
                ))
              )}
              {streaming && messages[messages.length - 1]?.content === '' && <TypingIndicator />}
              <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <div className="px-4 py-3 border-t border-gray-100 bg-white">
              <div className="flex items-end gap-2">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Share what's on your mind..."
                  rows={1}
                  disabled={streaming}
                  className="flex-1 resize-none px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all disabled:opacity-50"
                />
                <button
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || streaming}
                  className="w-10 h-10 rounded-xl bg-green-800 text-white flex items-center justify-center hover:bg-green-900 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                >
                  {streaming ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                </button>
              </div>
              <p className="text-[10px] text-gray-300 mt-1.5 text-center">Powered by IKLAVYA AI</p>
            </div>
          </div>
        </motion.div>

        {/* Activity Timeline — 1 col */}
        <motion.div
          variants={fadeInUp} initial="initial" animate="animate"
          transition={{ ...fadeInUpTransition, delay: 0.2 }}
        >
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5" style={{ height: 'calc(100vh - 380px)', minHeight: '420px', overflowY: 'auto' }}>
            <h2 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Clock size={14} className="text-gray-500" />
              Your Activity
            </h2>

            {!activity ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 size={18} className="animate-spin text-gray-300" />
              </div>
            ) : (
              <div className="space-y-1">
                {/* Profile Completion */}
                <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-gray-50">
 <div className="w-7 h-7 rounded-lg flex items-center justify-center text-green-600 shrink-0">
                    <Users size={13} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-700">Profile</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-500 rounded-full transition-all"
                          style={{ width: `${activity.profile_completion}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-gray-400 font-medium">{activity.profile_completion}%</span>
                    </div>
                  </div>
                </div>

                {/* Resumes */}
                <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors">
 <div className="w-7 h-7 rounded-lg flex items-center justify-center text-purple-600 shrink-0">
                    <FileText size={13} />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-gray-700">{activity.resume_count} resume{activity.resume_count !== 1 ? 's' : ''} built</p>
                  </div>
                </div>

                {/* Recent Sessions */}
                {activity.sessions.length > 0 && (
                  <>
                    <div className="pt-3 pb-1">
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-3">Recent Sessions</p>
                    </div>
                    {activity.sessions.map((s, i) => (
                      <div key={i} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors">
 <div className="w-7 h-7 rounded-lg flex items-center justify-center text-blue-600 shrink-0">
                          <MessageSquare size={13} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-gray-700 truncate">{s.title}</p>
                          <p className="text-[10px] text-gray-400">{formatDate(s.date)} · {s.questions} questions</p>
                        </div>
                        <ChevronRight size={12} className="text-gray-300 shrink-0" />
                      </div>
                    ))}
                  </>
                )}

                {/* Job Clicks */}
                {activity.job_clicks.length > 0 && (
                  <>
                    <div className="pt-3 pb-1">
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-3">Jobs Explored</p>
                    </div>
                    {activity.job_clicks.map((j, i) => (
                      <div key={i} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors">
 <div className="w-7 h-7 rounded-lg flex items-center justify-center text-amber-600 shrink-0">
                          <Briefcase size={13} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-gray-700 truncate">{j.title}</p>
                          <p className="text-[10px] text-gray-400">{j.company} · {formatDate(j.date)}</p>
                        </div>
                      </div>
                    ))}
                  </>
                )}

                {activity.sessions.length === 0 && activity.job_clicks.length === 0 && (
                  <div className="text-center py-6">
                    <BookOpen size={20} className="mx-auto text-gray-300 mb-2" />
                    <p className="text-xs text-gray-400">Start exploring to build your timeline</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
