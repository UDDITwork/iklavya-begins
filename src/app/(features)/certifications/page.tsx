'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { Award, Download, Share2, QrCode, ExternalLink, Star, Lock } from 'lucide-react'
import confetti from 'canvas-confetti'
import ParticleField from '@/components/animations/ParticleField'
import GlowingOrb from '@/components/animations/GlowingOrb'

const certificates = [
  { id: 1, title: 'Python Advanced', issueDate: '2025-01-15', status: 'earned', grade: 'A', color: '#3b82f6', badge: '🐍' },
  { id: 2, title: 'React & Next.js', issueDate: '2025-02-01', status: 'earned', grade: 'A+', color: '#8b5cf6', badge: '⚛️' },
  { id: 3, title: 'SQL Fundamentals', issueDate: '2024-12-20', status: 'earned', grade: 'B+', color: '#f59e0b', badge: '🗄️' },
  { id: 4, title: 'Machine Learning', issueDate: '', status: 'in-progress', grade: '', color: '#10b981', badge: '🤖', progress: 45 },
  { id: 5, title: 'System Design', issueDate: '', status: 'locked', grade: '', color: '#ef4444', badge: '🏗️', progress: 0 },
  { id: 6, title: 'Communication Pro', issueDate: '', status: 'locked', grade: '', color: '#06b6d4', badge: '🗣️', progress: 0 },
]

const badges = [
  { name: 'Early Adopter', icon: '🌟', rarity: 'rare', color: '#f59e0b' },
  { name: 'Quiz Master', icon: '🧠', rarity: 'epic', color: '#8b5cf6' },
  { name: '5-Day Streak', icon: '🔥', rarity: 'common', color: '#ef4444' },
  { name: 'Fast Learner', icon: '⚡', rarity: 'rare', color: '#3b82f6' },
  { name: 'Interview Ready', icon: '🎯', rarity: 'legendary', color: '#ec4899' },
]

const rarityBorder: Record<string, string> = {
  common: 'border-gray-400/30',
  rare: 'border-blue-400/40',
  epic: 'border-purple-400/50',
  legendary: 'border-yellow-400/60',
}

export default function CertificationsPage() {
  const [selectedCert, setSelectedCert] = useState<typeof certificates[0] | null>(null)
  const [showCeremony, setShowCeremony] = useState(false)

  const triggerCeremony = (cert: typeof certificates[0]) => {
    setSelectedCert(cert)
    setShowCeremony(true)
    setTimeout(() => {
      confetti({
        particleCount: 200,
        spread: 120,
        origin: { y: 0.4 },
        colors: ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b'],
      })
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-[#030014] relative overflow-hidden">
      <ParticleField particleCount={40} className="opacity-20" />
      <GlowingOrb size={350} color="rgba(249,115,22,0.06)" x="80%" y="20%" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold gradient-text mb-2">Certifications & Badges</h1>
          <p className="text-white/40">Your achievement trophy room</p>
        </motion.div>

        {/* Badge Showcase */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-10"
        >
          <h3 className="text-sm font-medium text-white/50 uppercase tracking-wider mb-4">Micro-Credentials</h3>
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {badges.map((badge, i) => (
              <motion.div
                key={badge.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.05 }}
                className={`shrink-0 w-28 p-4 rounded-xl glass text-center border ${rarityBorder[badge.rarity]} cursor-pointer`}
                whileHover={{ scale: 1.08, y: -4 }}
              >
                <motion.span
                  className="text-3xl block mb-2"
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 3, repeat: Infinity, delay: i * 0.5 }}
                >
                  {badge.icon}
                </motion.span>
                <span className="text-[10px] text-white/60 font-medium block">{badge.name}</span>
                <span className="text-[9px] uppercase tracking-wider mt-1 block"
                  style={{ color: badge.color }}>
                  {badge.rarity}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Certificate Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {certificates.map((cert, i) => (
            <motion.div
              key={cert.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.08 }}
              className="rounded-2xl glass overflow-hidden group cursor-pointer"
              style={{ perspective: '1000px' }}
              whileHover={{
                rotateY: 3,
                rotateX: -3,
                scale: 1.02,
                boxShadow: `0 0 30px ${cert.color}20`,
              }}
              onClick={() => cert.status === 'earned' && triggerCeremony(cert)}
            >
              <div
                className="h-36 flex items-center justify-center relative"
                style={{ background: `linear-gradient(135deg, ${cert.color}10, ${cert.color}05)` }}
              >
                <span className="text-5xl">{cert.badge}</span>
                {cert.status === 'locked' && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Lock size={24} className="text-white/30" />
                  </div>
                )}
                {cert.status === 'earned' && (
                  <div className="absolute top-3 right-3">
                    <motion.div
                      className="w-8 h-8 rounded-full flex items-center justify-center"
                      style={{ background: `${cert.color}20` }}
                      animate={{ boxShadow: [`0 0 0 ${cert.color}00`, `0 0 15px ${cert.color}30`, `0 0 0 ${cert.color}00`] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Award size={14} style={{ color: cert.color }} />
                    </motion.div>
                  </div>
                )}
              </div>

              <div className="p-4">
                <h3 className="font-semibold text-white/80 mb-1">{cert.title}</h3>
                {cert.status === 'earned' && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-white/30">{cert.issueDate}</span>
                    <span className="text-xs font-bold" style={{ color: cert.color }}>
                      Grade: {cert.grade}
                    </span>
                  </div>
                )}
                {cert.status === 'in-progress' && (
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-white/30">In Progress</span>
                      <span className="text-white/50">{cert.progress}%</span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
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
                  <span className="text-xs text-white/20">Complete prerequisites to unlock</span>
                )}
              </div>
            </motion.div>
          ))}
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
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowCeremony(false)} />

            <motion.div
              className="relative w-full max-w-lg"
              initial={{ scale: 0.5, rotateY: 180 }}
              animate={{ scale: 1, rotateY: 0 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            >
              {/* Spotlight effect */}
              <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-40 h-40 rounded-full blur-3xl"
                style={{ background: `${selectedCert.color}30` }} />

              <div className="bg-[#0a0a1a] rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
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
                          style={{ background: `${selectedCert.color}15` }}>
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
                <div className="p-4 flex gap-2">
                  <button className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500
                    text-white font-medium text-sm flex items-center justify-center gap-2">
                    <Download size={14} /> Download
                  </button>
                  <button className="flex-1 py-2.5 rounded-xl glass text-white/60 font-medium text-sm
                    flex items-center justify-center gap-2 hover:text-white/80 transition-colors">
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
