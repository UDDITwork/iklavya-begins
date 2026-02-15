'use client'

import { motion } from 'framer-motion'

export default function CourseLibraryScene({ className }: { className?: string }) {
  const bubbles = [
    { cx: 140, cy: 60, rx: 28, ry: 14, delay: 0.8 },
    { cx: 230, cy: 45, rx: 24, ry: 12, delay: 1.0 },
    { cx: 185, cy: 35, rx: 22, ry: 11, delay: 1.2 },
    { cx: 270, cy: 70, rx: 20, ry: 10, delay: 1.4 },
  ]

  return (
    <svg viewBox="0 0 400 250" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="screenFill" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#DCFCE7" stopOpacity={0.5} />
          <stop offset="100%" stopColor="#F0FDF4" stopOpacity={0.2} />
        </linearGradient>
        <linearGradient id="bubbleFill" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#DCFCE7" stopOpacity={0.6} />
          <stop offset="100%" stopColor="#BBF7D0" stopOpacity={0.2} />
        </linearGradient>
        <radialGradient id="screenGlow">
          <stop offset="0%" stopColor="#4ADE80" stopOpacity={0.1} />
          <stop offset="100%" stopColor="#4ADE80" stopOpacity={0} />
        </radialGradient>
      </defs>

      {/* Screen glow */}
      <circle cx={200} cy={150} r={90} fill="url(#screenGlow)" />

      {/* Laptop base */}
      <motion.path
        d="M 100 200 L 120 210 L 280 210 L 300 200"
        stroke="#166534" strokeWidth={1.5} strokeOpacity={0.12}
        fill="url(#screenFill)" strokeLinecap="round"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      />

      {/* Laptop screen frame */}
      <motion.rect
        x={120} y={95} width={160} height={105} rx={6}
        fill="url(#screenFill)" stroke="#166534" strokeWidth={1.5} strokeOpacity={0.12}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      />

      {/* Screen content lines */}
      <motion.rect x={135} y={110} width={60} height={4} rx={2} fill="#166534" fillOpacity={0.1}
        initial={{ width: 0 }} animate={{ width: 60 }} transition={{ delay: 0.5, duration: 0.3 }} />
      <motion.rect x={135} y={120} width={45} height={3} rx={1.5} fill="#166534" fillOpacity={0.06}
        initial={{ width: 0 }} animate={{ width: 45 }} transition={{ delay: 0.6, duration: 0.3 }} />
      <motion.rect x={135} y={128} width={55} height={3} rx={1.5} fill="#166534" fillOpacity={0.06}
        initial={{ width: 0 }} animate={{ width: 55 }} transition={{ delay: 0.7, duration: 0.3 }} />

      {/* Play button on screen */}
      <motion.g
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.8, type: 'spring' }}
      >
        <circle cx={240} cy={140} r={14} fill="url(#bubbleFill)" stroke="#166534" strokeWidth={1} strokeOpacity={0.1} />
        <path d="M 236 133 L 248 140 L 236 147 Z" fill="#166534" fillOpacity={0.15} />
      </motion.g>

      {/* Floating topic bubbles rising from laptop */}
      {bubbles.map((b, i) => (
        <motion.g key={i}>
          <motion.ellipse
            cx={b.cx} cy={b.cy} rx={b.rx} ry={b.ry}
            fill="url(#bubbleFill)" stroke="#166534" strokeWidth={1} strokeOpacity={0.08}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: b.delay, duration: 0.5 }}
          />
          {/* Text line inside bubble */}
          <motion.rect
            x={b.cx - b.rx + 8} y={b.cy - 2} width={b.rx * 1.2} height={3} rx={1.5}
            fill="#166534" fillOpacity={0.1}
            initial={{ width: 0 }}
            animate={{ width: b.rx * 1.2 }}
            transition={{ delay: b.delay + 0.3, duration: 0.3 }}
          />
          {/* Float animation */}
          <motion.circle
            cx={b.cx} cy={b.cy - b.ry - 5} r={1.5}
            fill="#4ADE80" fillOpacity={0.1}
            animate={{ y: [0, -5, 0], opacity: [0.05, 0.15, 0.05] }}
            transition={{ duration: 3, repeat: Infinity, delay: i * 0.5 }}
          />
        </motion.g>
      ))}

      {/* Glow line from screen */}
      <motion.line
        x1={200} y1={95} x2={200} y2={40}
        stroke="#4ADE80" strokeWidth={0.5} strokeOpacity={0.06}
        strokeDasharray="3 5"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ delay: 0.6, duration: 0.8 }}
      />
    </svg>
  )
}
