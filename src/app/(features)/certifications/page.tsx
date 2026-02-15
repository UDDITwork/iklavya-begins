'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import {
  Award, Download, Share2, QrCode, Lock,
  MessageSquare, Handshake, Timer, Brain, TrendingUp, MonitorPlay,
  Star, Flame, Zap, Target
} from 'lucide-react'
import Image from 'next/image'
import CertificateShowcase from '@/components/illustrations/scenes/CertificateShowcase'

const certIcons: Record<string, React.ElementType> = {
  python: MessageSquare,
  react: Handshake,
  sql: Timer,
  ml: Brain,
  system: TrendingUp,
  comm: MonitorPlay,
}

const certificates = [
  { id: 1, title: 'Communication Mastery', issueDate: '2025-01-15', status: 'earned', grade: 'A', color: '#166534', iconKey: 'python' },
  { id: 2, title: 'Sales & Persuasion', issueDate: '2025-02-01', status: 'earned', grade: 'A+', color: '#166534', iconKey: 'react' },
  { id: 3, title: 'Time Management', issueDate: '2024-12-20', status: 'earned', grade: 'B+', color: '#92400E', iconKey: 'sql' },
  { id: 4, title: 'Leadership Skills', issueDate: '', status: 'in-progress', grade: '', color: '#166534', iconKey: 'ml', progress: 45 },
  { id: 5, title: 'Negotiation Expert', issueDate: '', status: 'locked', grade: '', color: '#991B1B', iconKey: 'system', progress: 0 },
  { id: 6, title: 'Public Speaking Pro', issueDate: '', status: 'locked', grade: '', color: '#6B7280', iconKey: 'comm', progress: 0 },
]

const badgeIcons: Record<string, React.ElementType> = {
  earlyAdopter: Star,
  quizMaster: Brain,
  streak: Flame,
  fastLearner: Zap,
  interviewReady: Target,
}

const badges = [
  { name: 'Early Adopter', iconKey: 'earlyAdopter', rarity: 'rare', color: '#92400E' },
  { name: 'Quiz Master', iconKey: 'quizMaster', rarity: 'epic', color: '#166534' },
  { name: '5-Day Streak', iconKey: 'streak', rarity: 'common', color: '#991B1B' },
  { name: 'Fast Learner', iconKey: 'fastLearner', rarity: 'rare', color: '#166534' },
  { name: 'Interview Ready', iconKey: 'interviewReady', rarity: 'legendary', color: '#166534' },
]

const rarityBorder: Record<string, string> = {
  common: 'border-gray-300',
  rare: 'border-green-300',
  epic: 'border-green-400',
  legendary: 'border-amber-400',
}

export default function CertificationsPage() {
  const [selectedCert, setSelectedCert] = useState<typeof certificates[0] | null>(null)
  const [showCeremony, setShowCeremony] = useState(false)

  const triggerCeremony = (cert: typeof certificates[0]) => {
    setSelectedCert(cert)
    setShowCeremony(true)
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header with illustration */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex items-center gap-6"
        >
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-2">Certifications & Badges</h1>
            <p className="text-gray-500">Your achievement trophy room</p>
          </div>
          <div className="hidden md:block w-48 h-40">
            <Image src="/certificates and achievement.png" alt="Certifications & Badges" width={200} height={160} className="object-contain w-full h-full" />
          </div>
        </motion.div>

        {/* Badge Showcase */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-10"
        >
          <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4">Micro-Credentials</h3>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {badges.map((badge, i) => {
              const BadgeIcon = (badgeIcons[badge.iconKey] || Star) as typeof Star
              return (
                <motion.div
                  key={badge.name}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.05 }}
                  className={`shrink-0 w-28 p-4 rounded-xl bg-white border shadow-sm text-center cursor-pointer
                    hover:shadow-md hover:-translate-y-1 transition-all duration-200 ${rarityBorder[badge.rarity]}`}
                >
                  <div
                    className="w-10 h-10 rounded-lg mx-auto mb-2 flex items-center justify-center"
                    style={{ background: `${badge.color}10` }}
                  >
                    <BadgeIcon size={20} style={{ color: badge.color }} />
                  </div>
                  <span className="text-[10px] text-gray-700 font-medium block">{badge.name}</span>
                  <span className="text-[9px] uppercase tracking-wider mt-1 block"
                    style={{ color: badge.color }}>
                    {badge.rarity}
                  </span>
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        {/* Certificate Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {certificates.map((cert, i) => {
            const CertIcon = (certIcons[cert.iconKey] || MessageSquare) as typeof MessageSquare
            return (
              <motion.div
                key={cert.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.08 }}
                className="rounded-2xl bg-white border border-gray-200 shadow-sm overflow-hidden group cursor-pointer
                  hover:shadow-md hover:-translate-y-1 transition-all duration-200"
                onClick={() => cert.status === 'earned' && triggerCeremony(cert)}
              >
                <div className="h-36 flex items-center justify-center relative bg-gray-50">
                  <CertIcon size={40} className="text-gray-300" />
                  {cert.status === 'locked' && (
                    <div className="absolute inset-0 bg-gray-100/80 flex items-center justify-center">
                      <Lock size={24} className="text-gray-400" />
                    </div>
                  )}
                  {cert.status === 'earned' && (
                    <div className="absolute top-3 right-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center"
                        style={{ background: `${cert.color}10` }}
                      >
                        <Award size={14} style={{ color: cert.color }} />
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-1">{cert.title}</h3>
                  {cert.status === 'earned' && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">{cert.issueDate}</span>
                      <span className="text-xs font-bold" style={{ color: cert.color }}>
                        Grade: {cert.grade}
                      </span>
                    </div>
                  )}
                  {cert.status === 'in-progress' && (
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-400">In Progress</span>
                        <span className="text-gray-600">{cert.progress}%</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ background: cert.color }}
                          initial={{ width: 0 }}
                          animate={{ width: `${cert.progress}%` }}
                          transition={{ duration: 1, delay: 0.5 }}
                        />
                      </div>
                    </div>
                  )}
                  {cert.status === 'locked' && (
                    <span className="text-xs text-gray-400">Complete prerequisites to unlock</span>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Ceremony Overlay */}
      <AnimatePresence>
        {showCeremony && selectedCert && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowCeremony(false)} />

            <motion.div
              className="relative w-full max-w-lg mx-4"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            >
              <div className="bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden">
                {/* Certificate */}
                <div className="bg-white p-8 text-center">
                  <div className="border-2 border-gray-200 p-6 rounded-lg">
                    <p className="text-xs text-gray-400 uppercase tracking-[0.3em] mb-2">Certificate of Completion</p>
                    <h2 className="text-2xl font-bold text-gray-900 mb-1">{selectedCert.title}</h2>
                    <p className="text-sm text-gray-500 mb-4">Awarded to <strong>Arjun Mehta</strong></p>
                    <p className="text-xs text-gray-400 mb-4">{selectedCert.issueDate}</p>
                    <div className="flex items-center justify-center gap-2">
                      <motion.div
                        initial={{ scale: 3, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.5, type: 'spring', stiffness: 300 }}
                      >
                        <div className="w-16 h-16 rounded-full flex items-center justify-center"
                          style={{ background: `${selectedCert.color}10` }}>
                          <Award size={28} style={{ color: selectedCert.color }} />
                        </div>
                      </motion.div>
                    </div>
                    <div className="mt-3 flex items-center justify-center gap-1">
                      <QrCode size={12} className="text-gray-300" />
                      <span className="text-[9px] text-gray-300">Scan to verify</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="p-4 flex gap-2 border-t border-gray-100">
                  <button className="flex-1 py-2.5 rounded-xl border-2 border-green-800 bg-white hover:bg-green-50
                    text-green-800 font-medium text-sm flex items-center justify-center gap-2 transition-colors">
                    <Download size={14} /> Download
                  </button>
                  <button className="flex-1 py-2.5 rounded-xl bg-white border border-gray-300 hover:bg-gray-50
                    text-gray-700 font-medium text-sm flex items-center justify-center gap-2 transition-colors">
                    <Share2 size={14} /> Share to LinkedIn
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
