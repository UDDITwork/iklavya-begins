'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { TrendingUp, Award, Target, ChevronRight, Zap } from 'lucide-react'
import ParticleField from '@/components/animations/ParticleField'
import GlowingOrb from '@/components/animations/GlowingOrb'
import SkillRadarChart from '@/components/features/SkillRadarChart'

const skills = [
  { label: 'Python', value: 82, maxValue: 100 },
  { label: 'JavaScript', value: 75, maxValue: 100 },
  { label: 'SQL', value: 68, maxValue: 100 },
  { label: 'DSA', value: 55, maxValue: 100 },
  { label: 'System Design', value: 40, maxValue: 100 },
  { label: 'Communication', value: 72, maxValue: 100 },
]

const peerAverage = [
  { label: 'Python', value: 65, maxValue: 100 },
  { label: 'JavaScript', value: 60, maxValue: 100 },
  { label: 'SQL', value: 55, maxValue: 100 },
  { label: 'DSA', value: 50, maxValue: 100 },
  { label: 'System Design', value: 45, maxValue: 100 },
  { label: 'Communication', value: 58, maxValue: 100 },
]

const skillBars = [
  { name: 'Python', score: 82, tier: 'Advanced', color: '#8b5cf6' },
  { name: 'JavaScript', score: 75, tier: 'Advanced', color: '#3b82f6' },
  { name: 'Communication', score: 72, tier: 'Intermediate', color: '#10b981' },
  { name: 'SQL', score: 68, tier: 'Intermediate', color: '#06b6d4' },
  { name: 'DSA', score: 55, tier: 'Intermediate', color: '#f59e0b' },
  { name: 'System Design', score: 40, tier: 'Beginner', color: '#ef4444' },
]

const roadmapCards = [
  { title: 'Complete DSA Module', desc: 'Practice 50 problems to reach Advanced tier', module: 'Skill Assessment', color: '#f59e0b', progress: 35 },
  { title: 'System Design Course', desc: 'Start the fundamentals course', module: 'AI Courses', color: '#ef4444', progress: 0 },
  { title: 'Mock Interviews', desc: '5 more sessions to unlock certification', module: 'AI Interview', color: '#3b82f6', progress: 60 },
  { title: 'Soft Skills Workshop', desc: 'Communication and presentation practice', module: 'Courses', color: '#10b981', progress: 20 },
]

function getTierColor(tier: string) {
  switch (tier) {
    case 'Beginner': return '#3b82f6'
    case 'Intermediate': return '#10b981'
    case 'Advanced': return '#8b5cf6'
    case 'Expert': return '#f59e0b'
    default: return '#6b7280'
  }
}

export default function SkillAssessmentPage() {
  const [showComparison, setShowComparison] = useState(false)

  return (
    <div className="min-h-screen bg-[#030014] relative overflow-hidden">
      <ParticleField particleCount={40} className="opacity-20" />
      <GlowingOrb size={350} color="rgba(16,185,129,0.06)" x="10%" y="30%" />
      <GlowingOrb size={300} color="rgba(139,92,246,0.06)" x="90%" y="70%" delay={2} />

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold gradient-text mb-2">AI Skill Assessment</h1>
          <p className="text-white/40">Track your skills, discover gaps, and follow your AI-powered roadmap</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Radar Chart */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-1 rounded-2xl glass p-6 flex flex-col items-center"
          >
            <div className="flex items-center justify-between w-full mb-4">
              <h3 className="font-semibold text-white/80">Skill Radar</h3>
              <button
                onClick={() => setShowComparison(!showComparison)}
                className={`text-xs px-3 py-1 rounded-full transition-all ${
                  showComparison
                    ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                    : 'bg-white/5 text-white/40 border border-white/10'
                }`}
              >
                {showComparison ? 'Hide' : 'vs'} Peers
              </button>
            </div>
            <SkillRadarChart
              skills={skills}
              comparison={peerAverage}
              showComparison={showComparison}
              size={280}
            />
            {showComparison && (
              <div className="flex gap-4 mt-4 text-xs">
                <span className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-purple-500/50" /> You
                </span>
                <span className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full border border-red-500/40 border-dashed" /> Avg Peer
                </span>
              </div>
            )}
          </motion.div>

          {/* Skill Progress Bars */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 rounded-2xl glass p-6"
          >
            <h3 className="font-semibold text-white/80 mb-6">Skill Breakdown</h3>
            <div className="space-y-5">
              {skillBars.map((skill, i) => (
                <div key={skill.name}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm text-white/70">{skill.name}</span>
                    <div className="flex items-center gap-2">
                      <span
                        className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                        style={{
                          background: `${getTierColor(skill.tier)}15`,
                          color: getTierColor(skill.tier),
                        }}
                      >
                        {skill.tier}
                      </span>
                      <span className="text-xs text-white/40">{skill.score}%</span>
                    </div>
                  </div>
                  <div className="h-2.5 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full relative overflow-hidden"
                      style={{ background: skill.color }}
                      initial={{ width: 0 }}
                      animate={{ width: `${skill.score}%` }}
                      transition={{ duration: 1, delay: 0.3 + i * 0.1, ease: 'easeOut' }}
                    >
                      {/* Liquid wave effect */}
                      <div
                        className="absolute inset-0 opacity-30"
                        style={{
                          background: `linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)`,
                          animation: `gradient 2s linear infinite`,
                          backgroundSize: '200% 100%',
                        }}
                      />
                    </motion.div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* AI Roadmap */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8"
        >
          <div className="flex items-center gap-2 mb-6">
            <Target size={20} className="text-purple-400" />
            <h3 className="text-xl font-semibold text-white/80">AI Learning Roadmap</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {roadmapCards.map((card, i) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className="rounded-xl glass p-5 cursor-pointer group relative overflow-hidden"
                whileHover={{ y: -4, scale: 1.02 }}
              >
                {/* Connecting flow dots */}
                {i < roadmapCards.length - 1 && (
                  <div className="hidden lg:block absolute -right-4 top-1/2 -translate-y-1/2 z-20">
                    <motion.div
                      className="w-2 h-2 rounded-full"
                      style={{ background: card.color }}
                      animate={{ x: [0, 8, 0], opacity: [1, 0.3, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3 }}
                    />
                  </div>
                )}

                <div className="flex items-center gap-2 mb-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: `${card.color}15` }}
                  >
                    <Zap size={14} style={{ color: card.color }} />
                  </div>
                  <span className="text-[10px] text-white/30">{card.module}</span>
                </div>

                <h4 className="font-medium text-white/80 text-sm mb-1">{card.title}</h4>
                <p className="text-xs text-white/30 mb-3">{card.desc}</p>

                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: card.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${card.progress}%` }}
                    transition={{ duration: 1, delay: 0.8 + i * 0.1 }}
                  />
                </div>
                <span className="text-[10px] text-white/20 mt-1 block">{card.progress}% complete</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
