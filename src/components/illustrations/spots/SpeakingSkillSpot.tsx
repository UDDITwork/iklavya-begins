'use client'

import { motion } from 'framer-motion'

export default function SpeakingSkillSpot({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 160 140" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="micFill" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#DBEAFE" stopOpacity={0.7} />
          <stop offset="100%" stopColor="#BFDBFE" stopOpacity={0.3} />
        </linearGradient>
      </defs>

      {/* Microphone body */}
      <motion.rect
        x={68} y={35} width={24} height={45} rx={12}
        fill="url(#micFill)"
        stroke="#1E40AF" strokeWidth={1.5} strokeOpacity={0.2}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      />

      {/* Microphone grill lines */}
      {[0, 1, 2, 3].map((i) => (
        <motion.line
          key={i}
          x1={73} y1={43 + i * 7} x2={87} y2={43 + i * 7}
          stroke="#1E40AF" strokeWidth={1} strokeOpacity={0.08}
          strokeLinecap="round"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 + i * 0.1 }}
        />
      ))}

      {/* Mic cradle arc */}
      <motion.path
        d="M 60 70 Q 60 95 80 95 Q 100 95 100 70"
        stroke="#1E40AF" strokeWidth={1.5} strokeOpacity={0.12}
        strokeLinecap="round"
        fill="none"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ delay: 0.4, duration: 0.6 }}
      />

      {/* Stand */}
      <motion.line
        x1={80} y1={95} x2={80} y2={115}
        stroke="#1E40AF" strokeWidth={1.5} strokeOpacity={0.12}
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ delay: 0.8, duration: 0.3 }}
      />
      <motion.line
        x1={65} y1={115} x2={95} y2={115}
        stroke="#1E40AF" strokeWidth={1.5} strokeOpacity={0.12}
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ delay: 1, duration: 0.3 }}
      />

      {/* Sound wave rings */}
      {[1, 2, 3].map((ring) => (
        <motion.g key={ring}>
          {/* Left wave */}
          <motion.path
            d={`M ${68 - ring * 12} ${40 + ring * 5} Q ${68 - ring * 12 - 4} ${57} ${68 - ring * 12} ${74 - ring * 5}`}
            stroke="#60A5FA" strokeWidth={1.5} strokeOpacity={0.1}
            strokeLinecap="round" fill="none"
            animate={{ opacity: [0, 0.15, 0] }}
            transition={{ duration: 2, repeat: Infinity, delay: ring * 0.5 }}
          />
          {/* Right wave */}
          <motion.path
            d={`M ${92 + ring * 12} ${40 + ring * 5} Q ${92 + ring * 12 + 4} ${57} ${92 + ring * 12} ${74 - ring * 5}`}
            stroke="#60A5FA" strokeWidth={1.5} strokeOpacity={0.1}
            strokeLinecap="round" fill="none"
            animate={{ opacity: [0, 0.15, 0] }}
            transition={{ duration: 2, repeat: Infinity, delay: ring * 0.5 }}
          />
        </motion.g>
      ))}
    </svg>
  )
}
