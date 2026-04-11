'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import {
  Users, BookOpen, Award, Activity, Download, Filter,
  ArrowUp, ArrowDown, Target, Mic, FileText, Zap, Flame,
  Plus, Send, Loader2, CheckCircle, Trash2, RefreshCw
} from 'lucide-react'
import toast from 'react-hot-toast'
import HeatmapVisualization from '@/components/features/HeatmapVisualization'

const metrics = [
  { label: 'Total Students', value: 52847, change: +12.5, icon: Users, color: '#166534' },
  { label: 'Courses Completed', value: 128439, change: +8.3, icon: BookOpen, color: '#166534' },
  { label: 'Certifications', value: 34201, change: +15.2, icon: Award, color: '#92400E' },
  { label: 'Active Sessions', value: 1847, change: -3.1, icon: Activity, color: '#166534' },
]

const funnelStages = [
  { name: 'Signups', count: 52847, width: 100 },
  { name: 'Profile Complete', count: 41200, width: 78 },
  { name: 'Course Started', count: 28500, width: 54 },
  { name: 'Course Completed', count: 18200, width: 34 },
  { name: 'Certified', count: 12400, width: 23 },
]

const feedIcons: Record<string, React.ElementType> = {
  quiz: Target,
  certification: Award,
  course: BookOpen,
  mentor: Users,
  interview: Mic,
  resume: FileText,
  broadcast: Zap,
  streak: Flame,
}

const activityFeed = [
  { user: 'Priya S.', action: 'completed Communication Skills quiz', time: '2m ago', iconKey: 'quiz', color: '#166534' },
  { user: 'Rahul V.', action: 'earned Sales & Persuasion certification', time: '5m ago', iconKey: 'certification', color: '#92400E' },
  { user: 'Ananya D.', action: 'started Leadership Fundamentals course', time: '8m ago', iconKey: 'course', color: '#166534' },
  { user: 'Vikram P.', action: 'booked mentor session', time: '12m ago', iconKey: 'mentor', color: '#166534' },
  { user: 'Sneha I.', action: 'completed mock interview', time: '15m ago', iconKey: 'interview', color: '#166534' },
  { user: 'Arjun M.', action: 'updated resume (ATS: 92)', time: '18m ago', iconKey: 'resume', color: '#6B7280' },
  { user: 'Deepika R.', action: 'joined live quiz broadcast', time: '20m ago', iconKey: 'broadcast', color: '#92400E' },
  { user: 'Kiran T.', action: 'achieved 7-day streak', time: '25m ago', iconKey: 'streak', color: '#991B1B' },
]

function AnimatedMetric({ value, change }: { value: number; change: number }) {
  const [displayed, setDisplayed] = useState(0)

  useEffect(() => {
    const duration = 1500
    const start = Date.now()
    const animate = () => {
      const elapsed = Date.now() - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplayed(Math.round(value * eased))
      if (progress < 1) requestAnimationFrame(animate)
    }
    requestAnimationFrame(animate)
  }, [value])

  return (
    <div>
      <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900">
        {displayed.toLocaleString()}
      </div>
      <div className={`flex items-center gap-1 text-xs mt-1 ${change >= 0 ? 'text-green-700' : 'text-red-700'}`}>
        {change >= 0 ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
        {Math.abs(change)}% this month
      </div>
    </div>
  )
}

interface AdminQuiz {
  id: string
  title: string
  category: string
  question_count: number
  total_attempts: number
  is_active: number
  last_broadcast_at: string | null
  created_at: string
}

function QuizBroadcastPanel() {
  const [quizzes, setQuizzes] = useState<AdminQuiz[]>([])
  const [seeding, setSeeding] = useState(false)
  const [rebroadcasting, setRebroadcasting] = useState<string | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [creating, setCreating] = useState(false)

  // Create form state
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('general')
  const [description, setDescription] = useState('')
  const [questions, setQuestions] = useState([
    { question: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_option: 'a', explanation: '' },
  ])

  useEffect(() => { loadQuizzes() }, [])

  async function loadQuizzes() {
    try {
      const res = await fetch('/api/broadcast-quiz')
      if (res.ok) {
        const data = await res.json()
        setQuizzes(data.quizzes || [])
      }
    } catch { /* silent */ }
  }

  async function handleSeed() {
    setSeeding(true)
    try {
      const res = await fetch('/api/broadcast-quiz/seed', { method: 'POST' })
      const data = await res.json()
      if (res.ok) {
        toast.success(`Seeded ${data.seeded} quizzes, notified ${data.students_notified} students`)
        loadQuizzes()
      } else {
        toast.error(data.error || data.message || 'Failed')
      }
    } catch { toast.error('Failed to seed') }
    finally { setSeeding(false) }
  }

  async function handleRebroadcast(quizId: string) {
    setRebroadcasting(quizId)
    try {
      const res = await fetch(`/api/broadcast-quiz/${quizId}/rebroadcast`, { method: 'POST' })
      const data = await res.json()
      if (res.ok) {
        toast.success(`Reminded ${data.reminded} students`)
      }
    } catch { toast.error('Failed') }
    finally { setRebroadcasting(null) }
  }

  function addQuestion() {
    setQuestions(prev => [...prev, { question: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_option: 'a', explanation: '' }])
  }

  function removeQuestion(i: number) {
    if (questions.length <= 2) return
    setQuestions(prev => prev.filter((_, idx) => idx !== i))
  }

  function updateQuestion(i: number, field: string, value: string) {
    setQuestions(prev => prev.map((q, idx) => idx === i ? { ...q, [field]: value } : q))
  }

  async function handleCreate() {
    if (!title.trim()) { toast.error('Title required'); return }
    const valid = questions.every(q => q.question && q.option_a && q.option_b && q.option_c && q.option_d)
    if (!valid) { toast.error('Fill all question fields'); return }

    setCreating(true)
    try {
      const res = await fetch('/api/broadcast-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description: description || null,
          category,
          time_per_question: 30,
          broadcast_interval_hours: 4,
          questions,
        }),
      })
      const data = await res.json()
      if (res.ok) {
        toast.success(`Quiz created! ${data.students_notified} students notified`)
        setShowCreate(false)
        setTitle('')
        setDescription('')
        setQuestions([{ question: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_option: 'a', explanation: '' }])
        loadQuizzes()
      } else {
        toast.error(data.error || 'Failed')
      }
    } catch { toast.error('Failed') }
    finally { setCreating(false) }
  }

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Quiz Broadcast</h3>
          <p className="text-[13px] text-gray-500">Create quizzes and broadcast them as notifications to all students</p>
        </div>
        <div className="flex gap-2">
          {quizzes.length === 0 && (
            <button
              onClick={handleSeed}
              disabled={seeding}
              className="flex items-center gap-2 h-9 px-4 rounded-lg border border-gray-300 text-[13px] font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              {seeding ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} />}
              Seed 4 Sample Quizzes
            </button>
          )}
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="flex items-center gap-2 h-9 px-4 rounded-lg bg-violet-600 text-white text-[13px] font-semibold hover:bg-violet-700 transition-colors"
          >
            <Plus size={14} /> Create Quiz
          </button>
        </div>
      </div>

      {/* Create form */}
      {showCreate && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="rounded-xl border border-gray-200 bg-white p-5 mb-4 overflow-hidden"
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Quiz title"
              className="px-3 py-2 rounded-lg border border-gray-200 text-[13px] focus:outline-none focus:ring-2 focus:ring-violet-200"
            />
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="px-3 py-2 rounded-lg border border-gray-200 text-[13px] focus:outline-none focus:ring-2 focus:ring-violet-200"
            >
              <option value="general">General</option>
              <option value="banking">Banking</option>
              <option value="communication">Communication</option>
              <option value="aptitude">Aptitude</option>
            </select>
            <input
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Description (optional)"
              className="px-3 py-2 rounded-lg border border-gray-200 text-[13px] focus:outline-none focus:ring-2 focus:ring-violet-200"
            />
          </div>

          <h4 className="text-[12px] font-semibold text-gray-500 uppercase tracking-wider mb-3">Questions</h4>
          <div className="space-y-4">
            {questions.map((q, i) => (
              <div key={i} className="p-4 rounded-lg border border-gray-100 bg-gray-50/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[12px] font-semibold text-gray-400">Q{i + 1}</span>
                  {questions.length > 2 && (
                    <button onClick={() => removeQuestion(i)} className="text-gray-400 hover:text-red-500 transition-colors">
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
                <input
                  value={q.question}
                  onChange={e => updateQuestion(i, 'question', e.target.value)}
                  placeholder="Question text"
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-[13px] mb-2 focus:outline-none focus:ring-2 focus:ring-violet-200"
                />
                <div className="grid grid-cols-2 gap-2 mb-2">
                  {(['a', 'b', 'c', 'd'] as const).map(opt => (
                    <div key={opt} className="flex items-center gap-1.5">
                      <input
                        type="radio"
                        name={`correct-${i}`}
                        checked={q.correct_option === opt}
                        onChange={() => updateQuestion(i, 'correct_option', opt)}
                        className="accent-violet-600"
                      />
                      <input
                        value={q[`option_${opt}` as keyof typeof q]}
                        onChange={e => updateQuestion(i, `option_${opt}`, e.target.value)}
                        placeholder={`Option ${opt.toUpperCase()}`}
                        className="flex-1 px-2.5 py-1.5 rounded-md border border-gray-200 text-[12px] focus:outline-none focus:ring-2 focus:ring-violet-200"
                      />
                    </div>
                  ))}
                </div>
                <input
                  value={q.explanation}
                  onChange={e => updateQuestion(i, 'explanation', e.target.value)}
                  placeholder="Explanation (optional)"
                  className="w-full px-3 py-1.5 rounded-md border border-gray-200 text-[12px] focus:outline-none focus:ring-2 focus:ring-violet-200"
                />
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between mt-4">
            <button
              onClick={addQuestion}
              className="flex items-center gap-1 text-[12px] font-medium text-violet-600 hover:text-violet-700"
            >
              <Plus size={12} /> Add Question
            </button>
            <div className="flex gap-2">
              <button
                onClick={() => setShowCreate(false)}
                className="h-9 px-4 rounded-lg text-[13px] font-medium text-gray-500 hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={creating}
                className="flex items-center gap-2 h-9 px-5 rounded-lg bg-violet-600 text-white text-[13px] font-semibold hover:bg-violet-700 disabled:opacity-50 transition-colors"
              >
                {creating ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                Create & Broadcast
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Quiz list */}
      {quizzes.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
          <div className="divide-y divide-gray-100">
            {quizzes.map(quiz => (
              <div key={quiz.id} className="flex items-center gap-4 px-5 py-3.5">
                <div className="w-9 h-9 rounded-lg bg-violet-100 flex items-center justify-center shrink-0">
                  <Zap size={16} className="text-violet-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[14px] font-semibold text-gray-900">{quiz.title}</span>
                  <div className="flex items-center gap-3 text-[12px] text-gray-400 mt-0.5">
                    <span className="capitalize">{quiz.category}</span>
                    <span>·</span>
                    <span>{quiz.question_count} questions</span>
                    <span>·</span>
                    <span>{quiz.total_attempts} attempts</span>
                  </div>
                </div>
                <button
                  onClick={() => handleRebroadcast(quiz.id)}
                  disabled={rebroadcasting === quiz.id}
                  className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-gray-200 text-[12px] font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                >
                  {rebroadcasting === quiz.id ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
                  Re-broadcast
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function AdminPage() {
  const [feedItems, setFeedItems] = useState(activityFeed)

  useEffect(() => {
    const interval = setInterval(() => {
      const randomItem = activityFeed[Math.floor(Math.random() * activityFeed.length)]
      setFeedItems((prev) => [
        { ...randomItem, time: 'Just now', user: randomItem.user },
        ...prev.slice(0, 9),
      ])
    }, 10000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-3 sm:gap-4"
        >
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-2">Admin Dashboard</h1>
            <p className="text-gray-500">Mission control for Iklavya platform</p>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 rounded-lg bg-white border border-gray-300 text-sm text-gray-600
              hover:bg-gray-50 transition-colors flex items-center gap-2">
              <Filter size={14} /> Filters
            </button>
            <button className="px-4 py-2 rounded-lg border-2 border-green-800 bg-white hover:bg-green-50
              text-green-800 text-sm font-medium flex items-center gap-2 transition-colors">
              <Download size={14} /> Export
            </button>
          </div>
        </motion.div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4 mb-8">
          {metrics.map((metric, i) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="rounded-xl bg-white border border-gray-200 shadow-sm p-5
                hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-center justify-between mb-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ background: `${metric.color}10` }}
                >
                  <metric.icon size={18} style={{ color: metric.color }} />
                </div>
              </div>
              <AnimatedMetric value={metric.value} change={metric.change} />
              <div className="text-xs text-gray-400 mt-1">{metric.label}</div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
          {/* Heatmap + Funnel */}
          <div className="md:col-span-2 space-y-6">
            {/* Heatmap */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="rounded-xl bg-white border border-gray-200 shadow-sm p-5"
            >
              <div className="overflow-x-auto">
                <HeatmapVisualization title="Platform Activity (Sessions by Day & Hour)" />
              </div>
            </motion.div>

            {/* Conversion Funnel */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="rounded-xl bg-white border border-gray-200 shadow-sm p-5"
            >
              <h4 className="text-sm font-medium text-gray-500 mb-6">Conversion Funnel</h4>
              <div className="space-y-3">
                {funnelStages.map((stage, i) => {
                  const dropoff = i > 0
                    ? Math.round((1 - stage.count / funnelStages[i - 1].count) * 100)
                    : 0
                  return (
                    <div key={stage.name} className="relative">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-gray-600">{stage.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-900 font-medium">
                            {stage.count.toLocaleString()}
                          </span>
                          {dropoff > 0 && (
                            <span className="text-red-600 text-[10px]">
                              -{dropoff}%
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="h-6 bg-gray-50 rounded-lg overflow-hidden">
                        <motion.div
                          className="h-full rounded-lg bg-green-100"
                          initial={{ width: 0 }}
                          animate={{ width: `${stage.width}%` }}
                          transition={{ duration: 1, delay: 0.5 + i * 0.15, ease: 'easeOut' }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </motion.div>
          </div>

          {/* Live Activity Feed */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="rounded-xl bg-white border border-gray-200 shadow-sm p-5 max-h-[600px] overflow-hidden"
          >
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-medium text-gray-500">Live Activity</h4>
              <div className="w-2 h-2 rounded-full bg-green-500" />
            </div>
            <div className="space-y-3 overflow-y-auto max-h-[520px] pr-1">
              {feedItems.map((item, i) => {
                const FeedIcon = (feedIcons[item.iconKey] || Target) as typeof Target
                return (
                  <motion.div
                    key={`${item.user}-${item.time}-${i}`}
                    initial={i === 0 ? { opacity: 0, y: -10 } : false}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: `${item.color}10` }}
                    >
                      <FeedIcon size={14} style={{ color: item.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-600">
                        <span className="font-medium text-gray-900">{item.user}</span>{' '}
                        {item.action}
                      </p>
                      <span className="text-[11px] sm:text-xs text-gray-400">{item.time}</span>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        </div>

        {/* Quiz Broadcast Section */}
        <QuizBroadcastPanel />
      </div>
    </div>
  )
}
