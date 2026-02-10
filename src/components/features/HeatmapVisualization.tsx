'use client'

import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { useMemo } from 'react'

interface HeatmapVisualizationProps {
  title?: string
  rows?: number
  cols?: number
}

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const hours = ['6am', '9am', '12pm', '3pm', '6pm', '9pm', '12am']

export default function HeatmapVisualization({
  title = 'User Activity',
  rows = 7,
  cols = 7,
}: HeatmapVisualizationProps) {
  const [ref, inView] = useInView({ threshold: 0.3, triggerOnce: true })

  const data = useMemo(
    () =>
      Array.from({ length: rows }, () =>
        Array.from({ length: cols }, () => Math.random())
      ),
    [rows, cols]
  )

  const getColor = (value: number) => {
    if (value < 0.2) return 'rgba(139, 92, 246, 0.05)'
    if (value < 0.4) return 'rgba(139, 92, 246, 0.15)'
    if (value < 0.6) return 'rgba(139, 92, 246, 0.3)'
    if (value < 0.8) return 'rgba(139, 92, 246, 0.5)'
    return 'rgba(139, 92, 246, 0.75)'
  }

  return (
    <div ref={ref} className="space-y-3">
      <h4 className="text-sm font-medium text-white/60">{title}</h4>

      <div className="flex gap-1">
        {/* Day labels */}
        <div className="flex flex-col gap-1 pr-2">
          <div className="h-5" />
          {days.map((day) => (
            <div key={day} className="h-8 flex items-center text-[10px] text-white/30">
              {day}
            </div>
          ))}
        </div>

        {/* Grid */}
        <div>
          {/* Hour labels */}
          <div className="flex gap-1 mb-1">
            {hours.map((hour) => (
              <div key={hour} className="w-8 text-center text-[10px] text-white/30">
                {hour}
              </div>
            ))}
          </div>

          {/* Cells */}
          <div className="flex flex-col gap-1">
            {data.map((row, ri) => (
              <div key={ri} className="flex gap-1">
                {row.map((value, ci) => (
                  <motion.div
                    key={`${ri}-${ci}`}
                    className="w-8 h-8 rounded-[4px] cursor-pointer relative group"
                    style={{ background: getColor(value) }}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={
                      inView
                        ? { opacity: 1, scale: 1 }
                        : {}
                    }
                    transition={{
                      delay: (ri * cols + ci) * 0.02,
                      duration: 0.3,
                    }}
                    whileHover={{ scale: 1.2, zIndex: 10 }}
                  >
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2
                      px-2 py-1 rounded bg-white/10 backdrop-blur text-[10px] text-white
                      opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                      {Math.round(value * 500)} sessions
                    </div>
                  </motion.div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2 text-[10px] text-white/30">
        <span>Less</span>
        {[0.1, 0.3, 0.5, 0.7, 0.9].map((v) => (
          <div
            key={v}
            className="w-4 h-4 rounded-[2px]"
            style={{ background: getColor(v) }}
          />
        ))}
        <span>More</span>
      </div>
    </div>
  )
}
