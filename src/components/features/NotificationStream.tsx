'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { Bell, Mail, MessageCircle, Award, BookOpen, Zap } from 'lucide-react'

interface Notification {
  id: number
  type: 'whatsapp' | 'email' | 'achievement' | 'course' | 'quiz' | 'system'
  title: string
  message: string
  time: string
}

const sampleNotifications: Omit<Notification, 'id'>[] = [
  { type: 'achievement', title: 'Certificate Earned!', message: 'You completed the Python Advanced course', time: '2m ago' },
  { type: 'quiz', title: 'Live Quiz Starting', message: 'Data Structures quiz begins in 5 minutes', time: '5m ago' },
  { type: 'whatsapp', title: 'Mentor Message', message: 'Dr. Sharma: "Great progress on your resume!"', time: '10m ago' },
  { type: 'email', title: 'Interview Scheduled', message: 'Mock interview with AI at 3:00 PM tomorrow', time: '1h ago' },
  { type: 'course', title: 'New Course Available', message: 'Machine Learning Fundamentals just launched', time: '2h ago' },
  { type: 'system', title: 'Profile Reminder', message: 'Complete your profile to unlock all features', time: '3h ago' },
]

const typeConfig = {
  whatsapp: { icon: MessageCircle, color: '#25d366' },
  email: { icon: Mail, color: '#3b82f6' },
  achievement: { icon: Award, color: '#f59e0b' },
  course: { icon: BookOpen, color: '#8b5cf6' },
  quiz: { icon: Zap, color: '#ef4444' },
  system: { icon: Bell, color: '#6b7280' },
}

export default function NotificationStream() {
  const [notifications, setNotifications] = useState<Notification[]>(
    sampleNotifications.map((n, i) => ({ ...n, id: i }))
  )
  const [newCount, setNewCount] = useState(3)

  // Simulate new notification arrival
  useEffect(() => {
    const interval = setInterval(() => {
      const sample = sampleNotifications[Math.floor(Math.random() * sampleNotifications.length)]
      const newNotif: Notification = {
        ...sample,
        id: Date.now(),
        time: 'Just now',
      }
      setNotifications((prev) => [newNotif, ...prev.slice(0, 9)])
      setNewCount((c) => c + 1)
    }, 8000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="relative">
            <motion.div
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 3 }}
            >
              <Bell size={20} className="text-white/60" />
            </motion.div>
            {newCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-red-500
                  flex items-center justify-center text-[9px] font-bold text-white animate-pulse"
              >
                {newCount > 9 ? '9+' : newCount}
              </motion.span>
            )}
          </div>
          <h3 className="font-semibold">Notifications</h3>
        </div>
        <button
          onClick={() => setNewCount(0)}
          className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
        >
          Mark all read
        </button>
      </div>

      {/* Notification List */}
      <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
        <AnimatePresence initial={false}>
          {notifications.map((notif) => {
            const config = typeConfig[notif.type]
            return (
              <motion.div
                key={notif.id}
                layout
                initial={{ opacity: 0, x: 30, height: 0 }}
                animate={{ opacity: 1, x: 0, height: 'auto' }}
                exit={{ opacity: 0, x: -30, height: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5
                  hover:bg-white/[0.04] hover:border-white/10 transition-colors cursor-pointer group"
              >
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: `${config.color}15` }}
                >
                  <config.icon size={16} style={{ color: config.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium text-white/80 truncate">
                      {notif.title}
                    </span>
                    <span className="text-[10px] text-white/20 shrink-0">{notif.time}</span>
                  </div>
                  <p className="text-xs text-white/40 mt-0.5 truncate">
                    {notif.message}
                  </p>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </div>
  )
}
