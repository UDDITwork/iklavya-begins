'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Bell, Mail, MessageCircle, Award, BookOpen, Zap, CheckCircle2, Sparkles, Users, Briefcase } from 'lucide-react'
import { useNotificationStore, AppNotification } from '@/store/notification-store'

const typeConfig: Record<string, { icon: typeof Bell; color: string }> = {
  welcome: { icon: Sparkles, color: '#059669' },
  module_completed: { icon: BookOpen, color: '#059669' },
  mentor_reply: { icon: MessageCircle, color: '#166534' },
  session_accepted: { icon: CheckCircle2, color: '#166534' },
  session_rejected: { icon: Mail, color: '#991B1B' },
  session_requested: { icon: Users, color: '#2563EB' },
  cert_earned: { icon: Award, color: '#92400E' },
  assessment_passed: { icon: Award, color: '#166534' },
  assessment_failed: { icon: BookOpen, color: '#991B1B' },
  assessment_available: { icon: Zap, color: '#166534' },
  job_applied: { icon: Briefcase, color: '#7C3AED' },
  profile_reminder: { icon: Bell, color: '#6B7280' },
  system: { icon: Bell, color: '#6B7280' },
}

function timeAgo(dateStr: string) {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diff = Math.max(0, now - then)
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

export default function NotificationStream() {
  const router = useRouter()
  const { notifications, unreadCount, setNotifications, setUnreadCount, markRead, markAllRead, detectNewNotifications } =
    useNotificationStore()

  const fetchNotifications = useCallback(async () => {
    if (document.visibilityState === 'hidden') return
    try {
      const [listRes, countRes] = await Promise.all([
        fetch('/api/notifications'),
        fetch('/api/notifications/unread'),
      ])
      if (listRes.ok) {
        const data = await listRes.json()
        const notifs = data.notifications || []
        setNotifications(notifs)
        // Keep knownIds in sync (won't show duplicate toasts due to toast ID dedup)
        detectNewNotifications(notifs)
      }
      if (countRes.ok) {
        const data = await countRes.json()
        setUnreadCount(data.count || 0)
      }
    } catch {
      // silent
    }
  }, [setNotifications, setUnreadCount, detectNewNotifications])

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 30000)

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') fetchNotifications()
    }
    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      clearInterval(interval)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [fetchNotifications])

  async function handleMarkRead(notif: AppNotification) {
    if (notif.is_read === 0) {
      markRead(notif.id)
      fetch(`/api/notifications/${notif.id}/read`, { method: 'POST' }).catch(() => {})
    }
    if (notif.link) {
      router.push(notif.link)
    }
  }

  async function handleMarkAllRead() {
    markAllRead()
    fetch('/api/notifications/read-all', { method: 'POST' }).catch(() => {})
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Bell size={20} className="text-gray-500" />
            {unreadCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-red-500
                flex items-center justify-center text-[9px] font-bold text-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </div>
          <h3 className="font-semibold text-gray-900">Notifications</h3>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="text-xs text-green-800 hover:text-green-900 transition-colors"
          >
            Mark all read
          </button>
        )}
      </div>

      <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
        {notifications.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">No notifications yet</p>
        ) : (
          <AnimatePresence initial={false}>
            {notifications.map((notif) => {
              const config = typeConfig[notif.type] || typeConfig.system
              return (
                <motion.div
                  key={notif.id}
                  layout
                  initial={{ opacity: 0, x: 30, height: 0 }}
                  animate={{ opacity: 1, x: 0, height: 'auto' }}
                  exit={{ opacity: 0, x: -30, height: 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  onClick={() => handleMarkRead(notif)}
                  className={`flex items-start gap-3 p-3 rounded-xl border transition-colors cursor-pointer ${
                    notif.is_read === 0
                      ? 'bg-green-50/30 border-green-200 hover:bg-green-50/60'
                      : 'bg-white border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: `${config.color}10` }}
                  >
                    <config.icon size={16} style={{ color: config.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-sm truncate ${
                        notif.is_read === 0 ? 'font-semibold text-gray-900' : 'font-medium text-gray-800'
                      }`}>
                        {notif.title}
                      </span>
                      <span className="text-[10px] text-gray-400 shrink-0">
                        {timeAgo(notif.created_at)}
                      </span>
                    </div>
                    {notif.message && (
                      <p className="text-xs text-gray-500 mt-0.5 truncate">
                        {notif.message}
                      </p>
                    )}
                  </div>
                  {notif.is_read === 0 && (
                    <span className="w-2 h-2 rounded-full bg-green-500 shrink-0 mt-2" />
                  )}
                </motion.div>
              )
            })}
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}
