'use client'

import { motion } from 'framer-motion'

export default function ConfidenceSkillSpot({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 160 140" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="confFill" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#DBEAFE" stopOpacity={0.7} />
          <stop offset="100%" stopColor="#BFDBFE" stopOpacity={0.3} />
        </linearGradient>
      </defs>

      {/* Podium */}
      <motion.rect
        x={55} y={90} width={50} height={30} rx={4}
        fill="url(#confFill)"
        stroke="#1E40AF" strokeWidth={1.5} strokeOpacity={0.15}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
      />
      <motion.rect
        x={65} y={95} width={30} height={3} rx={1.5}
        fill="#1E40AF" fillOpacity={0.08}
        initial={{ width: 0 }}
        animate={{ width: 30 }}
        transition={{ delay: 0.5, duration: 0.3 }}
      />

      {/* Person — head */}
      <motion.circle
        cx={80} cy={45} r={12}
        fill="url(#confFill)"
        stroke="#1E40AF" strokeWidth={1.5} strokeOpacity={0.2}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.3, duration: 0.4 }}
      />

      {/* Person — body */}
      <motion.path
        d="M 62 88 Q 80 72 98 88"
        stroke="#1E40AF" strokeWidth={1.5} strokeOpacity={0.15}
        fill="url(#confFill)"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      />

      {/* Confidence waves — radiating arcs */}
      {[1, 2, 3, 4].map((ring) => (
        <motion.path
          key={ring}
          d={`M ${80 - ring * 16} ${45} A ${ring * 16} ${ring * 16} 0 0 1 ${80 + ring * 16} ${45}`}
          stroke="#60A5FA"
          strokeWidth={1}
          strokeOpacity={0.08}
          fill="none"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: [0, 0.12, 0] }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            delay: ring * 0.4,
            ease: 'easeOut',
          }}
        />
      ))}

      {/* Small accent dots */}
      {[
        { cx: 35, cy: 55 },
        { cx: 125, cy: 50 },
        { cx: 40, cy: 35 },
        { cx: 120, cy: 38 },
      ].map((dot, i) => (
        <motion.circle
          key={i}
          cx={dot.cx} cy={dot.cy} r={2}
          fill="#1E40AF" fillOpacity={0.08}
          animate={{ opacity: [0.04, 0.15, 0.04] }}
          transition={{ duration: 2, repeat: Infinity, delay: i * 0.5 }}
        />
      ))}
    </svg>
  )
}
