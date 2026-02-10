'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { TrendingUp, Award, Target, Zap } from 'lucide-react'
import SkillRadarChart from '@/components/features/SkillRadarChart'

const skills = [
  { label: 'Communication', value: 82, maxValue: 100 },
  { label: 'Confidence', value: 75, maxValue: 100 },
  { label: 'Leadership', value: 68, maxValue: 100 },
  { label: 'Time Mgmt', value: 55, maxValue: 100 },
  { label: 'Negotiation', value: 40, maxValue: 100 },
  { label: 'Presentation', value: 72, maxValue: 100 },
]

const peerAverage = [
  { label: 'Communication', value: 65, maxValue: 100 },
  { label: 'Confidence', value: 60, maxValue: 100 },
  { label: 'Leadership', value: 55, maxValue: 100 },
  { label: 'Time Mgmt', value: 50, maxValue: 100 },
  { label: 'Negotiation', value: 45, maxValue: 100 },
  { label: 'Presentation', value: 58, maxValue: 100 },
]

const skillBars = [
  { name: 'Communication', score: 82, tier: 'Advanced', color: '#1E40AF' },
  { name: 'Confidence', score: 75, tier: 'Advanced', color: '#1E40AF' },
  { name: 'Presentation', score: 72, tier: 'Intermediate', color: '#166534' },
  { name: 'Leadership', score: 68, tier: 'Intermediate', color: '#166534' },
  { name: 'Time Management', score: 55, tier: 'Intermediate', color: '#92400E' },
  { name: 'Negotiation', score: 40, tier: 'Beginner', color: '#991B1B' },
]

const roadmapCards = [
  { title: 'Confidence Building', desc: 'Complete 10 mock scenarios to reach Advanced tier', module: 'Skill Assessment', color: '#92400E', progress: 35 },
  { title: 'Negotiation Course', desc: 'Start the persuasion fundamentals course', module: 'AI Courses', color: '#991B1B', progress: 0 },
  { title: 'Mock Interviews', desc: '5 more sessions to unlock certification', module: 'AI Interview', color: '#1E40AF', progress: 60 },
  { title: 'Public Speaking', desc: 'Presentation delivery and body language practice', module: 'Courses', color: '#166534', progress: 20 },
]

function getTierColor(tier: string) {
  switch (tier) {
    case 'Beginner': return '#991B1B'
    case 'Intermediate': return '#92400E'
    case 'Advanced': return '#1E40AF'
    case 'Expert': return '#166534'
    default: return '#6B7280'
  }
}

export default function SkillAssessmentPage() {
  const [showComparison, setShowComparison] = useState(false)

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-2">AI Skill Assessment</h1>
          <p className="text-gray-500">Track your soft skills, discover gaps, and follow your AI-powered improvement roadmap</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Radar Chart */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-1 rounded-2xl bg-white border border-gray-200 shadow-sm p-6 flex flex-col items-center"
          >
            <div className="flex items-center justify-between w-full mb-4">
              <h3 className="font-semibold text-gray-900">Skill Radar</h3>
              <button
                onClick={() => setShowComparison(!showComparison)}
                className={`text-xs px-3 py-1 rounded-full transition-all ${
                  showComparison
                    ? 'bg-red-50 text-red-700 border border-red-200'
                    : 'bg-gray-50 text-gray-500 border border-gray-200'
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
              <div className="flex gap-4 mt-4 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-blue-800/30" /> You
                </span>
                <span className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full border border-red-400 border-dashed" /> Avg Peer
                </span>
              </div>
            )}
          </motion.div>

          {/* Skill Progress Bars */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 rounded-2xl bg-white border border-gray-200 shadow-sm p-6"
          >
            <h3 className="font-semibold text-gray-900 mb-6">Skill Breakdown</h3>
            <div className="space-y-5">
              {skillBars.map((skill, i) => (
                <div key={skill.name}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm text-gray-700">{skill.name}</span>
                    <div className="flex items-center gap-2">
                      <span
                        className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                        style={{
                          background: `${getTierColor(skill.tier)}10`,
                          color: getTierColor(skill.tier),
                        }}
                      >
                        {skill.tier}
                      </span>
                      <span className="text-xs text-gray-400">{skill.score}%</span>
                    </div>
                  </div>
                  <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: skill.color }}
                      initial={{ width: 0 }}
                      animate={{ width: `${skill.score}%` }}
                      transition={{ duration: 1, delay: 0.3 + i * 0.1, ease: 'easeOut' }}
                    />
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
            <Target size={20} className="text-blue-800" />
            <h3 className="text-xl font-semibold text-gray-900">AI Learning Roadmap</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {roadmapCards.map((card, i) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className="rounded-xl bg-white border border-gray-200 shadow-sm p-5 cursor-pointer group hover:shadow-md hover:-translate-y-1 transition-all duration-200"
              >
                <div className="flex items-center gap-2 mb-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: `${card.color}10` }}
                  >
                    <Zap size={14} style={{ color: card.color }} />
                  </div>
                  <span className="text-[10px] text-gray-400">{card.module}</span>
                </div>

                <h4 className="font-medium text-gray-900 text-sm mb-1">{card.title}</h4>
                <p className="text-xs text-gray-400 mb-3">{card.desc}</p>

                <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: card.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${card.progress}%` }}
                    transition={{ duration: 1, delay: 0.8 + i * 0.1 }}
                  />
                </div>
                <span className="text-[10px] text-gray-400 mt-1 block">{card.progress}% complete</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
