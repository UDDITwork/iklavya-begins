'use client'

import { motion, useSpring, useMotionValue, useTransform } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { useEffect, useState } from 'react'
import { Users, BookOpen, Award, Mic } from 'lucide-react'
import DotGridPattern from '@/components/illustrations/decorative/DotGridPattern'

const stats = [
  { label: 'Active Students', value: 480, icon: Users, suffix: '+' },
  { label: 'Courses Completed', value: 1250, icon: BookOpen, suffix: '+' },
  { label: 'Certifications Issued', value: 320, icon: Award, suffix: '+' },
  { label: 'Interview Sessions', value: 890, icon: Mic, suffix: '+' },
]

function CelebrationDots({ trigger }: { trigger: boolean }) {
  if (!trigger) return null

  return (
    <div className="absolute inset-0 pointer-events-none">
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i / 8) * 360
        const rad = (angle * Math.PI) / 180
        return (
          <motion.div
            key={i}
            className="absolute w-1.5 h-1.5 rounded-full bg-blue-300"
            style={{ left: '50%', top: '50%' }}
            initial={{ x: 0, y: 0, opacity: 0.7, scale: 1 }}
            animate={{
              x: Math.cos(rad) * 28,
              y: Math.sin(rad) * 28,
              opacity: 0,
              scale: 0.3,
            }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        )
      })}
    </div>
  )
}

function AnimatedCounter({
  value,
  inView,
  onComplete,
}: {
  value: number
  inView: boolean
  onComplete: () => void
}) {
  const motionValue = useMotionValue(0)
  const springValue = useSpring(motionValue, { stiffness: 50, damping: 30 })
  const display = useTransform(springValue, (v) => Math.round(v).toLocaleString())

  useEffect(() => {
    if (inView) {
      motionValue.set(value)
      const timeout = setTimeout(onComplete, 1800)
      return () => clearTimeout(timeout)
    }
  }, [inView, value, motionValue, onComplete])

  return <motion.span>{display}</motion.span>
}

export default function StatsCounter() {
  const [ref, inView] = useInView({ threshold: 0.5, triggerOnce: true })
  const [celebrated, setCelebrated] = useState<Record<number, boolean>>({})

  return (
    <section className="relative py-20 md:py-24 px-4 sm:px-6 bg-white">
      {/* Subtle dot grid background texture */}
      <DotGridPattern />

      <div className="max-w-6xl mx-auto" ref={ref}>
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-4">
            Growing Every Day
          </h2>
          <p className="text-gray-500">
            Join the growing community of career-ready students.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              className="text-center p-6 rounded-2xl bg-white border border-gray-200 shadow-sm"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08, duration: 0.4 }}
            >
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mx-auto mb-4">
                <stat.icon size={24} className="text-blue-800" />
              </div>
              <div className="relative text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                <AnimatedCounter
                  value={stat.value}
                  inView={inView}
                  onComplete={() => setCelebrated((p) => ({ ...p, [index]: true }))}
                />
                <span className="text-xl text-gray-400">{stat.suffix}</span>
                <CelebrationDots trigger={!!celebrated[index]} />
              </div>
              <div className="text-sm text-gray-500">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
