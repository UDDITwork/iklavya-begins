'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Award, Loader2, ExternalLink, Calendar } from 'lucide-react'
import { fadeInUp, fadeInUpTransition, staggerContainer, staggerItem } from '@/lib/animations'

interface Certificate {
  id: string
  cert_number: string
  cert_slug: string
  module_title: string | null
  score: number | null
  issued_at: string
}

export default function CertificationsPage() {
  const router = useRouter()
  const [certs, setCerts] = useState<Certificate[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/certificates/my')
        if (res.status === 401) {
          router.push('/login')
          return
        }
        if (res.ok) {
          const data = await res.json()
          setCerts(data.certificates || [])
        }
      } catch {
        // silent
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [router])

  return (
    <div className="p-6 sm:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <motion.div
        variants={fadeInUp}
        initial="initial"
        animate="animate"
        transition={fadeInUpTransition}
        className="mb-6"
      >
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center text-amber-800">
              <Award size={22} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Certifications</h1>
              <p className="text-sm text-gray-500">
                Certificates earned from completed assessments
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={24} className="animate-spin text-gray-400" />
        </div>
      ) : certs.length === 0 ? (
        <motion.div
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          transition={{ ...fadeInUpTransition, delay: 0.1 }}
        >
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-sm">
            <Award size={48} className="mx-auto text-gray-300 mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              No Certificates Yet
            </h2>
            <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">
              Complete classroom modules and pass assessments to earn certificates.
            </p>
            <button
              onClick={() => router.push('/dashboard/assessments')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-green-800 text-white text-sm font-medium hover:bg-green-900 transition-colors"
            >
              Go to Assessments
            </button>
          </div>
        </motion.div>
      ) : (
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {certs.map((cert) => {
            const date = new Date(cert.issued_at).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })

            return (
              <motion.div key={cert.id} variants={staggerItem}>
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
                  {/* Green top accent */}
                  <div className="h-1.5 bg-gradient-to-r from-green-600 to-emerald-500" />

                  <div className="p-5">
                    {/* Award icon */}
                    <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 mb-3">
                      <Award size={20} />
                    </div>

                    {/* Module title */}
                    <h3 className="text-sm font-bold text-gray-900 mb-1 line-clamp-2">
                      {cert.module_title || 'Certificate'}
                    </h3>

                    {/* Cert number */}
                    <p className="text-[10px] text-gray-400 font-mono mb-3">
                      {cert.cert_number}
                    </p>

                    {/* Meta */}
                    <div className="flex items-center gap-3 text-xs text-gray-400 mb-4">
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        {date}
                      </span>
                      {cert.score !== null && (
                        <span className="font-semibold text-green-700">
                          Score: {cert.score}
                        </span>
                      )}
                    </div>

                    {/* View button — opens in new tab */}
                    <a
                      href={`/cert/${cert.cert_slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl bg-green-600 text-white text-xs font-semibold hover:bg-green-700 transition-colors"
                    >
                      <Award size={14} />
                      View Certificate
                      <ExternalLink size={12} />
                    </a>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      )}
    </div>
  )
}
