'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Loader2, Plus, FileText, Sparkles, Download, Palette, X,
  Upload, PenLine, MessageSquare, ArrowRight, Mic,
} from 'lucide-react'
import toast from 'react-hot-toast'
import ResumeCard from '@/components/resume/ResumeCard'
import TemplateSelector from '@/components/resume/TemplateSelector'
import { playPop } from '@/lib/sounds'
import { fadeInUp, fadeInUpTransition, staggerContainer, staggerItem } from '@/lib/animations'
import ResumePreview from '@/components/resume-editor/ResumePreview'

interface ResumeSession {
  id: string
  title: string
  started_at: string
  status: string
  message_count: number
}

interface ResumeDraft {
  id: string
  title: string
  template: string
  source: string
  status: string
  updated_at: string
  ats_score: number | null
  resume_json: string
}

type ModalStep = 'template' | 'mode'
type BuildMode = 'upload' | 'scratch' | 'chat' | 'voice'

export default function ResumeBuilderPage() {
  const router = useRouter()
  const [sessions, setSessions] = useState<ResumeSession[]>([])
  const [drafts, setDrafts] = useState<ResumeDraft[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [modalStep, setModalStep] = useState<ModalStep>('template')
  const [selectedTemplate, setSelectedTemplate] = useState('professional')
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    loadAll()
  }, [])

  async function loadAll() {
    try {
      const [sessRes, draftRes] = await Promise.all([
        fetch('/api/resume/sessions'),
        fetch('/api/resume-drafts'),
      ])
      if (sessRes.ok) {
        const data = await sessRes.json()
        setSessions(data.sessions || [])
      }
      if (draftRes.ok) {
        const data = await draftRes.json()
        setDrafts(data.drafts || [])
      }
    } catch { /* silent */ }
    finally { setLoading(false) }
  }

  function handleCreate() {
    playPop()
    setSelectedTemplate('professional')
    setModalStep('template')
    setShowModal(true)
  }

  function handleNextToMode() {
    setModalStep('mode')
  }

  async function handleModeSelect(mode: BuildMode) {
    if (mode === 'chat') {
      // Existing chat flow
      setCreating(true)
      try {
        const res = await fetch('/api/resume/sessions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: 'New Resume', template: selectedTemplate }),
        })
        if (!res.ok) {
          const data = await res.json()
          toast.error(data.error || 'Failed to create')
          return
        }
        const data = await res.json()
        router.push(`/resume-session/${data.id}`)
      } catch {
        toast.error('Something went wrong')
      } finally {
        setCreating(false)
        setShowModal(false)
      }
    } else if (mode === 'scratch') {
      // Create draft and go to editor
      setCreating(true)
      try {
        const res = await fetch('/api/resume-drafts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: 'New Resume', template: selectedTemplate, source: 'scratch' }),
        })
        if (!res.ok) {
          const data = await res.json()
          toast.error(data.error || 'Failed to create')
          return
        }
        const data = await res.json()
        router.push(`/resume-editor/${data.id}`)
      } catch {
        toast.error('Something went wrong')
      } finally {
        setCreating(false)
        setShowModal(false)
      }
    } else if (mode === 'voice') {
      // Voice interview → same backend as chat, different frontend
      setCreating(true)
      try {
        const res = await fetch('/api/resume/sessions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: 'New Resume', template: selectedTemplate }),
        })
        if (!res.ok) {
          const data = await res.json()
          toast.error(data.error || 'Failed to create')
          return
        }
        const data = await res.json()
        router.push(`/resume-voice/${data.id}`)
      } catch {
        toast.error('Something went wrong')
      } finally {
        setCreating(false)
        setShowModal(false)
      }
    } else if (mode === 'upload') {
      // Trigger file input
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = '.pdf,.docx,.doc'
      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0]
        if (!file) return
        setUploading(true)
        try {
          const formData = new FormData()
          formData.append('file', file)
          formData.append('template', selectedTemplate)

          const res = await fetch('/api/resume-drafts/upload', {
            method: 'POST',
            body: formData,
          })
          const data = await res.json()
          if (!res.ok) {
            toast.error(data.error || 'Upload failed')
            return
          }
          toast.success('Resume parsed! Review your details.')
          router.push(`/resume-editor/${data.id}`)
        } catch {
          toast.error('Upload failed')
        } finally {
          setUploading(false)
          setShowModal(false)
        }
      }
      input.click()
    }
  }

  const hasContent = sessions.length > 0 || drafts.length > 0

  return (
    <div className="p-6 sm:p-8 max-w-5xl">
      {/* Header Card */}
      <motion.div variants={fadeInUp} initial="initial" animate="animate" transition={fadeInUpTransition} className="mb-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-cyan-100 flex items-center justify-center text-cyan-800">
                <FileText size={22} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Resume Builder</h1>
                <p className="text-sm text-gray-500">
                  Build ATS-ready resumes — upload existing, fill a form, or chat with AI
                </p>
              </div>
            </div>
            <button
              onClick={handleCreate}
              disabled={creating || uploading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-green-800 text-white text-sm font-medium hover:bg-green-900 transition-colors shadow-sm disabled:opacity-50"
            >
              {(creating || uploading) ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
              Create New Resume
            </button>
          </div>
        </div>
      </motion.div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={24} className="animate-spin text-gray-400" />
        </div>
      ) : !hasContent ? (
        <motion.div variants={fadeInUp} initial="initial" animate="animate" transition={{ ...fadeInUpTransition, delay: 0.1 }}>
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-sm">
            <div className="flex items-center justify-center gap-2 mb-6">
              <div className="w-16 h-16 rounded-xl bg-cyan-50 flex items-center justify-center text-cyan-300"><FileText size={30} /></div>
              <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-green-300 -ml-4 mt-4"><Download size={22} /></div>
              <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center text-violet-300 -ml-3 mt-1"><Palette size={18} /></div>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">Build Your First Resume</h2>
            <p className="text-sm text-gray-500 mb-8 max-w-md mx-auto leading-relaxed">
              Upload an existing resume, fill in a form with live preview, or chat with AI — all produce ATS-optimized, downloadable PDFs.
            </p>
            <button
              onClick={handleCreate}
              disabled={creating}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-green-800 text-white text-sm font-medium hover:bg-green-900 transition-colors shadow-sm disabled:opacity-50"
            >
              <Plus size={16} /> Create New Resume
            </button>
          </div>
        </motion.div>
      ) : (
        <div className="space-y-6">
          {/* Draft resumes (form editor) */}
          {drafts.length > 0 && (
            <motion.div variants={fadeInUp} initial="initial" animate="animate" transition={{ ...fadeInUpTransition, delay: 0.1 }}>
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <h2 className="text-base font-semibold text-gray-900 mb-4">Form Editor Resumes</h2>
                <motion.div variants={staggerContainer} initial="initial" animate="animate" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {drafts.map((draft) => {
                    let previewData = null
                    try {
                      const parsed = typeof draft.resume_json === 'string' ? JSON.parse(draft.resume_json) : draft.resume_json
                      if (parsed && parsed.personal_info) previewData = parsed
                    } catch { /* ignore */ }

                    return (
                      <motion.div key={draft.id} variants={staggerItem}>
                        <button
                          onClick={() => router.push(`/resume-editor/${draft.id}`)}
                          className="w-full text-left rounded-xl border border-gray-200 hover:border-green-400 hover:shadow-md transition-all bg-white overflow-hidden group"
                        >
                          {/* Mini Resume Preview — clipped to card width */}
                          <div className="relative h-56 overflow-hidden bg-white border-b border-gray-100">
                            {previewData ? (
                              <div className="absolute inset-0 overflow-hidden">
                                <div
                                  className="origin-top-left pointer-events-none"
                                  style={{
                                    transform: 'scale(0.35)',
                                    transformOrigin: 'top center',
                                    width: '794px',
                                    position: 'relative',
                                    left: '50%',
                                    marginLeft: '-397px',
                                  }}
                                >
                                  <ResumePreview data={previewData} template={draft.template} />
                                </div>
                              </div>
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
                                <div className="text-center">
                                  <FileText size={32} className="text-gray-200 mx-auto mb-2" />
                                  <p className="text-xs text-gray-300">No preview yet</p>
                                </div>
                              </div>
                            )}
                            {/* Subtle shadow at bottom to indicate more content */}
                            <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white to-transparent" />
                          </div>

                          {/* Card Footer */}
                          <div className="p-3.5">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-semibold text-gray-900 truncate">{draft.title}</span>
                              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0 ml-2 ${
                                draft.status === 'draft' ? 'bg-amber-50 text-amber-600' : 'bg-green-50 text-green-600'
                              }`}>
                                {draft.status === 'draft' ? 'Draft' : 'Complete'}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-[11px] text-gray-400">
                              <span className="capitalize">{draft.template}</span>
                              <span>·</span>
                              <span className="capitalize">{draft.source}</span>
                              {draft.ats_score && (
                                <>
                                  <span>·</span>
                                  <span className="text-green-600 font-medium">ATS {draft.ats_score}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </button>
                      </motion.div>
                    )
                  })}
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* Chat-based resumes */}
          {sessions.length > 0 && (
            <motion.div variants={fadeInUp} initial="initial" animate="animate" transition={{ ...fadeInUpTransition, delay: 0.15 }}>
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <h2 className="text-base font-semibold text-gray-900 mb-4">AI Chat Resumes</h2>
                <motion.div variants={staggerContainer} initial="initial" animate="animate" className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {sessions.map((session) => (
                    <motion.div key={session.id} variants={staggerItem}>
                      <ResumeCard session={session} />
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* ── Create Modal ── */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-6"
            >
              {/* Step 1: Template */}
              {modalStep === 'template' && (
                <>
                  <div className="flex items-center justify-between mb-1">
                    <h2 className="text-lg font-bold text-gray-900">Step 1: Choose a Template</h2>
                    <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100">
                      <X size={18} />
                    </button>
                  </div>
                  <p className="text-sm text-gray-500 mb-5">Select a resume design. You can change it later anytime.</p>

                  <TemplateSelector currentTemplate={selectedTemplate} onTemplateChange={setSelectedTemplate} mode="select" />

                  <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
                    <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100">Cancel</button>
                    <button
                      onClick={handleNextToMode}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-green-800 text-white text-sm font-medium hover:bg-green-900"
                    >
                      Next <ArrowRight size={14} />
                    </button>
                  </div>
                </>
              )}

              {/* Step 2: Mode */}
              {modalStep === 'mode' && (
                <>
                  <div className="flex items-center justify-between mb-1">
                    <h2 className="text-lg font-bold text-gray-900">Step 2: How do you want to build?</h2>
                    <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100">
                      <X size={18} />
                    </button>
                  </div>
                  <p className="text-sm text-gray-500 mb-5">Pick the approach that works best for you.</p>

                  <div className="space-y-3">
                    {/* Upload */}
                    <button
                      onClick={() => handleModeSelect('upload')}
                      disabled={uploading || creating}
                      className="w-full text-left p-4 rounded-xl border-2 border-gray-200 hover:border-green-600 hover:bg-green-50/30 transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-100">
                          {uploading ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">Upload Existing Resume</p>
                          <p className="text-xs text-gray-400">Upload a PDF or DOCX — we&apos;ll extract details and let you improve them</p>
                        </div>
                      </div>
                    </button>

                    {/* Scratch */}
                    <button
                      onClick={() => handleModeSelect('scratch')}
                      disabled={uploading || creating}
                      className="w-full text-left p-4 rounded-xl border-2 border-gray-200 hover:border-green-600 hover:bg-green-50/30 transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center text-green-700 group-hover:bg-green-100">
                          {creating ? <Loader2 size={18} className="animate-spin" /> : <PenLine size={18} />}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">Start from Scratch</p>
                          <p className="text-xs text-gray-400">Fill in your details with a form editor and see a live preview</p>
                        </div>
                      </div>
                    </button>

                    {/* Chat */}
                    <button
                      onClick={() => handleModeSelect('chat')}
                      disabled={uploading || creating}
                      className="w-full text-left p-4 rounded-xl border-2 border-gray-200 hover:border-green-600 hover:bg-green-50/30 transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-violet-50 flex items-center justify-center text-violet-600 group-hover:bg-violet-100">
                          <MessageSquare size={18} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">Build with AI Chat</p>
                          <p className="text-xs text-gray-400">Answer questions by typing and let the AI build your resume</p>
                        </div>
                      </div>
                    </button>

                    {/* Voice Interview */}
                    <button
                      onClick={() => handleModeSelect('voice')}
                      disabled={uploading || creating}
                      className="w-full text-left p-4 rounded-xl border-2 border-gray-200 hover:border-green-600 hover:bg-green-50/30 transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center text-orange-600 group-hover:bg-orange-100">
                          {creating ? <Loader2 size={18} className="animate-spin" /> : <Mic size={18} />}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">Voice Interview</p>
                          <p className="text-xs text-gray-400">Talk to AI — build your resume by speaking your answers</p>
                        </div>
                      </div>
                    </button>
                  </div>

                  <div className="flex justify-start gap-3 mt-6 pt-4 border-t border-gray-100">
                    <button onClick={() => setModalStep('template')} className="px-4 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100">
                      Back
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
