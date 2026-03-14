'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import {
  Loader2,
  CheckCircle2,
  Clock,
  Save,
  User,
  Briefcase,
  LinkIcon,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { fadeInUp, fadeInUpTransition } from '@/lib/animations'

interface Mentor {
  _id: string
  name: string
  email: string
  phone?: string
  specialization: string
  bio: string
  expertise: string[]
  linkedin?: string
  experience_years?: number
  is_verified: boolean
  is_available: boolean
}

export default function MentorDashboardPage() {
  const router = useRouter()
  const [mentor, setMentor] = useState<Mentor | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: '',
    phone: '',
    specialization: '',
    bio: '',
    expertise: '',
    linkedin: '',
    experience_years: '',
    is_available: true,
  })

  const fetchMentor = useCallback(async () => {
    try {
      const res = await fetch('/api/mentor/me')
      if (!res.ok) {
        router.push('/mentor/login')
        return
      }
      const data = await res.json()
      const m = data.mentor
      setMentor(m)
      setForm({
        name: m.name || '',
        phone: m.phone || '',
        specialization: m.specialization || '',
        bio: m.bio || '',
        expertise: (m.expertise || []).join(', '),
        linkedin: m.linkedin || '',
        experience_years: m.experience_years?.toString() || '',
        is_available: m.is_available ?? true,
      })
    } catch {
      router.push('/mentor/login')
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    fetchMentor()
  }, [fetchMentor])

  function handleChange(field: string, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        name: form.name,
        phone: form.phone || undefined,
        specialization: form.specialization,
        bio: form.bio,
        expertise: form.expertise.split(',').map((s) => s.trim()).filter(Boolean),
        linkedin: form.linkedin || undefined,
        experience_years: form.experience_years ? Number(form.experience_years) : undefined,
        is_available: form.is_available,
      }

      const res = await fetch('/api/mentor/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || 'Failed to update profile')
        return
      }

      setMentor(data.mentor)
      toast.success('Profile updated!')
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={32} className="animate-spin text-emerald-600" />
      </div>
    )
  }

  if (!mentor) return null

  const inputClass =
    'w-full px-4 py-3 min-h-[44px] rounded-lg border border-gray-300 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-100 transition-all duration-200 text-sm'

  return (
    <motion.div
      variants={fadeInUp}
      initial="initial"
      animate="animate"
      transition={fadeInUpTransition}
      className="space-y-6"
    >
      {/* Status Banner */}
      {!mentor.is_verified && (
        <div className="rounded-lg bg-amber-50 border border-amber-200 p-4">
          <div className="flex items-start gap-3">
            <Clock size={20} className="text-amber-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-amber-800">Profile Under Review</p>
              <p className="text-xs text-amber-700 mt-1">
                Your profile is under review. Once verified by admin, students will be able to see
                your profile and request mentorship sessions.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Profile Header */}
      <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center">
              <User size={24} className="text-emerald-700" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">{mentor.name}</h1>
              <p className="text-sm text-gray-500">{mentor.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {mentor.is_verified ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
                <CheckCircle2 size={14} />
                Verified
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-200">
                <Clock size={14} />
                Pending Review
              </span>
            )}
          </div>
        </div>

        {mentor.specialization && (
          <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
            <Briefcase size={14} className="text-gray-400" />
            {mentor.specialization}
            {mentor.experience_years !== undefined && (
              <span className="text-gray-400">
                &middot; {mentor.experience_years} years experience
              </span>
            )}
          </div>
        )}

        {mentor.linkedin && (
          <div className="mt-2 flex items-center gap-2 text-sm">
            <LinkIcon size={14} className="text-gray-400" />
            <a
              href={mentor.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-700 hover:underline"
            >
              LinkedIn Profile
            </a>
          </div>
        )}

        {mentor.expertise && mentor.expertise.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {mentor.expertise.map((tag) => (
              <span
                key={tag}
                className="text-xs bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Edit Profile Form */}
      <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Edit Profile</h2>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-xs font-medium text-gray-700 mb-1.5">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                value={form.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="phone" className="block text-xs font-medium text-gray-700 mb-1.5">
                Phone
              </label>
              <input
                id="phone"
                type="tel"
                value={form.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label htmlFor="specialization" className="block text-xs font-medium text-gray-700 mb-1.5">
              Specialization
            </label>
            <input
              id="specialization"
              type="text"
              value={form.specialization}
              onChange={(e) => handleChange('specialization', e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="bio" className="block text-xs font-medium text-gray-700 mb-1.5">
              Bio
            </label>
            <textarea
              id="bio"
              value={form.bio}
              onChange={(e) => handleChange('bio', e.target.value)}
              rows={3}
              className={`${inputClass} min-h-[80px] resize-none`}
            />
          </div>

          <div>
            <label htmlFor="expertise" className="block text-xs font-medium text-gray-700 mb-1.5">
              Areas of Expertise (comma-separated)
            </label>
            <input
              id="expertise"
              type="text"
              value={form.expertise}
              onChange={(e) => handleChange('expertise', e.target.value)}
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="linkedin" className="block text-xs font-medium text-gray-700 mb-1.5">
                LinkedIn URL
              </label>
              <input
                id="linkedin"
                type="url"
                value={form.linkedin}
                onChange={(e) => handleChange('linkedin', e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="experience_years" className="block text-xs font-medium text-gray-700 mb-1.5">
                Years of Experience
              </label>
              <input
                id="experience_years"
                type="number"
                min="0"
                value={form.experience_years}
                onChange={(e) => handleChange('experience_years', e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          {/* Availability Toggle */}
          <div className="flex items-center justify-between py-3 px-4 rounded-lg bg-gray-50 border border-gray-200">
            <div>
              <p className="text-sm font-medium text-gray-900">Available for Mentorship</p>
              <p className="text-xs text-gray-500 mt-0.5">
                Toggle off to temporarily hide from student requests
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleChange('is_available', !form.is_available)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                form.is_available ? 'bg-emerald-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  form.is_available ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="flex items-center justify-center gap-2 px-6 py-3 min-h-[44px] rounded-lg border-2 border-emerald-700 bg-emerald-700 text-white text-sm font-medium hover:bg-emerald-800 hover:border-emerald-800 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Save size={16} />
            )}
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </motion.div>
  )
}
