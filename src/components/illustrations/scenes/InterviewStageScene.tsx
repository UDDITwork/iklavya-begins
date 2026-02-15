'use client'

import { motion } from 'framer-motion'

export default function InterviewStageScene({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 300" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="interviewFill" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#DCFCE7" stopOpacity={0.6} />
          <stop offset="100%" stopColor="#BBF7D0" stopOpacity={0.2} />
        </linearGradient>
        <radialGradient id="interviewGlow">
          <stop offset="0%" stopColor="#4ADE80" stopOpacity={0.1} />
          <stop offset="100%" stopColor="#4ADE80" stopOpacity={0} />
        </radialGradient>
      </defs>

      {/* Background glow */}
      <circle cx={200} cy={150} r={120} fill="url(#interviewGlow)" />

      {/* Table */}
      <motion.rect
        x={100} y={180} width={200} height={8} rx={4}
        fill="url(#interviewFill)" stroke="#166534" strokeWidth={1} strokeOpacity={0.1}
        initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        style={{ transformOrigin: '200px 184px' }}
      />

      {/* Left figure — User */}
      <motion.g initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3, duration: 0.5 }}>
        {/* Head */}
        <circle cx={130} cy={120} r={18} fill="url(#interviewFill)" stroke="#166534" strokeWidth={1.5} strokeOpacity={0.15} />
        {/* Body */}
        <path d="M 108 170 Q 130 148 152 170" fill="url(#interviewFill)" stroke="#166534" strokeWidth={1.5} strokeOpacity={0.1} />
        {/* User glow */}
        <motion.circle
          cx={130} cy={120} r={28}
          fill="none" stroke="#4ADE80" strokeWidth={1} strokeOpacity={0.08}
          animate={{ r: [28, 32, 28] }}
          transition={{ duration: 3, repeat: Infinity }}
        />
      </motion.g>

      {/* Right figure — AI */}
      <motion.g initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4, duration: 0.5 }}>
        {/* Head */}
        <circle cx={270} cy={120} r={18} fill="url(#interviewFill)" stroke="#166534" strokeWidth={1.5} strokeOpacity={0.15} />
        {/* Body */}
        <path d="M 248 170 Q 270 148 292 170" fill="url(#interviewFill)" stroke="#166534" strokeWidth={1.5} strokeOpacity={0.1} />
        {/* AI signal arcs */}
        {[1, 2, 3].map((ring) => (
          <motion.path
            key={ring}
            d={`M ${270 + ring * 10} ${110} A ${ring * 10} ${ring * 10} 0 0 1 ${270 + ring * 10} ${130}`}
            stroke="#166534" strokeWidth={1} strokeOpacity={0.08}
            fill="none" strokeLinecap="round"
            animate={{ opacity: [0, 0.12, 0] }}
            transition={{ duration: 2, repeat: Infinity, delay: ring * 0.3 }}
          />
        ))}
      </motion.g>

      {/* Microphone between them */}
      <motion.g initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.4 }}>
        <rect x={195} y={155} width={10} height={20} rx={5} fill="url(#interviewFill)" stroke="#166534" strokeWidth={1} strokeOpacity={0.12} />
        <line x1={200} y1={175} x2={200} y2={180} stroke="#166534" strokeWidth={1} strokeOpacity={0.1} />
      </motion.g>

      {/* Waveform connection line */}
      <motion.path
        d="M 150 140 Q 165 130, 175 140 Q 185 150, 200 140 Q 215 130, 225 140 Q 235 150, 250 140"
        stroke="#4ADE80" strokeWidth={1.5} strokeOpacity={0.12}
        fill="none" strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.2, delay: 0.8, ease: 'easeOut' }}
      />

      {/* Floating data dots */}
      {[
        { cx: 160, cy: 100, delay: 0 },
        { cx: 200, cy: 90, delay: 0.3 },
        { cx: 240, cy: 100, delay: 0.6 },
      ].map((dot, i) => (
        <motion.circle
          key={i}
          cx={dot.cx} cy={dot.cy} r={3}
          fill="#166534" fillOpacity={0.08}
          animate={{ y: [0, -6, 0], opacity: [0.05, 0.15, 0.05] }}
          transition={{ duration: 2.5, repeat: Infinity, delay: dot.delay }}
        />
      ))}
    </svg>
  )
}
