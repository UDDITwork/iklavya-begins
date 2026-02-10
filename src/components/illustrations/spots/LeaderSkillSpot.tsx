'use client'

import { motion } from 'framer-motion'

export default function LeaderSkillSpot({ className }: { className?: string }) {
  const followers = [
    { cx: 45, cy: 85, delay: 0.6 },
    { cx: 80, cy: 90, delay: 0.7 },
    { cx: 115, cy: 85, delay: 0.8 },
  ]

  return (
    <svg viewBox="0 0 160 140" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="leaderFill" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#DBEAFE" stopOpacity={0.7} />
          <stop offset="100%" stopColor="#BFDBFE" stopOpacity={0.3} />
        </linearGradient>
        <linearGradient id="followerFill" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#EFF6FF" stopOpacity={0.6} />
          <stop offset="100%" stopColor="#DBEAFE" stopOpacity={0.2} />
        </linearGradient>
      </defs>

      {/* Leader — head */}
      <motion.circle
        cx={80} cy={40} r={14}
        fill="url(#leaderFill)"
        stroke="#1E40AF" strokeWidth={1.5} strokeOpacity={0.2}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      />

      {/* Leader — shoulders */}
      <motion.path
        d="M 58 65 Q 80 50 102 65"
        stroke="#1E40AF" strokeWidth={1.5} strokeOpacity={0.15}
        fill="url(#leaderFill)"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35 }}
      />

      {/* Highlight ring around leader */}
      <motion.circle
        cx={80} cy={40} r={20}
        fill="none" stroke="#60A5FA" strokeWidth={1} strokeOpacity={0.1}
        animate={{ r: [20, 24, 20] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Followers */}
      {followers.map((f, i) => (
        <motion.g
          key={i}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: f.delay, duration: 0.4 }}
        >
          <circle cx={f.cx} cy={f.cy} r={10} fill="url(#followerFill)" stroke="#1E40AF" strokeWidth={1} strokeOpacity={0.1} />
          <path
            d={`M ${f.cx - 14} ${f.cy + 18} Q ${f.cx} ${f.cy + 10} ${f.cx + 14} ${f.cy + 18}`}
            stroke="#1E40AF" strokeWidth={1} strokeOpacity={0.08}
            fill="url(#followerFill)"
          />
        </motion.g>
      ))}

      {/* Connection lines from leader to followers */}
      {followers.map((f, i) => (
        <motion.line
          key={`line-${i}`}
          x1={80} y1={60}
          x2={f.cx} y2={f.cy - 10}
          stroke="#1E40AF" strokeWidth={1} strokeOpacity={0.06}
          strokeDasharray="3 4"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.5, delay: f.delay + 0.2 }}
        />
      ))}
    </svg>
  )
}
