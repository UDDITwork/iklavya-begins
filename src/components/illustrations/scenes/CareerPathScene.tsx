'use client'

import { motion } from 'framer-motion'

const milestones = [
  { x: 70, y: 230, label: 'Start', delay: 0.6 },
  { x: 130, y: 190, label: 'Skills', delay: 0.9 },
  { x: 210, y: 150, label: 'Practice', delay: 1.2 },
  { x: 290, y: 110, label: 'Interview', delay: 1.5 },
  { x: 340, y: 70, label: 'Career', delay: 1.8 },
]

export default function CareerPathScene({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 300" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="pathFill" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#DCFCE7" stopOpacity={0.5} />
          <stop offset="100%" stopColor="#BBF7D0" stopOpacity={0.2} />
        </linearGradient>
        <radialGradient id="pathGlow">
          <stop offset="0%" stopColor="#4ADE80" stopOpacity={0.08} />
          <stop offset="100%" stopColor="#4ADE80" stopOpacity={0} />
        </radialGradient>
      </defs>

      {/* Background glow */}
      <circle cx={200} cy={150} r={130} fill="url(#pathGlow)" />

      {/* Winding path going upward */}
      <motion.path
        d="M 50 260 Q 80 250, 90 230 Q 100 210, 130 190 Q 160 170, 190 160 Q 220 150, 240 140 Q 260 130, 290 110 Q 310 95, 340 70 Q 355 55, 370 45"
        stroke="#166534"
        strokeWidth={3}
        strokeOpacity={0.12}
        strokeLinecap="round"
        fill="none"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 2, ease: 'easeOut', delay: 0.3 }}
      />

      {/* Path shadow/fill area */}
      <motion.path
        d="M 50 260 Q 80 250, 90 230 Q 100 210, 130 190 Q 160 170, 190 160 Q 220 150, 240 140 Q 260 130, 290 110 Q 310 95, 340 70 Q 355 55, 370 45 L 370 280 L 50 280 Z"
        fill="url(#pathFill)"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        transition={{ delay: 1, duration: 1 }}
      />

      {/* Milestone markers */}
      {milestones.map((m, i) => (
        <motion.g key={i}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: m.delay, type: 'spring', stiffness: 200 }}
        >
          {/* Marker post */}
          <line x1={m.x} y1={m.y} x2={m.x} y2={m.y + 15} stroke="#166534" strokeWidth={1.5} strokeOpacity={0.12} />
          {/* Marker circle */}
          <circle cx={m.x} cy={m.y} r={10} fill="url(#pathFill)" stroke="#166534" strokeWidth={1.5} strokeOpacity={0.15} />
          {/* Inner dot */}
          <motion.circle
            cx={m.x} cy={m.y} r={3.5}
            fill="#166534" fillOpacity={0.2}
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
          />
          {/* Pulse ring */}
          <motion.circle
            cx={m.x} cy={m.y} r={14}
            fill="none" stroke="#4ADE80" strokeWidth={1}
            animate={{ opacity: [0.08, 0, 0.08], r: [14, 18, 14] }}
            transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.4 }}
          />
        </motion.g>
      ))}

      {/* Arrow at the end */}
      <motion.polygon
        points="365,40 375,50 370,45 380,45"
        fill="#166534" fillOpacity={0.15}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.2 }}
      />

      {/* Decorative dots along path */}
      {[
        { cx: 110, cy: 210 },
        { cx: 170, cy: 175 },
        { cx: 250, cy: 135 },
        { cx: 315, cy: 90 },
      ].map((dot, i) => (
        <motion.circle
          key={i}
          cx={dot.cx} cy={dot.cy} r={2}
          fill="#4ADE80" fillOpacity={0.12}
          animate={{ opacity: [0.06, 0.18, 0.06] }}
          transition={{ duration: 2, repeat: Infinity, delay: i * 0.4 + 0.5 }}
        />
      ))}
    </svg>
  )
}
