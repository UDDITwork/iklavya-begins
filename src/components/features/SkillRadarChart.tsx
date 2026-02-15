'use client'

import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'

interface SkillData {
  label: string
  value: number
  maxValue: number
}

interface SkillRadarChartProps {
  skills: SkillData[]
  size?: number
  comparison?: SkillData[]
  showComparison?: boolean
}

export default function SkillRadarChart({
  skills,
  size = 300,
  comparison,
  showComparison = false,
}: SkillRadarChartProps) {
  const [ref, inView] = useInView({ threshold: 0.5, triggerOnce: true })
  const center = size / 2
  const radius = size / 2 - 40
  const sides = skills.length

  const getPoint = (index: number, value: number, maxValue: number) => {
    const angle = (Math.PI * 2 * index) / sides - Math.PI / 2
    const r = (value / maxValue) * radius
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    }
  }

  const gridLevels = [0.2, 0.4, 0.6, 0.8, 1]

  const mainPath = skills
    .map((s, i) => {
      const p = getPoint(i, s.value, s.maxValue)
      return `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`
    })
    .join(' ') + ' Z'

  const comparisonPath = comparison
    ? comparison
        .map((s, i) => {
          const p = getPoint(i, s.value, s.maxValue)
          return `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`
        })
        .join(' ') + ' Z'
    : ''

  return (
    <div ref={ref} className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="overflow-visible">
        {/* Grid */}
        {gridLevels.map((level) => {
          const gridPath = skills
            .map((_, i) => {
              const angle = (Math.PI * 2 * i) / sides - Math.PI / 2
              const r = level * radius
              const x = center + r * Math.cos(angle)
              const y = center + r * Math.sin(angle)
              return `${i === 0 ? 'M' : 'L'} ${x} ${y}`
            })
            .join(' ') + ' Z'

          return (
            <path
              key={level}
              d={gridPath}
              fill="none"
              stroke="#E5E7EB"
              strokeWidth={1}
            />
          )
        })}

        {/* Axis lines */}
        {skills.map((_, i) => {
          const angle = (Math.PI * 2 * i) / sides - Math.PI / 2
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={center + radius * Math.cos(angle)}
              y2={center + radius * Math.sin(angle)}
              stroke="#E5E7EB"
              strokeWidth={1}
            />
          )
        })}

        {/* Comparison area */}
        {showComparison && comparisonPath && (
          <motion.path
            d={comparisonPath}
            fill="rgba(239, 68, 68, 0.06)"
            stroke="#EF4444"
            strokeWidth={1.5}
            strokeDasharray="4 4"
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 1 }}
          />
        )}

        {/* Main skill area */}
        <motion.path
          d={mainPath}
          fill="rgba(22, 101, 52, 0.08)"
          stroke="#166534"
          strokeWidth={2}
          initial={{ pathLength: 0, opacity: 0 }}
          animate={inView ? { pathLength: 1, opacity: 1 } : {}}
          transition={{ duration: 1.5, ease: 'easeOut' }}
        />

        {/* Data points */}
        {skills.map((skill, i) => {
          const p = getPoint(i, skill.value, skill.maxValue)
          return (
            <motion.circle
              key={i}
              cx={p.x}
              cy={p.y}
              r={4}
              fill="#166534"
              stroke="#fff"
              strokeWidth={2}
              initial={{ scale: 0, opacity: 0 }}
              animate={inView ? { scale: 1, opacity: 1 } : {}}
              transition={{ delay: 0.5 + i * 0.1, duration: 0.3 }}
            />
          )
        })}

        {/* Labels */}
        {skills.map((skill, i) => {
          const angle = (Math.PI * 2 * i) / sides - Math.PI / 2
          const labelR = radius + 25
          const x = center + labelR * Math.cos(angle)
          const y = center + labelR * Math.sin(angle)
          return (
            <text
              key={i}
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-[11px] fill-gray-500"
            >
              {skill.label}
            </text>
          )
        })}
      </svg>
    </div>
  )
}
