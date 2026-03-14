'use client'

import { useMemo, useEffect, useRef } from 'react'

interface AssessmentTimerProps {
  timeRemaining: number
  onTimeUp: () => void
}

export default function AssessmentTimer({ timeRemaining, onTimeUp }: AssessmentTimerProps) {
  const minutes = Math.floor(timeRemaining / 60)
  const seconds = timeRemaining % 60
  const formatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  const calledRef = useRef(false)

  const urgency = useMemo(() => {
    if (timeRemaining <= 0) return 'expired'
    if (timeRemaining <= 30) return 'critical'
    if (timeRemaining <= 120) return 'warning'
    return 'normal'
  }, [timeRemaining])

  // Trigger auto-submit when time hits 0
  useEffect(() => {
    if (timeRemaining <= 0 && !calledRef.current) {
      calledRef.current = true
      onTimeUp()
    }
  }, [timeRemaining, onTimeUp])

  return (
    <div className="flex items-center gap-2">
      <svg
        className={`w-4 h-4 ${urgency === 'normal' ? 'text-gray-500' : 'text-red-500'}`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z"
        />
      </svg>
      <span
        className={`font-mono text-lg font-semibold tabular-nums tracking-wider ${
          urgency === 'normal'
            ? 'text-gray-900'
            : urgency === 'warning'
            ? 'text-red-600 animate-pulse'
            : urgency === 'critical'
            ? 'text-red-600'
            : 'text-red-600'
        }`}
        style={
          urgency === 'critical'
            ? { animation: 'pulse 0.5s cubic-bezier(0.4, 0, 0.6, 1) infinite' }
            : undefined
        }
      >
        {formatted}
      </span>
    </div>
  )
}
