'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

interface MirrorEffectProps {
  studentAnswer: string
  idealAnswer: string
  betterWords?: Array<{ original: string; suggestion: string }>
}

const FILLER_WORDS = [
  'um', 'uh', 'hmm', 'like', 'you know', 'basically', 'actually',
  'literally', 'right', 'i mean', 'kind of', 'sort of',
]

function highlightWeaknesses(text: string, betterWords?: Array<{ original: string; suggestion: string }>): React.ReactNode[] {
  // Build pattern from filler words + better_words originals
  const patterns = [...FILLER_WORDS]
  if (betterWords) {
    for (const bw of betterWords) {
      if (bw.original && !patterns.includes(bw.original.toLowerCase())) {
        patterns.push(bw.original.toLowerCase())
      }
    }
  }

  const regex = new RegExp(`(${patterns.map(p => `\\b${p}\\b`).join('|')})`, 'gi')
  const parts = text.split(regex)

  return parts.map((part, i) => {
    const isWeak = patterns.some(p => part.toLowerCase() === p.toLowerCase())
    if (isWeak) {
      // Find if there's a better word suggestion
      const suggestion = betterWords?.find(
        bw => bw.original.toLowerCase() === part.toLowerCase()
      )
      return (
        <span key={i} className="relative group inline">
          <span className="text-red-400 bg-red-500/15 rounded px-0.5 line-through decoration-red-400/50">
            {part}
          </span>
          {suggestion && (
            <span className="absolute -top-6 left-0 hidden group-hover:block bg-gray-900 text-green-400 text-[10px] px-2 py-0.5 rounded whitespace-nowrap z-10">
              {suggestion.suggestion}
            </span>
          )}
        </span>
      )
    }
    return <span key={i}>{part}</span>
  })
}

function TypewriterText({ text, speed = 20 }: { text: string; speed?: number }) {
  const [displayed, setDisplayed] = useState('')
  const [isComplete, setIsComplete] = useState(false)
  const indexRef = useRef(0)

  useEffect(() => {
    indexRef.current = 0
    setDisplayed('')
    setIsComplete(false)

    const interval = setInterval(() => {
      if (indexRef.current < text.length) {
        setDisplayed(text.substring(0, indexRef.current + 1))
        indexRef.current++
      } else {
        setIsComplete(true)
        clearInterval(interval)
      }
    }, speed)

    return () => clearInterval(interval)
  }, [text, speed])

  return (
    <span>
      {displayed}
      {!isComplete && (
        <motion.span
          className="inline-block w-[2px] h-[14px] bg-green-500 ml-0.5 align-middle"
          animate={{ opacity: [1, 0, 1] }}
          transition={{ duration: 0.8, repeat: Infinity }}
        />
      )}
    </span>
  )
}

export default function MirrorEffect({ studentAnswer, idealAnswer, betterWords }: MirrorEffectProps) {
  const [showIdeal, setShowIdeal] = useState(false)

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
      {/* Student's answer — with highlighted weaknesses */}
      <div className="bg-gray-50 rounded-lg px-3 py-2.5 border border-gray-100">
        <div className="flex items-center gap-1.5 mb-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
          <p className="text-[10px] font-semibold uppercase text-gray-400 tracking-wider">
            What you said
          </p>
        </div>
        <p className="text-xs text-gray-600 leading-relaxed">
          {highlightWeaknesses(studentAnswer, betterWords)}
        </p>
        <p className="text-[9px] text-gray-300 mt-2 italic">
          Hover red words for suggestions
        </p>
      </div>

      {/* Ideal answer — typewriter reveal */}
      <div className="bg-green-50 rounded-lg px-3 py-2.5 border border-green-100 relative overflow-hidden">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
            <p className="text-[10px] font-semibold uppercase text-green-600 tracking-wider">
              Ideal approach
            </p>
          </div>
          {!showIdeal && (
            <button
              onClick={() => setShowIdeal(true)}
              className="text-[10px] text-green-700 font-medium hover:underline"
            >
              Reveal
            </button>
          )}
        </div>
        <div className="text-xs text-green-800 leading-relaxed min-h-[40px]">
          {showIdeal ? (
            <TypewriterText text={idealAnswer} speed={15} />
          ) : (
            <p className="text-green-400 italic">Click &quot;Reveal&quot; to see the ideal answer...</p>
          )}
        </div>
      </div>
    </div>
  )
}
