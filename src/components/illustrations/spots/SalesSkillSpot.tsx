'use client'

import { motion } from 'framer-motion'

export default function SalesSkillSpot({ className }: { className?: string }) {
  const bars = [
    { x: 30, h: 35, delay: 0.3 },
    { x: 55, h: 50, delay: 0.4 },
    { x: 80, h: 42, delay: 0.5 },
    { x: 105, h: 65, delay: 0.6 },
  ]

  return (
    <svg viewBox="0 0 160 140" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="salesBar" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#DBEAFE" stopOpacity={0.7} />
          <stop offset="100%" stopColor="#BFDBFE" stopOpacity={0.2} />
        </linearGradient>
      </defs>

      {/* Bar chart */}
      {bars.map((bar, i) => (
        <motion.rect
          key={i}
          x={bar.x}
          y={110 - bar.h}
          width={18}
          height={bar.h}
          rx={4}
          fill="url(#salesBar)"
          stroke="#1E40AF"
          strokeWidth={1}
          strokeOpacity={0.12}
          initial={{ height: 0, y: 110 }}
          animate={{ height: bar.h, y: 110 - bar.h }}
          transition={{ duration: 0.6, delay: bar.delay, ease: 'easeOut' }}
        />
      ))}

      {/* Rising arrow curve */}
      <motion.path
        d="M 28 95 Q 65 80, 80 70 Q 95 60, 128 40"
        stroke="#1E40AF"
        strokeWidth={2}
        strokeOpacity={0.2}
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1, delay: 0.8, ease: 'easeOut' }}
      />
      <motion.polygon
        points="126,35 132,42 124,43"
        fill="#1E40AF"
        fillOpacity={0.2}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6 }}
      />

      {/* Handshake silhouette overlay */}
      <motion.g
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
      >
        {/* Two simple arcs forming a handshake */}
        <path
          d="M 55 105 Q 65 95 75 100 Q 85 105 95 95"
          stroke="#60A5FA"
          strokeWidth={2}
          strokeOpacity={0.15}
          strokeLinecap="round"
          fill="none"
        />
        <circle cx="55" cy="105" r="3" fill="#60A5FA" fillOpacity={0.12} />
        <circle cx="95" cy="95" r="3" fill="#60A5FA" fillOpacity={0.12} />
      </motion.g>
    </svg>
  )
}
