'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import {
  Users, BookOpen, Award, TrendingUp, TrendingDown,
  Activity, Download, Filter, ArrowUp, ArrowDown
} from 'lucide-react'
import ParticleField from '@/components/animations/ParticleField'
import HeatmapVisualization from '@/components/features/HeatmapVisualization'

const metrics = [
  { label: 'Total Students', value: 52847, change: +12.5, icon: Users, color: '#3b82f6' },
  { label: 'Courses Completed', value: 128439, change: +8.3, icon: BookOpen, color: '#8b5cf6' },
  { label: 'Certifications', value: 34201, change: +15.2, icon: Award, color: '#f59e0b' },
  { label: 'Active Sessions', value: 1847, change: -3.1, icon: Activity, color: '#10b981' },
]

const funnelStages = [
  { name: 'Signups', count: 52847, width: 100 },
  { name: 'Profile Complete', count: 41200, width: 78 },
  { name: 'Course Started', count: 28500, width: 54 },
  { name: 'Course Completed', count: 18200, width: 34 },
  { name: 'Certified', count: 12400, width: 23 },
]

const activityFeed = [
  { user: 'Priya S.', action: 'completed Python Advanced quiz', time: '2m ago', icon: '🎯' },
  { user: 'Rahul V.', action: 'earned React certification', time: '5m ago', icon: '🏆' },
  { user: 'Ananya D.', action: 'started System Design course', time: '8m ago', icon: '📚' },
  { user: 'Vikram P.', action: 'booked mentor session', time: '12m ago', icon: '👨‍🏫' },
  { user: 'Sneha I.', action: 'completed mock interview', time: '15m ago', icon: '🎤' },
  { user: 'Arjun M.', action: 'updated resume (ATS: 92)', time: '18m ago', icon: '📝' },
  { user: 'Deepika R.', action: 'joined live quiz broadcast', time: '20m ago', icon: '⚡' },
  { user: 'Kiran T.', action: 'achieved 7-day streak', time: '25m ago', icon: '🔥' },
]

function AnimatedMetric({ value, change }: { value: number; change: number }) {
  const [displayed, setDisplayed] = useState(0)

  useEffect(() => {
    const duration = 1500
    const start = Date.now()
    const animate = () => {
      const elapsed = Date.now() - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3) // ease-out cubic
      setDisplayed(Math.round(value * eased))
      if (progress < 1) requestAnimationFrame(animate)
    }
    requestAnimationFrame(animate)
  }, [value])

  return (
    <div>
      <div className="text-2xl md:text-3xl font-bold text-white">
        {displayed.toLocaleString()}
      </div>
      <div className={`flex items-center gap-1 text-xs mt-1 ${change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
        {change >= 0 ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
        {Math.abs(change)}% this month
      </div>
    </div>
  )
}

export default function AdminPage() {
  const [feedItems, setFeedItems] = useState(activityFeed)

  // Simulate live feed
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
    <div className="min-h-screen bg-[#030014] relative overflow-hidden">
      <ParticleField particleCount={30} className="opacity-15" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold gradient-text mb-2">Admin Dashboard</h1>
            <p className="text-white/40">Mission control for Iklavya platform</p>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 rounded-xl glass text-sm text-white/50 hover:text-white/80 transition-colors flex items-center gap-2">
              <Filter size={14} /> Filters
            </button>
            <button className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500
              text-white text-sm font-medium flex items-center gap-2">
              <Download size={14} /> Export
            </button>
          </div>
        </motion.div>

        {/* Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {metrics.map((metric, i) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="rounded-xl glass p-5"
              whileHover={{ scale: 1.02, boxShadow: `0 0 20px ${metric.color}15` }}
            >
              <div className="flex items-center justify-between mb-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ background: `${metric.color}15` }}
                >
                  <metric.icon size={18} style={{ color: metric.color }} />
                </div>
              </div>
              <AnimatedMetric value={metric.value} change={metric.change} />
              <div className="text-xs text-white/30 mt-1">{metric.label}</div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Heatmap + Funnel */}
          <div className="lg:col-span-2 space-y-6">
            {/* Heatmap */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="rounded-xl glass p-5"
            >
              <HeatmapVisualization title="Platform Activity (Sessions by Day & Hour)" />
            </motion.div>

            {/* Conversion Funnel */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="rounded-xl glass p-5"
            >
              <h4 className="text-sm font-medium text-white/60 mb-6">Conversion Funnel</h4>
              <div className="space-y-3">
                {funnelStages.map((stage, i) => {
                  const dropoff = i > 0
                    ? Math.round((1 - stage.count / funnelStages[i - 1].count) * 100)
                    : 0
                  return (
                    <div key={stage.name} className="relative">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-white/60">{stage.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-white/80 font-medium">
                            {stage.count.toLocaleString()}
                          </span>
                          {dropoff > 0 && (
                            <span className="text-red-400/60 text-[10px]">
                              -{dropoff}%
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="h-6 bg-white/[0.02] rounded-lg overflow-hidden">
                        <motion.div
                          className="h-full rounded-lg bg-gradient-to-r from-blue-500/40 to-purple-500/40"
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
            className="rounded-xl glass p-5 max-h-[600px] overflow-hidden"
          >
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-medium text-white/60">Live Activity</h4>
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            </div>
            <div className="space-y-3 overflow-y-auto max-h-[520px] pr-1">
              {feedItems.map((item, i) => (
                <motion.div
                  key={`${item.user}-${item.time}-${i}`}
                  initial={i === 0 ? { opacity: 0, y: -10 } : false}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-white/[0.02] transition-colors"
                >
                  <span className="text-lg">{item.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-white/70">
                      <span className="font-medium text-white/90">{item.user}</span>{' '}
                      {item.action}
                    </p>
                    <span className="text-[10px] text-white/20">{item.time}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
