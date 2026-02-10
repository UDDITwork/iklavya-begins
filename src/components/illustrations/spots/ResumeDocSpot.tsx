'use client'

import { motion } from 'framer-motion'

export default function ResumeDocSpot({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 160 140" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="docFill" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#DBEAFE" stopOpacity={0.6} />
          <stop offset="100%" stopColor="#EFF6FF" stopOpacity={0.2} />
        </linearGradient>
      </defs>

      {/* Document */}
      <motion.rect
        x={35} y={15} width={80} height={110} rx={6}
        fill="url(#docFill)" stroke="#1E40AF" strokeWidth={1.5} strokeOpacity={0.15}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4 }}
      />

      {/* Document corner fold */}
      <motion.path
        d="M 95 15 L 115 15 L 115 35 Z"
        fill="url(#docFill)" stroke="#1E40AF" strokeWidth={1} strokeOpacity={0.08}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      />

      {/* Text lines — staggered typing animation */}
      {[
        { x: 45, y: 35, w: 50, h: 4, delay: 0.4 },
        { x: 45, y: 48, w: 60, h: 3, delay: 0.5 },
        { x: 45, y: 56, w: 45, h: 3, delay: 0.6 },
        { x: 45, y: 64, w: 55, h: 3, delay: 0.7 },
        { x: 45, y: 78, w: 40, h: 4, delay: 0.8 },
        { x: 45, y: 88, w: 58, h: 3, delay: 0.9 },
        { x: 45, y: 96, w: 48, h: 3, delay: 1.0 },
        { x: 45, y: 104, w: 52, h: 3, delay: 1.1 },
      ].map((line, i) => (
        <motion.rect
          key={i}
          x={line.x} y={line.y}
          width={line.w} height={line.h} rx={1.5}
          fill="#1E40AF" fillOpacity={i === 0 || i === 4 ? 0.12 : 0.06}
          initial={{ width: 0 }}
          animate={{ width: line.w }}
          transition={{ delay: line.delay, duration: 0.3, ease: 'easeOut' }}
        />
      ))}

      {/* AI sparkle/wand overlay */}
      <motion.g
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1.2, type: 'spring', stiffness: 200 }}
      >
        {/* Wand body */}
        <motion.line
          x1={120} y1={60} x2={105} y2={85}
          stroke="#60A5FA" strokeWidth={2} strokeOpacity={0.2} strokeLinecap="round"
        />
        {/* Star sparkle at tip */}
        <motion.path
          d="M 120 55 L 121.5 59 L 125 60 L 121.5 61 L 120 65 L 118.5 61 L 115 60 L 118.5 59 Z"
          fill="#60A5FA" fillOpacity={0.25}
          animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.35, 0.2] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          style={{ transformOrigin: '120px 60px' }}
        />
      </motion.g>

      {/* Small sparkle particles */}
      {[
        { cx: 125, cy: 48 },
        { cx: 130, cy: 70 },
        { cx: 112, cy: 45 },
      ].map((s, i) => (
        <motion.circle
          key={i}
          cx={s.cx} cy={s.cy} r={1.5}
          fill="#60A5FA" fillOpacity={0.15}
          animate={{ opacity: [0, 0.25, 0] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.4 + 1.3 }}
        />
      ))}
    </svg>
  )
}
