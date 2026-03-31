'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface SessionProgressProps {
  percent: number
  remainingEstimate: number | null
  status: 'on_track' | 'direction_changed' | 'deepening' | 'ready'
}

const STATUS_MESSAGES: Record<string, string> = {
  on_track: 'Great answers! Keep going...',
  direction_changed: "Interesting! Let's explore this new direction...",
  deepening: 'Going deeper — this helps a lot!',
  ready: 'Wrapping up your analysis...',
}

export default function SessionProgress({ percent, remainingEstimate, status }: SessionProgressProps) {
  const prevPercentRef = useRef(percent)
  const [isDecreasing, setIsDecreasing] = useState(false)
  const [flashAmber, setFlashAmber] = useState(false)

  useEffect(() => {
    const prev = prevPercentRef.current
    if (percent < prev) {
      setIsDecreasing(true)
      setFlashAmber(true)
      const t = setTimeout(() => {
        setIsDecreasing(false)
        setFlashAmber(false)
      }, 1800)
      return () => clearTimeout(t)
    } else {
      setIsDecreasing(false)
    }
    prevPercentRef.current = percent
  }, [percent])

  const isComplete = percent >= 100 || status === 'ready'

  const barColor = isComplete
    ? 'bg-green-600'
    : flashAmber
    ? 'bg-amber-500'
    : 'bg-green-700'

  function getLabel() {
    if (isComplete) return 'Analysis Ready!'
    if (percent === 0) return 'Starting your session...'
    if (remainingEstimate !== null && remainingEstimate > 0) {
      return `${percent}% · ~${remainingEstimate} question${remainingEstimate === 1 ? '' : 's'} left`
    }
    if (remainingEstimate === 0) return 'Almost there! Wrapping up...'
    return `${percent}% complete`
  }

  return (
    <div className="shrink-0 bg-white border-b border-gray-100 px-4 sm:px-6 py-2">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-1.5">
          <AnimatePresence mode="wait">
            <motion.span
              key={status + flashAmber}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.2 }}
              className={`text-[11px] font-medium ${
                flashAmber
                  ? 'text-amber-600'
                  : isComplete
                  ? 'text-green-700'
                  : 'text-gray-500'
              }`}
            >
              {flashAmber ? STATUS_MESSAGES.direction_changed : STATUS_MESSAGES[status] ?? STATUS_MESSAGES.on_track}
            </motion.span>
          </AnimatePresence>
          <AnimatePresence mode="wait">
            <motion.span
              key={percent}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className={`text-[11px] font-semibold ${
                flashAmber ? 'text-amber-600' : isComplete ? 'text-green-700' : 'text-gray-600'
              }`}
            >
              {getLabel()}
            </motion.span>
          </AnimatePresence>
        </div>

        {/* Track */}
        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${barColor} ${isComplete ? 'animate-pulse' : ''}`}
            animate={{ width: `${Math.max(2, percent)}%` }}
            transition={{
              duration: isDecreasing ? 0.6 : 0.7,
              ease: isDecreasing ? 'easeOut' : 'easeInOut',
            }}
          />
        </div>
      </div>
    </div>
  )
}
