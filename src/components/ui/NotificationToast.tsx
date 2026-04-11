'use client'

import { motion } from 'framer-motion'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import {
  Bell, MessageCircle, Award, BookOpen, CheckCircle2, Mail,
  Zap, Users, Briefcase, Sparkles, X
} from 'lucide-react'
import { AppNotification } from '@/store/notification-store'
import { playPop } from '@/lib/sounds'

const typeConfig: Record<string, { icon: typeof Bell; color: string; bg: string }> = {
  welcome:          { icon: Sparkles,     color: '#059669', bg: '#ECFDF5' },
  module_completed: { icon: BookOpen,     color: '#059669', bg: '#ECFDF5' },
  assessment_passed:{ icon: Award,        color: '#166534', bg: '#DCFCE7' },
  assessment_failed:{ icon: BookOpen,     color: '#991B1B', bg: '#FEF2F2' },
  cert_earned:      { icon: Award,        color: '#92400E', bg: '#FFFBEB' },
  session_accepted: { icon: CheckCircle2, color: '#166534', bg: '#DCFCE7' },
  session_rejected: { icon: Mail,         color: '#991B1B', bg: '#FEF2F2' },
  session_requested:{ icon: Users,        color: '#2563EB', bg: '#EFF6FF' },
  mentor_reply:     { icon: MessageCircle,color: '#166534', bg: '#DCFCE7' },
  job_applied:      { icon: Briefcase,    color: '#7C3AED', bg: '#F5F3FF' },
  assessment_available: { icon: Zap,      color: '#166534', bg: '#DCFCE7' },
  quiz_broadcast:   { icon: Zap,          color: '#7C3AED', bg: '#F5F3FF' },
  system:           { icon: Bell,         color: '#6B7280', bg: '#F9FAFB' },
}

function NotificationToastCard({
  notif,
  toastId,
  visible,
}: {
  notif: AppNotification
  toastId: string
  visible: boolean
}) {
  const router = useRouter()
  const config = typeConfig[notif.type] || typeConfig.system
  const Icon = config.icon

  useEffect(() => {
    playPop()
  }, [])

  return (
    <motion.div
      initial={{ x: 120, opacity: 0, scale: 0.85 }}
      animate={visible ? { x: 0, opacity: 1, scale: 1 } : { x: 120, opacity: 0, scale: 0.85 }}
      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      onClick={() => {
        if (notif.link) router.push(notif.link)
        toast.dismiss(toastId)
      }}
      className="max-w-sm w-full bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden cursor-pointer hover:shadow-xl transition-shadow"
      style={{ borderLeft: `4px solid ${config.color}` }}
    >
      <div className="flex items-start gap-3 p-4">
        {/* Icon */}
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: config.bg }}
        >
          <Icon size={18} style={{ color: config.color }} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">
            {notif.title}
          </p>
          {notif.message && (
            <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
              {notif.message}
            </p>
          )}
          <p className="text-[10px] text-gray-400 mt-1">Just now</p>
        </div>

        {/* Dismiss */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            toast.dismiss(toastId)
          }}
          className="shrink-0 p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <X size={14} />
        </button>
      </div>

      {/* Progress bar auto-dismiss indicator */}
      <motion.div
        initial={{ scaleX: 1 }}
        animate={{ scaleX: 0 }}
        transition={{ duration: 5, ease: 'linear' }}
        className="h-0.5 origin-left"
        style={{ background: config.color, opacity: 0.4 }}
      />
    </motion.div>
  )
}

export function showNotificationToast(notif: AppNotification) {
  toast.custom(
    (t) => (
      <NotificationToastCard
        notif={notif}
        toastId={t.id}
        visible={t.visible}
      />
    ),
    {
      id: `notif-${notif.id}`,
      duration: 5000,
      position: 'top-right',
    }
  )
}
