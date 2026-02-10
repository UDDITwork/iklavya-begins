import type { Variants, Transition } from 'framer-motion'

// Fade in from bottom
export const fadeInUp: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
}

export const fadeInUpTransition: Transition = {
  duration: 0.5,
  ease: [0.4, 0, 0.2, 1],
}

// Fade in from left
export const slideInFromLeft: Variants = {
  initial: { x: -100, opacity: 0 },
  animate: { x: 0, opacity: 1 },
}

// Fade in from right
export const slideInFromRight: Variants = {
  initial: { x: 100, opacity: 0 },
  animate: { x: 0, opacity: 1 },
}

// Scale fade in
export const scaleFadeIn: Variants = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1 },
}

// Stagger container
export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
}

// Stagger item (child of staggerContainer)
export const staggerItem: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
}

// Scale on hover
export const scaleOnHover = {
  whileHover: { scale: 1.05 },
  whileTap: { scale: 0.95 },
  transition: { type: 'spring' as const, stiffness: 400, damping: 17 },
}

// Magnetic button helper
export const magneticButton = (x: number, y: number) => ({
  x: x * 0.3,
  y: y * 0.3,
  transition: { type: 'spring' as const, stiffness: 150, damping: 15 },
})

// Letter stagger for text reveal
export const letterContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.03,
    },
  },
}

export const letterVariant: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
  },
}

// Page transition
export const pageTransition: Variants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
}

// Card hover glow
export const cardHoverGlow: Variants = {
  initial: { boxShadow: '0 0 0 rgba(139, 92, 246, 0)' },
  hover: { boxShadow: '0 0 30px rgba(139, 92, 246, 0.3), 0 0 60px rgba(59, 130, 246, 0.15)' },
}

// Orbit animation configs for hero icons
export const orbitConfig = (index: number, total: number) => {
  const angle = (index / total) * Math.PI * 2
  const radius = 200
  return {
    initial: {
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
    },
    animate: {
      x: [Math.cos(angle) * radius, Math.cos(angle + Math.PI * 2) * radius],
      y: [Math.sin(angle) * radius, Math.sin(angle + Math.PI * 2) * radius],
    },
    transition: {
      duration: 20 + index * 2,
      repeat: Infinity,
      ease: 'linear' as const,
    },
  }
}
