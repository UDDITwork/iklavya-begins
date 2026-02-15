'use client'

import { motion } from 'framer-motion'

export default function QuizTrophySpot({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 160 140" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="trophyFill" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#DCFCE7" stopOpacity={0.7} />
          <stop offset="100%" stopColor="#BBF7D0" stopOpacity={0.3} />
        </linearGradient>
      </defs>

      {/* Trophy cup */}
      <motion.path
        d="M 55 30 L 55 70 Q 55 90 80 90 Q 105 90 105 70 L 105 30 Z"
        fill="url(#trophyFill)" stroke="#166534" strokeWidth={1.5} strokeOpacity={0.15}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2, type: 'spring' }}
        style={{ transformOrigin: '80px 60px' }}
      />

      {/* Left handle */}
      <motion.path
        d="M 55 40 Q 38 40 38 55 Q 38 70 55 70"
        stroke="#166534" strokeWidth={1.5} strokeOpacity={0.12} fill="none" strokeLinecap="round"
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
        transition={{ delay: 0.5, duration: 0.4 }}
      />

      {/* Right handle */}
      <motion.path
        d="M 105 40 Q 122 40 122 55 Q 122 70 105 70"
        stroke="#166534" strokeWidth={1.5} strokeOpacity={0.12} fill="none" strokeLinecap="round"
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
        transition={{ delay: 0.6, duration: 0.4 }}
      />

      {/* Stem */}
      <motion.rect
        x={73} y={90} width={14} height={15} rx={2}
        fill="url(#trophyFill)" stroke="#166534" strokeWidth={1} strokeOpacity={0.1}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
      />

      {/* Base */}
      <motion.rect
        x={60} y={105} width={40} height={8} rx={4}
        fill="url(#trophyFill)" stroke="#166534" strokeWidth={1} strokeOpacity={0.1}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      />

      {/* Star on trophy */}
      <motion.path
        d="M 80 45 L 83 55 L 93 56 L 85 62 L 87 72 L 80 67 L 73 72 L 75 62 L 67 56 L 77 55 Z"
        fill="#166534" fillOpacity={0.12} stroke="#166534" strokeWidth={0.5} strokeOpacity={0.1}
        animate={{ scale: [1, 1.08, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
        style={{ transformOrigin: '80px 58px' }}
      />

      {/* Confetti particles */}
      {[
        { cx: 35, cy: 25, r: 3 },
        { cx: 125, cy: 20, r: 2.5 },
        { cx: 40, cy: 55, r: 2 },
        { cx: 120, cy: 45, r: 2 },
        { cx: 50, cy: 15, r: 2.5 },
        { cx: 110, cy: 15, r: 3 },
        { cx: 130, cy: 75, r: 2 },
        { cx: 30, cy: 80, r: 2 },
      ].map((dot, i) => (
        <motion.circle
          key={i}
          cx={dot.cx} cy={dot.cy} r={dot.r}
          fill={i % 2 === 0 ? '#166534' : '#4ADE80'}
          fillOpacity={0.08}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: [0, 1.3, 1], opacity: [0, 0.15, 0.06] }}
          transition={{ delay: 0.9 + i * 0.08, duration: 0.4 }}
        />
      ))}

      {/* Sparkle accents */}
      {[
        { x: 70, y: 35 },
        { x: 92, y: 40 },
      ].map((s, i) => (
        <motion.g key={i}
          animate={{ opacity: [0, 0.2, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.6 + 1 }}
        >
          <line x1={s.x - 3} y1={s.y} x2={s.x + 3} y2={s.y} stroke="#4ADE80" strokeWidth={1} />
          <line x1={s.x} y1={s.y - 3} x2={s.x} y2={s.y + 3} stroke="#4ADE80" strokeWidth={1} />
        </motion.g>
      ))}
    </svg>
  )
}
