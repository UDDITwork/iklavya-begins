'use client'

import { useEffect, useState, useMemo, useRef } from 'react'
import { motion } from 'framer-motion'
import {
  Loader2, Save, User, GraduationCap, Heart, Phone, School, Camera,
  Briefcase, MapPin, Upload, FileText, Globe, Code,
} from 'lucide-react'

function LinkedInIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  )
}

function GitHubIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
    </svg>
  )
}
import Image from 'next/image'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/store/auth-store'
import TagInput from '@/components/ui/TagInput'
import ArrayFieldEditor, { type FieldSchema } from '@/components/ui/ArrayFieldEditor'
import { playPop, playSuccess } from '@/lib/sounds'
import { fadeInUp, fadeInUpTransition } from '@/lib/animations'

interface Profile {
  education_level?: string
  class_or_year?: string
  institution?: string
  board?: string
  stream?: string
  cgpa?: string
  date_of_birth?: string
  gender?: string
  city?: string
  state?: string
  pin_code?: string
  parent_occupation?: string
  siblings?: string
  income_range?: string
  hobbies?: string[]
  interests?: string[]
  strengths?: string[]
  weaknesses?: string[]
  languages?: string[]
  career_aspiration_raw?: string
  linkedin_url?: string
  portfolio_url?: string
  github_url?: string
  summary?: string
  skills?: string[]
  achievements?: string[]
  extracurriculars?: string[]
  work_experience?: Record<string, string>[]
  projects?: Record<string, string>[]
  certifications?: Record<string, string>[]
}

const WORK_EXPERIENCE_FIELDS: FieldSchema[] = [
  { key: 'role', label: 'Role / Title', placeholder: 'e.g. Software Intern' },
  { key: 'company', label: 'Company / Organisation', placeholder: 'e.g. Google' },
  { key: 'duration', label: 'Duration', placeholder: 'e.g. Jun 2025 - Aug 2025' },
  { key: 'description', label: 'Description', type: 'textarea', placeholder: 'Key responsibilities and achievements' },
]

const PROJECT_FIELDS: FieldSchema[] = [
  { key: 'name', label: 'Project Name', placeholder: 'e.g. E-commerce Platform' },
  { key: 'description', label: 'Description', type: 'textarea', placeholder: 'What does the project do?' },
  { key: 'tech_stack', label: 'Tech Stack', placeholder: 'e.g. React, Node.js, PostgreSQL' },
  { key: 'url', label: 'URL', placeholder: 'e.g. https://github.com/...' },
]

const CERTIFICATION_FIELDS: FieldSchema[] = [
  { key: 'name', label: 'Certification Name', placeholder: 'e.g. AWS Cloud Practitioner' },
  { key: 'issuer', label: 'Issuer', placeholder: 'e.g. Amazon Web Services' },
  { key: 'year', label: 'Year', placeholder: 'e.g. 2025' },
]

const MAX_IMAGE_SIZE = 2 * 1024 * 1024
const MAX_DOC_SIZE = 5 * 1024 * 1024

export default function ProfilePage() {
  const { user, setUser } = useAuthStore()
  const [profile, setProfile] = useState<Profile>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [parsingDoc, setParsingDoc] = useState(false)
  const [parsedFields, setParsedFields] = useState<Set<string> | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const docInputRef = useRef<HTMLInputElement>(null)

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > MAX_IMAGE_SIZE) {
      toast.error('Image must be less than 2MB')
      return
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      toast.error('Only JPEG, PNG, and WebP images are allowed')
      return
    }

    playPop()
    setUploadingImage(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/profile/image', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Failed to upload image')
        return
      }

      if (user) {
        setUser({ ...user, profile_image: data.profile_image })
      }
      playSuccess()
      toast.success('Profile photo updated!')
    } catch {
      toast.error('Something went wrong uploading image')
    } finally {
      setUploadingImage(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  async function handleDocumentUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.type !== 'application/pdf') {
      toast.error('Only PDF files are accepted')
      return
    }

    if (file.size > MAX_DOC_SIZE) {
      toast.error('File must be less than 5MB')
      return
    }

    setParsingDoc(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/profile/parse-document', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Failed to parse document')
        return
      }

      // Track which fields were returned by parsing
      const filled = new Set<string>()
      for (const [k, v] of Object.entries(data)) {
        if (k === 'id' || k === 'user_id') continue
        if (v !== null && v !== undefined && v !== '' && !(Array.isArray(v) && v.length === 0)) {
          filled.add(k)
        }
      }
      setParsedFields(filled)
      setProfile(data)
      playSuccess()
      toast.success('Profile auto-filled from your document. Review and save.')
    } catch {
      toast.error('Failed to parse document. Please try again.')
    } finally {
      setParsingDoc(false)
      if (docInputRef.current) docInputRef.current.value = ''
    }
  }

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/profile')
        if (res.ok) {
          const data = await res.json()
          setProfile(data)
        }
      } catch {
        // Profile may not exist yet
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const completionPercent = useMemo(() => {
    const fields = [
      profile.education_level,
      profile.class_or_year,
      profile.stream,
      profile.cgpa,
      profile.gender,
      profile.city,
      profile.summary,
      profile.hobbies?.length,
      profile.interests?.length,
      profile.skills?.length,
      profile.strengths?.length,
      profile.languages?.length,
      profile.career_aspiration_raw,
      profile.work_experience?.length,
    ]
    const filled = fields.filter(Boolean).length
    return Math.round((filled / fields.length) * 100)
  }, [profile])

  async function handleSave() {
    playPop()
    setSaving(true)
    try {
      // Try PUT first; if profile doesn't exist yet, POST to create it
      let res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      })

      if (res.status === 404) {
        res = await fetch('/api/profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(profile),
        })
      }

      if (res.ok) {
        setParsedFields(null)
        playSuccess()
        toast.success('Profile updated successfully')
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to update profile')
      }
    } catch {
      toast.error('Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  if (!user) return null

  const inputClass =
    'w-full px-4 py-3 min-h-[44px] rounded-lg border border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all duration-200 text-sm'

  // Show hint after PDF parsing: green for filled, amber for missing
  function parseHint(fieldName: string) {
    if (!parsedFields) return null
    if (parsedFields.has(fieldName)) {
      return <span className="text-[10px] text-green-600 mt-0.5 block">&#10003; Auto-filled from document</span>
    }
    return <span className="text-[10px] text-amber-500 mt-0.5 block">Not found in document — fill manually if needed</span>
  }

  const avatarGradient =
    profile.gender?.toLowerCase() === 'female'
      ? 'bg-gradient-to-br from-rose-400 to-rose-600'
      : 'bg-gradient-to-br from-slate-500 to-slate-700'

  return (
    <div className="p-6 sm:p-8 max-w-3xl">
      {/* Profile Card — Employer Preview */}
      <motion.div
        variants={fadeInUp}
        initial="initial"
        animate="animate"
        transition={fadeInUpTransition}
        className="mb-6"
      >
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="h-16 bg-gradient-to-r from-green-800 to-emerald-700" />
          <div className="px-6 pb-6">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-8">
              {/* Avatar */}
              <div className="relative group shrink-0">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                {user.profile_image ? (
                  <Image
                    src={user.profile_image}
                    alt={user.name}
                    width={80}
                    height={80}
                    className="w-20 h-20 rounded-full object-cover shadow-md border-4 border-white"
                  />
                ) : (
                  <div className={`w-20 h-20 rounded-full ${avatarGradient} flex items-center justify-center text-white text-3xl font-bold shadow-md border-4 border-white`}>
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingImage}
                  className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/40 flex items-center justify-center transition-all duration-200 cursor-pointer"
                >
                  {uploadingImage ? (
                    <Loader2 size={20} className="text-white animate-spin" />
                  ) : (
                    <Camera size={20} className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  )}
                </button>
              </div>

              <div className="flex-1 min-w-0 sm:pb-1">
                <h1 className="text-xl font-bold text-gray-900">{user.name}</h1>
                <p className="text-sm text-gray-500">
                  {profile.stream || profile.education_level || user.college}
                  {profile.stream && profile.institution ? ` at ${profile.institution}` : ''}
                  {!profile.stream && !profile.education_level ? '' : ` -- ${user.college}`}
                </p>
              </div>
            </div>

            {/* Contact row */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-4 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                {user.email}
              </span>
              {user.phone && <span className="flex items-center gap-1"><Phone size={11} />{user.phone}</span>}
              <span className="flex items-center gap-1"><School size={11} />{user.college}</span>
              {profile.city && <span className="flex items-center gap-1"><MapPin size={11} />{profile.city}{profile.state ? `, ${profile.state}` : ''}</span>}
              {profile.linkedin_url && (
                <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[#0A66C2] hover:text-[#004182] transition-colors">
                  <LinkedInIcon size={11} />
                  LinkedIn
                </a>
              )}
              {profile.github_url && (
                <a href={profile.github_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-gray-700 hover:text-gray-900 transition-colors">
                  <GitHubIcon size={11} />
                  GitHub
                </a>
              )}
              {profile.portfolio_url && (
                <a href={profile.portfolio_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-green-700 transition-colors">
                  <Globe size={11} />
                  Portfolio
                </a>
              )}
            </div>

            {/* Summary */}
            {profile.summary && (
              <p className="text-sm text-gray-600 mt-3 leading-relaxed">{profile.summary}</p>
            )}

            {/* Skills pills */}
            {(profile.skills?.length || profile.interests?.length) ? (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {(profile.skills || []).map((s) => (
                  <span key={s} className="px-2 py-0.5 bg-green-50 text-green-800 text-[11px] font-medium rounded">{s}</span>
                ))}
                {(profile.interests || []).map((s) => (
                  <span key={s} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[11px] font-medium rounded">{s}</span>
                ))}
              </div>
            ) : null}

            {/* Career aspiration */}
            {profile.career_aspiration_raw && (
              <p className="text-xs text-gray-400 mt-3 italic">{profile.career_aspiration_raw}</p>
            )}

            {/* Completion bar */}
            <div className="mt-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">
                  Profile Completion
                </span>
                <span className="text-xs font-semibold text-green-700">{completionPercent}%</span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-green-600 to-emerald-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${completionPercent}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
                />
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Upload Document or Resume */}
      <motion.div
        variants={fadeInUp}
        initial="initial"
        animate="animate"
        transition={{ ...fadeInUpTransition, delay: 0.05 }}
        className="mb-6"
      >
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600">
              <Upload size={16} />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-gray-900">Upload Document or Resume</h2>
              <p className="text-xs text-gray-400 mt-0.5">Upload a PDF to auto-fill your profile fields</p>
            </div>
          </div>
          <input
            ref={docInputRef}
            type="file"
            accept="application/pdf"
            onChange={handleDocumentUpload}
            className="hidden"
          />
          <button
            onClick={() => docInputRef.current?.click()}
            disabled={parsingDoc}
            className="w-full border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center gap-2 hover:border-green-300 hover:bg-green-50/30 transition-all duration-200 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
          >
            {parsingDoc ? (
              <>
                <Loader2 size={24} className="text-green-700 animate-spin" />
                <span className="text-sm text-green-700 font-medium">Analyzing your document...</span>
                <span className="text-xs text-gray-400">This may take a few seconds</span>
              </>
            ) : (
              <>
                <FileText size={24} className="text-gray-400" />
                <span className="text-sm text-gray-600 font-medium">Click to upload PDF</span>
                <span className="text-xs text-gray-400">Max 5MB. Your profile fields will be auto-filled.</span>
              </>
            )}
          </button>
        </div>
      </motion.div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={24} className="animate-spin text-gray-400" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Personal Info Section */}
          <motion.div
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            transition={{ ...fadeInUpTransition, delay: 0.1 }}
          >
            <div className="bg-white rounded-2xl border border-gray-200 border-l-4 border-l-blue-500 p-6 shadow-sm">
              <div className="flex items-center gap-2.5 mb-5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-700">
                  <User size={16} />
                </div>
                <h2 className="text-sm font-semibold text-gray-900">Personal Information</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Date of Birth</label>
                  <input
                    type="date"
                    value={profile.date_of_birth || ''}
                    onChange={(e) => { setProfile({ ...profile, date_of_birth: e.target.value }); setParsedFields(null) }}
                    className={inputClass}
                  />
                  {parseHint('date_of_birth')}
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Gender</label>
                  <select
                    value={profile.gender || ''}
                    onChange={(e) => { setProfile({ ...profile, gender: e.target.value }); setParsedFields(null) }}
                    className={inputClass}
                  >
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                  {parseHint('gender')}
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">City</label>
                  <input
                    type="text"
                    value={profile.city || ''}
                    onChange={(e) => { setProfile({ ...profile, city: e.target.value }); setParsedFields(null) }}
                    placeholder="e.g. Mumbai"
                    className={inputClass}
                  />
                  {parseHint('city')}
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">State</label>
                  <input
                    type="text"
                    value={profile.state || ''}
                    onChange={(e) => { setProfile({ ...profile, state: e.target.value }); setParsedFields(null) }}
                    placeholder="e.g. Maharashtra"
                    className={inputClass}
                  />
                  {parseHint('state')}
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Pin Code</label>
                  <input
                    type="text"
                    value={profile.pin_code || ''}
                    onChange={(e) => { setProfile({ ...profile, pin_code: e.target.value }); setParsedFields(null) }}
                    placeholder="e.g. 400001"
                    className={inputClass}
                  />
                  {parseHint('pin_code')}
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Phone</label>
                  <input
                    type="text"
                    value={user.phone || ''}
                    readOnly
                    className={`${inputClass} bg-gray-50 text-gray-500 cursor-not-allowed`}
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Education Section */}
          <motion.div
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            transition={{ ...fadeInUpTransition, delay: 0.15 }}
          >
            <div className="bg-white rounded-2xl border border-gray-200 border-l-4 border-l-green-600 p-6 shadow-sm">
              <div className="flex items-center gap-2.5 mb-5">
                <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center text-green-700">
                  <GraduationCap size={16} />
                </div>
                <h2 className="text-sm font-semibold text-gray-900">Education</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Education Level</label>
                  <input
                    type="text"
                    value={profile.education_level || ''}
                    onChange={(e) => { setProfile({ ...profile, education_level: e.target.value }); setParsedFields(null) }}
                    placeholder="e.g. Undergraduate"
                    className={inputClass}
                  />
                  {parseHint('education_level')}
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Class / Year</label>
                  <input
                    type="text"
                    value={profile.class_or_year || ''}
                    onChange={(e) => { setProfile({ ...profile, class_or_year: e.target.value }); setParsedFields(null) }}
                    placeholder="e.g. 2nd Year"
                    className={inputClass}
                  />
                  {parseHint('class_or_year')}
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Institution</label>
                  <input
                    type="text"
                    value={profile.institution || ''}
                    onChange={(e) => { setProfile({ ...profile, institution: e.target.value }); setParsedFields(null) }}
                    placeholder="e.g. IIT Delhi"
                    className={inputClass}
                  />
                  {parseHint('institution')}
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Board / University</label>
                  <input
                    type="text"
                    value={profile.board || ''}
                    onChange={(e) => { setProfile({ ...profile, board: e.target.value }); setParsedFields(null) }}
                    placeholder="e.g. CBSE, Delhi University"
                    className={inputClass}
                  />
                  {parseHint('board')}
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Stream</label>
                  <input
                    type="text"
                    value={profile.stream || ''}
                    onChange={(e) => { setProfile({ ...profile, stream: e.target.value }); setParsedFields(null) }}
                    placeholder="e.g. Computer Science"
                    className={inputClass}
                  />
                  {parseHint('stream')}
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">CGPA</label>
                  <input
                    type="text"
                    value={profile.cgpa || ''}
                    onChange={(e) => { setProfile({ ...profile, cgpa: e.target.value }); setParsedFields(null) }}
                    placeholder="e.g. 8.5"
                    className={inputClass}
                  />
                  {parseHint('cgpa')}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Professional Summary & Links */}
          <motion.div
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            transition={{ ...fadeInUpTransition, delay: 0.2 }}
          >
            <div className="bg-white rounded-2xl border border-gray-200 border-l-4 border-l-indigo-500 p-6 shadow-sm">
              <div className="flex items-center gap-2.5 mb-5">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-700">
                  <Briefcase size={16} />
                </div>
                <h2 className="text-sm font-semibold text-gray-900">Professional</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Professional Summary</label>
                  <textarea
                    value={profile.summary || ''}
                    onChange={(e) => { setProfile({ ...profile, summary: e.target.value }); setParsedFields(null) }}
                    rows={3}
                    placeholder="A brief professional summary or objective"
                    className={`${inputClass} resize-none`}
                  />
                  {parseHint('summary')}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">LinkedIn URL</label>
                    <input
                      type="url"
                      value={profile.linkedin_url || ''}
                      onChange={(e) => { setProfile({ ...profile, linkedin_url: e.target.value }); setParsedFields(null) }}
                      placeholder="https://linkedin.com/in/..."
                      className={inputClass}
                    />
                    {parseHint('linkedin_url')}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">GitHub URL</label>
                    <input
                      type="url"
                      value={profile.github_url || ''}
                      onChange={(e) => { setProfile({ ...profile, github_url: e.target.value }); setParsedFields(null) }}
                      placeholder="https://github.com/..."
                      className={inputClass}
                    />
                    {parseHint('github_url')}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">Portfolio URL</label>
                    <input
                      type="url"
                      value={profile.portfolio_url || ''}
                      onChange={(e) => { setProfile({ ...profile, portfolio_url: e.target.value }); setParsedFields(null) }}
                      placeholder="https://..."
                      className={inputClass}
                    />
                    {parseHint('portfolio_url')}
                  </div>
                </div>
                <div>
                  <TagInput
                    label="Skills"
                    tags={profile.skills || []}
                    onChange={(skills) => { setProfile({ ...profile, skills }); setParsedFields(null) }}
                  />
                  {parseHint('skills')}
                </div>
                <div>
                  <TagInput
                    label="Achievements"
                    tags={profile.achievements || []}
                    onChange={(achievements) => { setProfile({ ...profile, achievements }); setParsedFields(null) }}
                  />
                  {parseHint('achievements')}
                </div>
                <div>
                  <TagInput
                    label="Extracurriculars"
                    tags={profile.extracurriculars || []}
                    onChange={(extracurriculars) => { setProfile({ ...profile, extracurriculars }); setParsedFields(null) }}
                  />
                  {parseHint('extracurriculars')}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Work Experience */}
          <motion.div
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            transition={{ ...fadeInUpTransition, delay: 0.25 }}
          >
            <div className="bg-white rounded-2xl border border-gray-200 border-l-4 border-l-amber-500 p-6 shadow-sm">
              <div className="flex items-center gap-2.5 mb-5">
                <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-700">
                  <Briefcase size={16} />
                </div>
                <h2 className="text-sm font-semibold text-gray-900">Work Experience</h2>
              </div>
              <ArrayFieldEditor
                label="Experience"
                items={profile.work_experience || []}
                onChange={(work_experience) => setProfile({ ...profile, work_experience })}
                fields={WORK_EXPERIENCE_FIELDS}
              />
            </div>
          </motion.div>

          {/* Projects */}
          <motion.div
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            transition={{ ...fadeInUpTransition, delay: 0.3 }}
          >
            <div className="bg-white rounded-2xl border border-gray-200 border-l-4 border-l-cyan-500 p-6 shadow-sm">
              <div className="flex items-center gap-2.5 mb-5">
                <div className="w-8 h-8 rounded-lg bg-cyan-50 flex items-center justify-center text-cyan-700">
                  <Code size={16} />
                </div>
                <h2 className="text-sm font-semibold text-gray-900">Projects</h2>
              </div>
              <ArrayFieldEditor
                label="Projects"
                items={profile.projects || []}
                onChange={(projects) => setProfile({ ...profile, projects })}
                fields={PROJECT_FIELDS}
              />
            </div>
          </motion.div>

          {/* Certifications */}
          <motion.div
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            transition={{ ...fadeInUpTransition, delay: 0.35 }}
          >
            <div className="bg-white rounded-2xl border border-gray-200 border-l-4 border-l-violet-500 p-6 shadow-sm">
              <div className="flex items-center gap-2.5 mb-5">
                <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center text-violet-700">
                  <FileText size={16} />
                </div>
                <h2 className="text-sm font-semibold text-gray-900">Certifications</h2>
              </div>
              <ArrayFieldEditor
                label="Certifications"
                items={profile.certifications || []}
                onChange={(certifications) => setProfile({ ...profile, certifications })}
                fields={CERTIFICATION_FIELDS}
              />
            </div>
          </motion.div>

          {/* About You Section */}
          <motion.div
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            transition={{ ...fadeInUpTransition, delay: 0.4 }}
          >
            <div className="bg-white rounded-2xl border border-gray-200 border-l-4 border-l-emerald-500 p-6 shadow-sm">
              <div className="flex items-center gap-2.5 mb-5">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-700">
                  <Heart size={16} />
                </div>
                <h2 className="text-sm font-semibold text-gray-900">About You</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <TagInput
                    label="Hobbies"
                    tags={profile.hobbies || []}
                    onChange={(hobbies) => { setProfile({ ...profile, hobbies }); setParsedFields(null) }}
                  />
                  {parseHint('hobbies')}
                </div>
                <div>
                  <TagInput
                    label="Interests"
                    tags={profile.interests || []}
                    onChange={(interests) => { setProfile({ ...profile, interests }); setParsedFields(null) }}
                  />
                  {parseHint('interests')}
                </div>
                <div>
                  <TagInput
                    label="Strengths"
                    tags={profile.strengths || []}
                    onChange={(strengths) => { setProfile({ ...profile, strengths }); setParsedFields(null) }}
                    maxTags={5}
                  />
                  {parseHint('strengths')}
                </div>
                <div>
                  <TagInput
                    label="Weaknesses"
                    tags={profile.weaknesses || []}
                    onChange={(weaknesses) => { setProfile({ ...profile, weaknesses }); setParsedFields(null) }}
                    maxTags={5}
                  />
                  {parseHint('weaknesses')}
                </div>
                <div>
                  <TagInput
                    label="Languages"
                    tags={profile.languages || []}
                    onChange={(languages) => { setProfile({ ...profile, languages }); setParsedFields(null) }}
                  />
                  {parseHint('languages')}
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Career Aspiration</label>
                  <textarea
                    value={profile.career_aspiration_raw || ''}
                    onChange={(e) => { setProfile({ ...profile, career_aspiration_raw: e.target.value }); setParsedFields(null) }}
                    rows={3}
                    placeholder="What career path excites you the most?"
                    className={`${inputClass} resize-none`}
                  />
                  {parseHint('career_aspiration_raw')}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Save Button */}
          <motion.div
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            transition={{ ...fadeInUpTransition, delay: 0.45 }}
          >
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-green-800 text-white text-sm font-medium hover:bg-green-900 transition-colors duration-200 shadow-sm disabled:opacity-50"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              Save Changes
            </button>
          </motion.div>
        </div>
      )}
    </div>
  )
}
