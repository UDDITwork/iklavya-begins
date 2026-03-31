'use client'

import { motion } from 'framer-motion'
import CounselorAvatar from './CounselorAvatar'

export default function TypingIndicator() {
  return (
    <div className="flex justify-start items-end gap-2">
      <CounselorAvatar mood="thinking" size={32} />
      <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-3 shadow-sm">
        <div className="flex items-center gap-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full bg-green-600"
              animate={{ y: ['0px', '-6px', '0px'] }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                delay: i * 0.15,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>
        <motion.span
          className="text-xs text-gray-400 font-medium"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        >
          IKLAVYA is thinking...
        </motion.span>
      </div>
    </div>
  )
}
