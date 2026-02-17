'use client'

import { motion } from 'framer-motion'

export default function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 flex items-center gap-1.5">
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
    </div>
  )
}
