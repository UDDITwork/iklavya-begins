'use client'

import { motion, useSpring, useMotionValue, useTransform } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { useEffect } from 'react'
import { Users, BookOpen, Award, Mic } from 'lucide-react'

const stats = [
  { label: 'Active Students', value: 50000, icon: Users, suffix: '+', color: '#3b82f6' },
  { label: 'Courses Completed', value: 125000, icon: BookOpen, suffix: '+', color: '#8b5cf6' },
  { label: 'Certifications Issued', value: 32000, icon: Award, suffix: '+', color: '#f59e0b' },
  { label: 'Interview Sessions', value: 89000, icon: Mic, suffix: '+', color: '#ec4899' },
]

function AnimatedCounter({
  value,
  inView,
}: {
  value: number
  inView: boolean
}) {
  const motionValue = useMotionValue(0)
  const springValue = useSpring(motionValue, {
    stiffness: 50,
    damping: 30,
  })
  const display = useTransform(springValue, (v) =>
    Math.round(v).toLocaleString()
  )

  useEffect(() => {
    if (inView) {
      motionValue.set(value)
    }
  }, [inView, value, motionValue])

  return <motion.span>{display}</motion.span>
}

export default function StatsCounter() {
  const [ref, inView] = useInView({ threshold: 0.5, triggerOnce: true })

  return (
    <section className="relative py-24 px-4">
      {/* Background gradient mesh */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-900/10 via-purple-900/10 to-pink-900/10 animate-gradient" />

      <div className="max-w-6xl mx-auto" ref={ref}>
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-bold gradient-text mb-4">
            Trusted by Thousands
          </h2>
          <p className="text-white/40">
            Join the growing community of career-ready students.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              className="relative text-center p-6 rounded-2xl glass"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              whileHover={{
                boxShadow: `0 0 30px ${stat.color}20`,
                scale: 1.03,
              }}
            >
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4"
                style={{ background: `${stat.color}15` }}
              >
                <stat.icon size={28} style={{ color: stat.color }} />
              </div>
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                <AnimatedCounter value={stat.value} inView={inView} />
                <span className="text-xl">{stat.suffix}</span>
              </div>
              <div className="text-sm text-white/40">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
