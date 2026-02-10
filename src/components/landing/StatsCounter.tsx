'use client'

import { motion, useSpring, useMotionValue, useTransform } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { useEffect } from 'react'
import { Users, BookOpen, Award, Mic } from 'lucide-react'

const stats = [
  { label: 'Active Students', value: 50000, icon: Users, suffix: '+' },
  { label: 'Courses Completed', value: 125000, icon: BookOpen, suffix: '+' },
  { label: 'Certifications Issued', value: 32000, icon: Award, suffix: '+' },
  { label: 'Interview Sessions', value: 89000, icon: Mic, suffix: '+' },
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
    <section className="relative py-20 md:py-24 px-4 sm:px-6 bg-white">
      <div className="max-w-6xl mx-auto" ref={ref}>
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-4">
            Trusted by Thousands
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
              <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                <AnimatedCounter value={stat.value} inView={inView} />
                <span className="text-xl text-gray-400">{stat.suffix}</span>
              </div>
              <div className="text-sm text-gray-500">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
