'use client'

import { motion } from 'framer-motion'

export default function TimeSkillSpot({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 160 140" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="clockFace" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#DBEAFE" stopOpacity={0.5} />
          <stop offset="100%" stopColor="#EFF6FF" stopOpacity={0.2} />
        </linearGradient>
        <radialGradient id="clockGlow">
          <stop offset="0%" stopColor="#60A5FA" stopOpacity={0.08} />
          <stop offset="100%" stopColor="#60A5FA" stopOpacity={0} />
        </radialGradient>
      </defs>

      {/* Clock glow */}
      <circle cx="75" cy="70" r="55" fill="url(#clockGlow)" />

      {/* Clock face */}
      <motion.circle
        cx={75} cy={70} r={40}
        fill="url(#clockFace)"
        stroke="#1E40AF"
        strokeWidth={1.5}
        strokeOpacity={0.15}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      />

      {/* Hour markers */}
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i * 30 - 90) * (Math.PI / 180)
        const x1 = 75 + 33 * Math.cos(angle)
        const y1 = 70 + 33 * Math.sin(angle)
        const x2 = 75 + 37 * Math.cos(angle)
        const y2 = 70 + 37 * Math.sin(angle)
        return (
          <motion.line
            key={i}
            x1={x1} y1={y1} x2={x2} y2={y2}
            stroke="#1E40AF"
            strokeWidth={i % 3 === 0 ? 2 : 1}
            strokeOpacity={0.15}
            strokeLinecap="round"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 + i * 0.05 }}
          />
        )
      })}

      {/* Hour hand */}
      <motion.line
        x1={75} y1={70} x2={75} y2={48}
        stroke="#1E40AF" strokeWidth={2.5} strokeOpacity={0.25} strokeLinecap="round"
        initial={{ rotate: -90 }}
        animate={{ rotate: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        style={{ transformOrigin: '75px 70px' }}
      />

      {/* Minute hand */}
      <motion.line
        x1={75} y1={70} x2={95} y2={55}
        stroke="#1E40AF" strokeWidth={1.5} strokeOpacity={0.2} strokeLinecap="round"
        initial={{ rotate: -120 }}
        animate={{ rotate: 0 }}
        transition={{ delay: 0.7, duration: 0.6 }}
        style={{ transformOrigin: '75px 70px' }}
      />

      {/* Center dot */}
      <circle cx={75} cy={70} r={3} fill="#1E40AF" fillOpacity={0.2} />

      {/* Flowing time ribbon */}
      <motion.path
        d="M 115 50 Q 125 65, 120 80 Q 115 95, 130 105 Q 140 112, 145 120"
        stroke="#60A5FA"
        strokeWidth={1.5}
        strokeOpacity={0.12}
        strokeLinecap="round"
        fill="none"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.2, delay: 0.8, ease: 'easeOut' }}
      />

      {/* Ribbon dots */}
      {[0, 1, 2].map((i) => (
        <motion.circle
          key={i}
          cx={120 + i * 10}
          cy={75 + i * 18}
          r={2}
          fill="#60A5FA"
          fillOpacity={0.12}
          animate={{ opacity: [0.06, 0.18, 0.06] }}
          transition={{ duration: 2, repeat: Infinity, delay: i * 0.4 }}
        />
      ))}
    </svg>
  )
}
