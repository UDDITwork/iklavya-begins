'use client'

import { motion } from 'framer-motion'
import { letterContainer, letterVariant } from '@/lib/animations'

interface TextRevealProps {
  text: string
  className?: string
  delay?: number
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span'
}

export default function TextReveal({
  text,
  className = '',
  delay = 0,
  as: Tag = 'h1',
}: TextRevealProps) {
  const MotionTag = motion.create(Tag)

  return (
    <MotionTag
      className={className}
      variants={letterContainer}
      initial="initial"
      animate="animate"
      transition={{ delayChildren: delay }}
    >
      {text.split('').map((char, index) => (
        <motion.span
          key={`${char}-${index}`}
          variants={letterVariant}
          className="inline-block"
          style={{ whiteSpace: char === ' ' ? 'pre' : undefined }}
        >
          {char === ' ' ? '\u00A0' : char}
        </motion.span>
      ))}
    </MotionTag>
  )
}
