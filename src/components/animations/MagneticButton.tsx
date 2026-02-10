'use client'

import { motion, useMotionValue, useSpring } from 'framer-motion'
import { useRef, useState, type MouseEvent, type ReactNode } from 'react'

interface MagneticButtonProps {
  children: ReactNode
  className?: string
  onClick?: () => void
  href?: string
}

export default function MagneticButton({
  children,
  className = '',
  onClick,
  href,
}: MagneticButtonProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [ripples, setRipples] = useState<{ x: number; y: number; id: number }[]>([])

  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const springX = useSpring(x, { stiffness: 150, damping: 15 })
  const springY = useSpring(y, { stiffness: 150, damping: 15 })

  const handleMouseMove = (e: MouseEvent) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    x.set((e.clientX - centerX) * 0.3)
    y.set((e.clientY - centerY) * 0.3)
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
  }

  const handleClick = (e: MouseEvent) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const rippleX = e.clientX - rect.left
    const rippleY = e.clientY - rect.top
    const id = Date.now()
    setRipples((prev) => [...prev, { x: rippleX, y: rippleY, id }])
    setTimeout(() => setRipples((prev) => prev.filter((r) => r.id !== id)), 600)
    onClick?.()
  }

  return (
    <motion.div
      ref={ref}
      className={`relative overflow-hidden cursor-pointer inline-flex items-center justify-center
        px-8 py-4 rounded-full font-semibold text-white
        bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500
        hover:shadow-[0_0_30px_rgba(139,92,246,0.5)]
        transition-shadow duration-300 ${className}`}
      style={{ x: springX, y: springY }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={(e) => {
        handleClick(e)
        if (href) {
          window.location.href = href
        }
      }}
      whileTap={{ scale: 0.95 }}
      role={href ? 'link' : 'button'}
    >
      <span className="relative z-10">{children}</span>
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className="absolute rounded-full bg-white/30"
          style={{
            left: ripple.x - 50,
            top: ripple.y - 50,
            width: 100,
            height: 100,
            animation: 'ripple 0.6s ease-out forwards',
          }}
        />
      ))}
      <style jsx>{`
        @keyframes ripple {
          from {
            transform: scale(0);
            opacity: 1;
          }
          to {
            transform: scale(3);
            opacity: 0;
          }
        }
      `}</style>
    </motion.div>
  )
}
