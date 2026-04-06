'use client'

import { useState, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  Mic, ArrowLeft, Upload, FileText, X, AlertTriangle,
  Info, Loader2, ChevronDown,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { fadeInUp, fadeInUpTransition } from '@/lib/animations'

const JOB_ROLES = [
  'Bank PO',
  'MFI Field Officer',
  'Fintech Associate',
  'Sales Executive',
  'Customer Support',
  'Software Developer',
  'Data Analyst',
  'Marketing Manager',
  'HR Manager',
  'Custom...',
]

interface SetupFormProps {
  onStart: (sessionId: string) => void
  onBack: () => void
}

export default function SetupForm({ onStart, onBack }: SetupFormProps) {
  const [selectedRole, setSelectedRole] = useState('')
  const [customRole, setCustomRole] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const effectiveRole = selectedRole === 'Custom...' ? customRole.trim() : selectedRole
  const hasResume = !!resumeFile
  const hasJD = jobDescription.trim().length > 0
  const showWarning = !hasResume && !hasJD
  const canStart = effectiveRole.length > 0

  const handleFileDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) validateAndSetFile(file)
  }, [])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) validateAndSetFile(file)
  }, [])

  function validateAndSetFile(file: File) {
    const allowed = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']
    if (!allowed.includes(file.type) && !file.name.match(/\.(pdf|docx|txt)$/i)) {
      toast.error('Please upload a PDF, DOCX, or TXT file')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File must be under 5MB')
      return
    }
    setResumeFile(file)
  }

  async function handleStart() {
    if (!canStart) return
    setLoading(true)

    try {
      // Step 1: Create session
      const createRes = await fetch('/api/interview/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          job_role: effectiveRole,
          job_description: hasJD ? jobDescription.trim() : undefined,
        }),
      })

      if (!createRes.ok) {
        const err = await createRes.json()
        toast.error(err.error || 'Failed to create session')
        return
      }

      const { id: sessionId } = await createRes.json()

      // Step 2: Upload resume if provided
      if (resumeFile) {
        const formData = new FormData()
        formData.append('file', resumeFile)

        const uploadRes = await fetch(`/api/interview/sessions/${sessionId}/upload-resume`, {
          method: 'POST',
          body: formData,
        })

        if (!uploadRes.ok) {
          toast.error('Resume upload failed, but interview can proceed')
        }
      }

      // Step 3: Transition to interview
      onStart(sessionId)
    } catch {
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 sm:p-8 max-w-2xl">
      {/* Back Link */}
      <motion.div
        variants={fadeInUp}
        initial="initial"
        animate="animate"
        transition={fadeInUpTransition}
      >
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-6"
        >
          <ArrowLeft size={16} />
          Back to sessions
        </button>
      </motion.div>

      {/* Form Card */}
      <motion.div
        variants={fadeInUp}
        initial="initial"
        animate="animate"
        transition={{ ...fadeInUpTransition, delay: 0.05 }}
      >
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">Interview Setup</h2>
            <p className="text-sm text-gray-500">
              Configure your mock interview before we begin
            </p>
          </div>

          {/* Job Role */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Job Role <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full appearance-none px-4 py-2.5 pr-10 rounded-lg border border-gray-300 bg-white text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
              >
                <option value="">Select a role...</option>
                {JOB_ROLES.map((role) => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
              <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>

            {selectedRole === 'Custom...' && (
              <input
                type="text"
                value={customRole}
                onChange={(e) => setCustomRole(e.target.value)}
                placeholder="Enter your target role..."
                className="mt-2 w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
              />
            )}
          </div>

          {/* Resume Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Resume
            </label>
            <div className="flex items-center gap-1.5 text-xs text-blue-600 mb-2">
              <Info size={12} />
              Upload your resume for a personalized experience
            </div>

            {resumeFile ? (
              <div className="flex items-center gap-3 px-4 py-3 rounded-lg border border-gray-200 bg-gray-50">
                <FileText size={18} className="text-gray-500 shrink-0" />
                <span className="text-sm text-gray-700 truncate flex-1">
                  {resumeFile.name}
                </span>
                <button
                  onClick={() => {
                    setResumeFile(null)
                    if (fileInputRef.current) fileInputRef.current.value = ''
                  }}
                  className="w-6 h-6 rounded flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleFileDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`flex flex-col items-center justify-center gap-2 px-4 py-8 rounded-lg border-2 border-dashed cursor-pointer transition-colors ${
                  dragOver
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-300 hover:border-gray-400 bg-gray-50'
                }`}
              >
                <Upload size={24} className="text-gray-400" />
                <p className="text-sm text-gray-500">
                  Drag and drop or <span className="text-green-700 font-medium">click to select</span>
                </p>
                <p className="text-xs text-gray-400">PDF, DOCX, or TXT (max 5MB)</p>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.txt"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* Job Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Job Description
            </label>
            <div className="flex items-center gap-1.5 text-xs text-blue-600 mb-2">
              <Info size={12} />
              Paste the JD for role-specific questions
            </div>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the job description here for role-specific questions..."
              rows={4}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900 resize-none focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
            />
          </div>

          {/* Warning */}
          {showWarning && selectedRole && (
            <div className="flex items-start gap-2.5 px-4 py-3 rounded-lg bg-amber-50 border border-amber-200">
              <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700 leading-relaxed">
                Adding your resume and job description will make the interview much more
                realistic and personalized. You can still proceed without them.
              </p>
            </div>
          )}

          {/* Start Button */}
          <button
            onClick={handleStart}
            disabled={!canStart || loading}
            className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg bg-green-800 text-white text-sm font-semibold hover:bg-green-900 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Setting up...
              </>
            ) : (
              <>
                <Mic size={18} />
                Start Interview
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  )
}
