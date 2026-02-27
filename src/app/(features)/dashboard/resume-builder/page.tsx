'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, Plus, FileText, Sparkles, Download, Palette, X } from 'lucide-react'
import toast from 'react-hot-toast'
import ResumeCard from '@/components/resume/ResumeCard'
import TemplateSelector from '@/components/resume/TemplateSelector'
import { playPop } from '@/lib/sounds'
import { fadeInUp, fadeInUpTransition, staggerContainer, staggerItem } from '@/lib/animations'

interface ResumeSession {
  id: string
  title: string
  started_at: string
  status: string
  message_count: number
}

export default function ResumeBuilderPage() {
  const router = useRouter()
  const [sessions, setSessions] = useState<ResumeSession[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [showTemplateModal, setShowTemplateModal] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState('professional')

  useEffect(() => {
    loadSessions()
  }, [])

  async function loadSessions() {
    try {
      const res = await fetch('/api/resume/sessions')
      if (res.ok) {
        const data = await res.json()
        setSessions(data.sessions || [])
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }

  function handleCreate() {
    playPop()
    setSelectedTemplate('professional')
    setShowTemplateModal(true)
  }

  async function handleConfirmTemplate() {
    setCreating(true)
    try {
      const res = await fetch('/api/resume/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'New Resume', template: selectedTemplate }),
      })
      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || 'Failed to create resume session')
        return
      }
      const data = await res.json()
      router.push(`/resume-session/${data.id}`)
    } catch {
      toast.error('Something went wrong')
    } finally {
      setCreating(false)
      setShowTemplateModal(false)
    }
  }

  return (
    <div className="p-6 sm:p-8 max-w-5xl">
      {/* Header Card */}
      <motion.div
        variants={fadeInUp}
        initial="initial"
        animate="animate"
        transition={fadeInUpTransition}
        className="mb-6"
      >
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-cyan-100 flex items-center justify-center text-cyan-800">
                <FileText size={22} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">AI Resume Builder</h1>
                <p className="text-sm text-gray-500 flex items-center gap-1">
                  <Sparkles size={12} /> ATS-verified resume creation &mdash; aligned with the right keywords, skills &amp; achievements per job
                </p>
              </div>
            </div>

            <button
              onClick={handleCreate}
              disabled={creating}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-green-800 text-white text-sm font-medium hover:bg-green-900 transition-colors shadow-sm disabled:opacity-50"
            >
              {creating ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
              Naya Resume Banao
            </button>
          </div>
        </div>
      </motion.div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={24} className="animate-spin text-gray-400" />
        </div>
      ) : sessions.length === 0 ? (
        <motion.div
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          transition={{ ...fadeInUpTransition, delay: 0.1 }}
        >
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-sm">
            <div className="flex items-center justify-center gap-2 mb-6">
              <div className="w-16 h-16 rounded-xl bg-cyan-50 flex items-center justify-center text-cyan-300">
                <FileText size={30} />
              </div>
              <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-green-300 -ml-4 mt-4">
                <Download size={22} />
              </div>
              <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center text-violet-300 -ml-3 mt-1">
                <Palette size={18} />
              </div>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">Build Your First Resume</h2>
            <p className="text-sm text-gray-500 mb-8 max-w-md mx-auto leading-relaxed">
              Chat with our AI to create a professional, ATS-friendly resume.
              Choose from multiple templates and download as PDF.
            </p>
            <button
              onClick={handleCreate}
              disabled={creating}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-green-800 text-white text-sm font-medium hover:bg-green-900 transition-colors shadow-sm disabled:opacity-50"
            >
              {creating ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
              Naya Resume Banao
            </button>
          </div>
        </motion.div>
      ) : (
        <motion.div
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          transition={{ ...fadeInUpTransition, delay: 0.1 }}
        >
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Your Resumes</h2>
            <motion.div
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              className="grid grid-cols-1 sm:grid-cols-2 gap-4"
            >
              {sessions.map((session) => (
                <motion.div key={session.id} variants={staggerItem}>
                  <ResumeCard session={session} />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.div>
      )}

      {/* Template Selection Modal */}
      <AnimatePresence>
        {showTemplateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
            onClick={() => setShowTemplateModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-6"
            >
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-lg font-bold text-gray-900">Choose a Template</h2>
                <button
                  onClick={() => setShowTemplateModal(false)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
              <p className="text-sm text-gray-500 mb-5">
                Select a resume design. You can change it later after generation.
              </p>

              <TemplateSelector
                currentTemplate={selectedTemplate}
                onTemplateChange={setSelectedTemplate}
                mode="select"
              />

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
                <button
                  onClick={() => setShowTemplateModal(false)}
                  className="px-4 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmTemplate}
                  disabled={creating}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-green-800 text-white text-sm font-medium hover:bg-green-900 transition-colors disabled:opacity-50"
                >
                  {creating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                  Start Building
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
