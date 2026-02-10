'use client'

import { motion } from 'framer-motion'

const nodes = [
  { x: 200, y: 55, delay: 0.4 },
  { x: 330, y: 130, delay: 0.6 },
  { x: 335, y: 275, delay: 0.8 },
  { x: 200, y: 345, delay: 1.0 },
  { x: 65, y: 275, delay: 1.2 },
  { x: 70, y: 130, delay: 1.4 },
]

export default function SkillConstellationHero({ className }: { className?: string }) {
  const cx = 200
  const cy = 195

  return (
    <svg viewBox="0 0 400 400" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="constGlow">
          <stop offset="0%" stopColor="#60A5FA" stopOpacity={0.12} />
          <stop offset="100%" stopColor="#60A5FA" stopOpacity={0} />
        </radialGradient>
        <linearGradient id="constNodeFill" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#DBEAFE" stopOpacity={0.7} />
          <stop offset="100%" stopColor="#BFDBFE" stopOpacity={0.3} />
        </linearGradient>
      </defs>

      {/* Central glow */}
      <circle cx={cx} cy={cy} r={130} fill="url(#constGlow)" />

      {/* Secondary ring */}
      <motion.circle
        cx={cx} cy={cy} r={100}
        fill="none" stroke="#1E40AF" strokeWidth={0.5} strokeOpacity={0.06}
        strokeDasharray="4 6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.3 }}
      />

      {/* Connection lines from center to each node */}
      {nodes.map((node, i) => (
        <motion.line
          key={`line-${i}`}
          x1={cx} y1={cy}
          x2={node.x} y2={node.y}
          stroke="#1E40AF"
          strokeWidth={1}
          strokeOpacity={0.08}
          strokeDasharray="2 4"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.8, delay: node.delay }}
        />
      ))}

      {/* Cross-connections between adjacent nodes */}
      {nodes.map((node, i) => {
        const next = nodes[(i + 1) % nodes.length]
        return (
          <motion.line
            key={`cross-${i}`}
            x1={node.x} y1={node.y}
            x2={next.x} y2={next.y}
            stroke="#60A5FA"
            strokeWidth={0.5}
            strokeOpacity={0.06}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.6, delay: node.delay + 0.5 }}
          />
        )
      })}

      {/* Central figure — head */}
      <motion.circle
        cx={cx} cy={cy - 22}
        r={20}
        fill="url(#constNodeFill)"
        stroke="#1E40AF"
        strokeWidth={1.5}
        strokeOpacity={0.15}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      />

      {/* Central figure — shoulders */}
      <motion.path
        d={`M ${cx - 28} ${cy + 12} Q ${cx} ${cy - 2} ${cx + 28} ${cy + 12}`}
        stroke="#1E40AF"
        strokeWidth={1.5}
        strokeOpacity={0.12}
        fill="url(#constNodeFill)"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.35 }}
      />

      {/* Orbiting nodes */}
      {nodes.map((node, i) => (
        <g key={`node-${i}`}>
          {/* Node circle */}
          <motion.circle
            cx={node.x} cy={node.y} r={14}
            fill="url(#constNodeFill)"
            stroke="#1E40AF"
            strokeWidth={1}
            strokeOpacity={0.12}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4, delay: node.delay + 0.3 }}
          />

          {/* Pulse ring */}
          <motion.circle
            cx={node.x} cy={node.y} r={18}
            fill="none" stroke="#60A5FA" strokeWidth={0.8}
            animate={{ opacity: [0.08, 0, 0.08] }}
            transition={{ duration: 3, repeat: Infinity, delay: i * 0.4 }}
          />

          {/* Inner dot */}
          <motion.circle
            cx={node.x} cy={node.y} r={3}
            fill="#1E40AF" fillOpacity={0.25}
            initial={{ scale: 0 }}
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity, delay: node.delay }}
          />
        </g>
      ))}

      {/* Midpoint dots along connection lines */}
      {nodes.map((node, i) => {
        const mx = (cx + node.x) / 2
        const my = (cy + node.y) / 2
        return (
          <motion.circle
            key={`mid-${i}`}
            cx={mx} cy={my} r={1.5}
            fill="#60A5FA" fillOpacity={0.15}
            animate={{ opacity: [0.08, 0.2, 0.08] }}
            transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.3 }}
          />
        )
      })}
    </svg>
  )
}
