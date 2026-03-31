'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Keyboard } from 'lucide-react'

interface AnswerBubblesProps {
  options: string[]
  onSelect: (option: string) => void
  onCustom: () => void
  disabled?: boolean
}

export default function AnswerBubbles({ options, onSelect, onCustom, disabled = false }: AnswerBubblesProps) {
  const [selected, setSelected] = useState<string | null>(null)

  function handleSelect(option: string) {
    if (disabled || selected) return
    // Detect "type your own" options
    if (
      option.toLowerCase().includes('type') ||
      option.toLowerCase().includes('something else') ||
      option.toLowerCase().includes("i'll")
    ) {
      onCustom()
      return
    }
    setSelected(option)
    // Small delay so user sees selection feedback before message sends
    setTimeout(() => onSelect(option), 300)
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="flex flex-wrap gap-2 justify-start pl-0 sm:pl-1 pb-1"
      >
        {options.map((option, i) => {
          const isCustom =
            option.toLowerCase().includes('type') ||
            option.toLowerCase().includes('something else') ||
            option.toLowerCase().includes("i'll")
          const isSelected = selected === option

          return (
            <motion.button
              key={i}
              onClick={() => handleSelect(option)}
              disabled={disabled || (!!selected && !isSelected)}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{
                opacity: selected && !isSelected ? 0.35 : 1,
                scale: isSelected ? 1.05 : 1,
              }}
              whileHover={!disabled && !selected ? { scale: 1.04, y: -1 } : {}}
              whileTap={!disabled && !selected ? { scale: 0.97 } : {}}
              transition={{ duration: 0.18, delay: i * 0.06, type: 'spring', stiffness: 400, damping: 20 }}
              className={[
                'flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border-2 transition-colors duration-150',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-green-400',
                isSelected
                  ? 'bg-green-800 border-green-800 text-white shadow-md'
                  : isCustom
                  ? 'bg-white border-dashed border-gray-300 text-gray-500 hover:border-green-400 hover:text-green-700'
                  : 'bg-white border-green-700 text-green-800 hover:bg-green-800 hover:text-white',
                (disabled || (!!selected && !isSelected)) ? 'cursor-not-allowed' : 'cursor-pointer',
              ].join(' ')}
            >
              {isCustom && <Keyboard size={13} className="shrink-0 opacity-70" />}
              {isSelected && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-3.5 h-3.5 rounded-full bg-white/30 flex items-center justify-center text-[10px]"
                >
                  ✓
                </motion.span>
              )}
              <span>{option}</span>
            </motion.button>
          )
        })}
      </motion.div>
    </AnimatePresence>
  )
}
