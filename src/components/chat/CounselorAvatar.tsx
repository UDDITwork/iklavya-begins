'use client'

import { motion, AnimatePresence } from 'framer-motion'

type AvatarMood = 'idle' | 'thinking' | 'excited' | 'celebrating'

interface CounselorAvatarProps {
  mood?: AvatarMood
  size?: number
}

export default function CounselorAvatar({ mood = 'idle', size = 40 }: CounselorAvatarProps) {
  return (
    <div
      className="relative shrink-0 rounded-full bg-green-50 border-2 border-green-200 flex items-center justify-center overflow-hidden"
      style={{ width: size, height: size }}
    >
      {/* Glow ring on excited/celebrating */}
      <AnimatePresence>
        {(mood === 'excited' || mood === 'celebrating') && (
          <motion.div
            key="glow"
            className="absolute inset-0 rounded-full bg-green-400/20"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0, 0.6] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, repeat: Infinity }}
          />
        )}
      </AnimatePresence>

      {/* Face SVG */}
      <motion.svg
        viewBox="0 0 40 40"
        width={size * 0.7}
        height={size * 0.7}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        animate={mood === 'thinking' ? { rotate: [0, -5, 5, -3, 0] } : { rotate: 0 }}
        transition={mood === 'thinking' ? { duration: 1.5, repeat: Infinity, ease: 'easeInOut' } : {}}
      >
        {/* Head */}
        <circle cx="20" cy="20" r="18" fill="#166534" />

        {/* Eyes */}
        <AnimatePresence mode="wait">
          {mood === 'thinking' ? (
            // Thinking: one eye squinting
            <motion.g key="thinking-eyes"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ellipse cx="14" cy="17" rx="2.5" ry="1.5" fill="white" />
              <ellipse cx="26" cy="17" rx="2.5" ry="2.5" fill="white" />
              <circle cx="26" cy="17" r="1.2" fill="#052e16" />
            </motion.g>
          ) : mood === 'celebrating' ? (
            // Celebrating: star eyes
            <motion.g key="star-eyes"
              initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
              transition={{ type: 'spring', stiffness: 300 }}>
              <text x="10" y="21" fontSize="8" fill="#fbbf24">★</text>
              <text x="22" y="21" fontSize="8" fill="#fbbf24">★</text>
            </motion.g>
          ) : (
            // Default / excited: round eyes
            <motion.g key="normal-eyes"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <circle cx="14" cy="17" r="2.8" fill="white" />
              <circle cx="26" cy="17" r="2.8" fill="white" />
              <motion.circle cx="14" cy="17" r="1.4" fill="#052e16"
                animate={mood === 'excited' ? { x: [0, 0.5, -0.5, 0] } : {}}
                transition={{ duration: 0.5, repeat: mood === 'excited' ? Infinity : 0 }}
              />
              <motion.circle cx="26" cy="17" r="1.4" fill="#052e16"
                animate={mood === 'excited' ? { x: [0, 0.5, -0.5, 0] } : {}}
                transition={{ duration: 0.5, repeat: mood === 'excited' ? Infinity : 0, delay: 0.1 }}
              />
            </motion.g>
          )}
        </AnimatePresence>

        {/* Mouth */}
        <AnimatePresence mode="wait">
          {mood === 'celebrating' || mood === 'excited' ? (
            <motion.path key="big-smile"
              d="M12 25 Q20 32 28 25"
              stroke="white" strokeWidth="2.2" strokeLinecap="round"
              fill="none"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
              transition={{ duration: 0.4 }}
            />
          ) : mood === 'thinking' ? (
            <motion.path key="thinking-mouth"
              d="M14 27 Q20 24 26 27"
              stroke="white" strokeWidth="2" strokeLinecap="round"
              fill="none"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
            />
          ) : (
            <motion.path key="smile"
              d="M13 26 Q20 31 27 26"
              stroke="white" strokeWidth="2" strokeLinecap="round"
              fill="none"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
              transition={{ duration: 0.3 }}
            />
          )}
        </AnimatePresence>

        {/* Thinking dots */}
        <AnimatePresence>
          {mood === 'thinking' && (
            <motion.g key="thinking-dots"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {[0, 1, 2].map((i) => (
                <motion.circle
                  key={i}
                  cx={30 + i * 4}
                  cy={10}
                  r={1.2}
                  fill="#86efac"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.25 }}
                />
              ))}
            </motion.g>
          )}
        </AnimatePresence>
      </motion.svg>
    </div>
  )
}
