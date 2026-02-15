'use client'

import { motion } from 'framer-motion'

export default function CommSkillSpot({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 160 140" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="commBubble1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#DCFCE7" stopOpacity={0.7} />
          <stop offset="100%" stopColor="#BBF7D0" stopOpacity={0.3} />
        </linearGradient>
        <linearGradient id="commBubble2" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#F0FDF4" stopOpacity={0.6} />
          <stop offset="100%" stopColor="#DCFCE7" stopOpacity={0.3} />
        </linearGradient>
      </defs>

      {/* Left speech bubble */}
      <motion.g
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <rect x="15" y="30" width="65" height="45" rx="12" fill="url(#commBubble1)" stroke="#166534" strokeWidth={1.5} strokeOpacity={0.15} />
        <polygon points="50,75 55,88 60,75" fill="url(#commBubble1)" stroke="#166534" strokeWidth={1.5} strokeOpacity={0.15} strokeLinejoin="round" />
        {/* Text lines */}
        <motion.rect x="25" y="42" width="35" height="3" rx="1.5" fill="#166534" fillOpacity={0.12}
          initial={{ width: 0 }} animate={{ width: 35 }} transition={{ delay: 0.5, duration: 0.4 }} />
        <motion.rect x="25" y="50" width="28" height="3" rx="1.5" fill="#166534" fillOpacity={0.08}
          initial={{ width: 0 }} animate={{ width: 28 }} transition={{ delay: 0.6, duration: 0.4 }} />
        <motion.rect x="25" y="58" width="40" height="3" rx="1.5" fill="#166534" fillOpacity={0.06}
          initial={{ width: 0 }} animate={{ width: 40 }} transition={{ delay: 0.7, duration: 0.4 }} />
      </motion.g>

      {/* Right speech bubble */}
      <motion.g
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <rect x="80" y="50" width="65" height="40" rx="12" fill="url(#commBubble2)" stroke="#4ADE80" strokeWidth={1} strokeOpacity={0.12} />
        <polygon points="95,90 90,100 100,90" fill="url(#commBubble2)" stroke="#4ADE80" strokeWidth={1} strokeOpacity={0.12} strokeLinejoin="round" />
        <motion.rect x="90" y="62" width="30" height="3" rx="1.5" fill="#4ADE80" fillOpacity={0.15}
          initial={{ width: 0 }} animate={{ width: 30 }} transition={{ delay: 0.8, duration: 0.4 }} />
        <motion.rect x="90" y="70" width="42" height="3" rx="1.5" fill="#4ADE80" fillOpacity={0.10}
          initial={{ width: 0 }} animate={{ width: 42 }} transition={{ delay: 0.9, duration: 0.4 }} />
      </motion.g>

      {/* Connection dots trail between bubbles */}
      {[0, 1, 2].map((i) => (
        <motion.circle
          key={i}
          cx={68 + i * 8}
          cy={55 + i * 5}
          r={2}
          fill="#166534"
          fillOpacity={0.1}
          animate={{ opacity: [0.05, 0.2, 0.05] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3 }}
        />
      ))}
    </svg>
  )
}
