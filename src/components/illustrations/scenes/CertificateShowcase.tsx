'use client'

import { motion } from 'framer-motion'

export default function CertificateShowcase({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 300" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="certFill" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#DBEAFE" stopOpacity={0.6} />
          <stop offset="100%" stopColor="#EFF6FF" stopOpacity={0.2} />
        </linearGradient>
        <linearGradient id="ribbonFill" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1E40AF" stopOpacity={0.2} />
          <stop offset="100%" stopColor="#60A5FA" stopOpacity={0.1} />
        </linearGradient>
        <radialGradient id="certGlow">
          <stop offset="0%" stopColor="#60A5FA" stopOpacity={0.08} />
          <stop offset="100%" stopColor="#60A5FA" stopOpacity={0} />
        </radialGradient>
      </defs>

      {/* Background glow */}
      <circle cx={200} cy={140} r={100} fill="url(#certGlow)" />

      {/* Certificate frame */}
      <motion.rect
        x={110} y={50} width={180} height={200} rx={8}
        fill="url(#certFill)" stroke="#1E40AF" strokeWidth={1.5} strokeOpacity={0.12}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      />

      {/* Inner border */}
      <motion.rect
        x={125} y={65} width={150} height={170} rx={4}
        fill="none" stroke="#1E40AF" strokeWidth={0.5} strokeOpacity={0.08}
        strokeDasharray="4 3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      />

      {/* Certificate text lines */}
      <motion.rect x={155} y={85} width={90} height={4} rx={2} fill="#1E40AF" fillOpacity={0.08}
        initial={{ width: 0 }} animate={{ width: 90 }} transition={{ delay: 0.5, duration: 0.4 }} />
      <motion.rect x={145} y={100} width={110} height={6} rx={3} fill="#1E40AF" fillOpacity={0.12}
        initial={{ width: 0 }} animate={{ width: 110 }} transition={{ delay: 0.6, duration: 0.4 }} />
      <motion.rect x={160} y={115} width={80} height={3} rx={1.5} fill="#1E40AF" fillOpacity={0.06}
        initial={{ width: 0 }} animate={{ width: 80 }} transition={{ delay: 0.7, duration: 0.3 }} />
      <motion.rect x={150} y={125} width={100} height={3} rx={1.5} fill="#1E40AF" fillOpacity={0.06}
        initial={{ width: 0 }} animate={{ width: 100 }} transition={{ delay: 0.75, duration: 0.3 }} />

      {/* Medal/Badge */}
      <motion.g
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.8, type: 'spring', stiffness: 200 }}
      >
        <circle cx={200} cy={170} r={22} fill="url(#ribbonFill)" stroke="#1E40AF" strokeWidth={1.5} strokeOpacity={0.15} />
        <circle cx={200} cy={170} r={15} fill="url(#certFill)" stroke="#1E40AF" strokeWidth={1} strokeOpacity={0.1} />
        {/* Star inside badge */}
        <motion.path
          d="M 200 158 L 203 165 L 210 166 L 205 171 L 206 178 L 200 175 L 194 178 L 195 171 L 190 166 L 197 165 Z"
          fill="#1E40AF" fillOpacity={0.15}
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{ transformOrigin: '200px 170px' }}
        />
      </motion.g>

      {/* Ribbon tails */}
      <motion.path
        d="M 188 188 L 182 210 L 190 205 L 195 215"
        stroke="url(#ribbonFill)" strokeWidth={2} strokeLinecap="round" fill="none"
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
      />
      <motion.path
        d="M 212 188 L 218 210 L 210 205 L 205 215"
        stroke="url(#ribbonFill)" strokeWidth={2} strokeLinecap="round" fill="none"
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
        transition={{ delay: 1.1, duration: 0.5 }}
      />

      {/* Confetti dots */}
      {[
        { cx: 85, cy: 70, r: 3, delay: 1.2 },
        { cx: 315, cy: 55, r: 2.5, delay: 1.3 },
        { cx: 95, cy: 200, r: 2, delay: 1.4 },
        { cx: 305, cy: 180, r: 3, delay: 1.5 },
        { cx: 140, cy: 35, r: 2, delay: 1.6 },
        { cx: 260, cy: 40, r: 2.5, delay: 1.1 },
        { cx: 320, cy: 120, r: 2, delay: 1.3 },
        { cx: 80, cy: 140, r: 2.5, delay: 1.5 },
      ].map((dot, i) => (
        <motion.circle
          key={i}
          cx={dot.cx} cy={dot.cy} r={dot.r}
          fill={i % 2 === 0 ? '#1E40AF' : '#60A5FA'}
          fillOpacity={0.1}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: [0, 1.2, 1], opacity: [0, 0.15, 0.08] }}
          transition={{ delay: dot.delay, duration: 0.5 }}
        />
      ))}

      {/* Sparkle accents */}
      {[
        { x: 230, y: 145 },
        { x: 170, y: 155 },
      ].map((s, i) => (
        <motion.g key={i}
          animate={{ opacity: [0, 0.2, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.7 + 1 }}
        >
          <line x1={s.x - 4} y1={s.y} x2={s.x + 4} y2={s.y} stroke="#60A5FA" strokeWidth={1} />
          <line x1={s.x} y1={s.y - 4} x2={s.x} y2={s.y + 4} stroke="#60A5FA" strokeWidth={1} />
        </motion.g>
      ))}
    </svg>
  )
}
