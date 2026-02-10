'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

interface AIAvatarSceneProps {
  speaking?: boolean
}

export default function AIAvatarScene({ speaking = false }: AIAvatarSceneProps) {
  const [blink, setBlink] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setBlink(true)
      setTimeout(() => setBlink(false), 150)
    }, 3000 + Math.random() * 2000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="w-full h-full flex items-center justify-center bg-blue-50 rounded-xl">
      <div className="text-center">
        {/* Glow ring */}
        <div className="relative mx-auto mb-3" style={{ width: 88, height: 88 }}>
          {speaking && (
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{ boxShadow: '0 0 20px rgba(30,64,175,0.15)' }}
              animate={{ scale: [1, 1.08, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          )}

          <svg viewBox="0 0 120 120" width="88" height="88">
            {/* Background circle */}
            <circle cx="60" cy="60" r="54" fill="#DBEAFE" />
            <circle cx="60" cy="60" r="54" fill="url(#avatarGrad)" />
            <defs>
              <radialGradient id="avatarGrad" cx="40%" cy="35%">
                <stop offset="0%" stopColor="#BFDBFE" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#DBEAFE" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Head outline */}
            <circle cx="60" cy="62" r="32" fill="none" stroke="#93C5FD" strokeWidth="2.5" />

            {/* Left eye */}
            <motion.ellipse
              cx="48" cy="58" rx="4" ry={blink ? 0.5 : 4}
              fill="#1E40AF"
              transition={{ duration: 0.1 }}
            />
            {/* Right eye */}
            <motion.ellipse
              cx="72" cy="58" rx="4" ry={blink ? 0.5 : 4}
              fill="#1E40AF"
              transition={{ duration: 0.1 }}
            />

            {/* Mouth */}
            {speaking ? (
              <motion.ellipse
                cx="60" cy="74" rx="8"
                fill="#1E40AF"
                animate={{ ry: [2, 5, 2] }}
                transition={{ duration: 0.4, repeat: Infinity }}
              />
            ) : (
              <path
                d="M52 72 Q60 78 68 72"
                fill="none" stroke="#1E40AF" strokeWidth="2.5" strokeLinecap="round"
              />
            )}

            {/* Antenna */}
            <line x1="60" y1="30" x2="60" y2="20" stroke="#93C5FD" strokeWidth="2" />
            <motion.circle
              cx="60" cy="17" r="3" fill="#60A5FA"
              animate={speaking
                ? { opacity: [0.5, 1, 0.5], scale: [0.9, 1.1, 0.9] }
                : { opacity: [0.6, 1, 0.6] }
              }
              transition={{
                duration: speaking ? 0.6 : 2,
                repeat: Infinity,
              }}
            />

            {/* Signal arcs (speaking only) */}
            {speaking && (
              <>
                <motion.path
                  d="M50 14 Q60 8 70 14"
                  fill="none" stroke="#60A5FA" strokeWidth="1.5" strokeLinecap="round"
                  animate={{ opacity: [0, 1, 0], scale: [0.9, 1.1, 0.9] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
                <motion.path
                  d="M44 10 Q60 2 76 10"
                  fill="none" stroke="#60A5FA" strokeWidth="1" strokeLinecap="round"
                  animate={{ opacity: [0, 0.7, 0], scale: [0.9, 1.15, 0.9] }}
                  transition={{ duration: 1, repeat: Infinity, delay: 0.3 }}
                />
              </>
            )}
          </svg>
        </div>

        <p className="text-xs text-gray-500 font-medium">
          {speaking ? 'Speaking...' : 'AI Interviewer'}
        </p>
      </div>
    </div>
  )
}
