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
  { type: 'achievement', title: 'Certificate Earned!', message: 'You completed the Communication Mastery course', time: '2m ago' },
  { type: 'quiz', title: 'Live Quiz Starting', message: 'Negotiation Skills quiz begins in 5 minutes', time: '5m ago' },
  { type: 'whatsapp', title: 'Mentor Message', message: 'Dr. Sharma: "Great progress on your confidence scores!"', time: '10m ago' },
  { type: 'email', title: 'Interview Scheduled', message: 'Sales Pitch simulation with AI at 3:00 PM tomorrow', time: '1h ago' },
  { type: 'course', title: 'New Course Available', message: 'Conflict Resolution Strategies just launched', time: '2h ago' },
  { type: 'system', title: 'Profile Reminder', message: 'Complete your profile to unlock all features', time: '3h ago' },
]

const typeConfig = {
  whatsapp: { icon: MessageCircle, color: '#166534' },
  email: { icon: Mail, color: '#1E40AF' },
  achievement: { icon: Award, color: '#92400E' },
  course: { icon: BookOpen, color: '#1E40AF' },
  quiz: { icon: Zap, color: '#991B1B' },
  system: { icon: Bell, color: '#6B7280' },
}

export default function NotificationStream() {
  const [notifications, setNotifications] = useState<Notification[]>(
    sampleNotifications.map((n, i) => ({ ...n, id: i }))
  )
  const [newCount, setNewCount] = useState(3)

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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Bell size={20} className="text-gray-500" />
            {newCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-red-500
                flex items-center justify-center text-[9px] font-bold text-white">
                {newCount > 9 ? '9+' : newCount}
              </span>
            )}
          </div>
          <h3 className="font-semibold text-gray-900">Notifications</h3>
        </div>
        <button
          onClick={() => setNewCount(0)}
          className="text-xs text-blue-800 hover:text-blue-900 transition-colors"
        >
          Mark all read
        </button>
      </div>

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
                className="flex items-start gap-3 p-3 rounded-xl bg-white border border-gray-200
                  hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: `${config.color}10` }}
                >
                  <config.icon size={16} style={{ color: config.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium text-gray-800 truncate">
                      {notif.title}
                    </span>
                    <span className="text-[10px] text-gray-400 shrink-0">{notif.time}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5 truncate">
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
