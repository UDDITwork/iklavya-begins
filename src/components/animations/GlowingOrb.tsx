'use client'

import { motion } from 'framer-motion'

interface GlowingOrbProps {
  size?: number
  color?: string
  x?: string
  y?: string
  delay?: number
}

export default function GlowingOrb({
  size = 300,
  color = 'rgba(139, 92, 246, 0.15)',
  x = '50%',
  y = '50%',
  delay = 0,
}: GlowingOrbProps) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none blur-3xl"
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle, ${color}, transparent 70%)`,
        left: x,
        top: y,
        transform: 'translate(-50%, -50%)',
      }}
      animate={{
        scale: [1, 1.2, 1],
        opacity: [0.3, 0.6, 0.3],
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        ease: 'easeInOut',
        delay,
      }}
    />
  )
}
