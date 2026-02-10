'use client'

import { motion } from 'framer-motion'

const shapes = [
  { type: 'hexagon', x: 85, y: 15, size: 28, delay: 0, duration: 18 },
  { type: 'triangle', x: 12, y: 70, size: 22, delay: 2, duration: 22 },
  { type: 'circle', x: 75, y: 80, size: 16, delay: 4, duration: 20 },
  { type: 'diamond', x: 30, y: 25, size: 18, delay: 1, duration: 24 },
]

function hexPath(cx: number, cy: number, r: number) {
  const pts = Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 3) * i - Math.PI / 2
    return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`
  })
  return `M${pts.join('L')}Z`
}

export default function FloatingShapes({ className }: { className?: string }) {
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className || ''}`}>
      {shapes.map((s, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{ left: `${s.x}%`, top: `${s.y}%` }}
          animate={{
            y: [0, -15, 5, -10, 0],
            x: [0, 8, -5, 3, 0],
          }}
          transition={{
            duration: s.duration,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: s.delay,
          }}
        >
          <svg width={s.size * 2} height={s.size * 2} viewBox={`0 0 ${s.size * 2} ${s.size * 2}`} fill="none">
            {s.type === 'hexagon' && (
              <path
                d={hexPath(s.size, s.size, s.size * 0.8)}
                stroke="#1E40AF" strokeWidth={1} strokeOpacity={0.05}
                fill="#DBEAFE" fillOpacity={0.03}
              />
            )}
            {s.type === 'triangle' && (
              <path
                d={`M${s.size},${s.size * 0.3} L${s.size * 1.6},${s.size * 1.5} L${s.size * 0.4},${s.size * 1.5}Z`}
                stroke="#60A5FA" strokeWidth={1} strokeOpacity={0.04}
                fill="#EFF6FF" fillOpacity={0.03}
              />
            )}
            {s.type === 'circle' && (
              <circle
                cx={s.size} cy={s.size} r={s.size * 0.7}
                stroke="#1E40AF" strokeWidth={1} strokeOpacity={0.04}
                fill="#DBEAFE" fillOpacity={0.02}
              />
            )}
            {s.type === 'diamond' && (
              <path
                d={`M${s.size},${s.size * 0.3} L${s.size * 1.5},${s.size} L${s.size},${s.size * 1.7} L${s.size * 0.5},${s.size}Z`}
                stroke="#60A5FA" strokeWidth={1} strokeOpacity={0.05}
                fill="#EFF6FF" fillOpacity={0.02}
              />
            )}
          </svg>
        </motion.div>
      ))}
    </div>
  )
}
