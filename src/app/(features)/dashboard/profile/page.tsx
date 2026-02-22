'use client'

import { useEffect, useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Loader2, Save, User, GraduationCap, Heart, Mail, Phone, School } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/store/auth-store'
import TagInput from '@/components/ui/TagInput'
import { playPop, playSuccess } from '@/lib/sounds'
import { fadeInUp, fadeInUpTransition } from '@/lib/animations'

interface Profile {
  education_level?: string
  class_or_year?: string
  institution?: string
  board?: string
  stream?: string
  cgpa?: string
  parent_occupation?: string
  siblings?: string
  income_range?: string
  hobbies?: string[]
  interests?: string[]
  strengths?: string[]
  weaknesses?: string[]
  languages?: string[]
  career_aspiration_raw?: string
}

export default function ProfilePage() {
  const { user } = useAuthStore()
  const [profile, setProfile] = useState<Profile>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

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
      profile.hobbies?.length,
      profile.interests?.length,
      profile.strengths?.length,
      profile.languages?.length,
      profile.career_aspiration_raw,
    ]
    const filled = fields.filter(Boolean).length
    return Math.round((filled / fields.length) * 100)
  }, [profile])

  async function handleSave() {
    playPop()
    setSaving(true)
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      })

      if (res.ok) {
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

  return (
    <div className="p-6 sm:p-8 max-w-3xl">
      {/* Profile Header Card */}
      <motion.div
        variants={fadeInUp}
        initial="initial"
        animate="animate"
        transition={fadeInUpTransition}
        className="mb-6"
      >
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
            {/* Avatar */}
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-600 to-emerald-700 flex items-center justify-center text-white text-2xl font-bold shrink-0 shadow-md">
              {user.name.charAt(0).toUpperCase()}
            </div>

            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-gray-900">{user.name}</h1>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5">
                <span className="flex items-center gap-1.5 text-xs text-gray-500">
                  <Mail size={12} />
                  {user.email}
                </span>
                {user.phone && (
                  <span className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Phone size={12} />
                    {user.phone}
                  </span>
                )}
                <span className="flex items-center gap-1.5 text-xs text-gray-500">
                  <School size={12} />
                  {user.college}
                </span>
              </div>

              {/* Completion bar */}
              <div className="mt-3">
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
        </div>
      </motion.div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={24} className="animate-spin text-gray-400" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Education Section */}
          <motion.div
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            transition={{ ...fadeInUpTransition, delay: 0.1 }}
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
                    onChange={(e) => setProfile({ ...profile, education_level: e.target.value })}
                    placeholder="e.g. Undergraduate"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Class / Year</label>
                  <input
                    type="text"
                    value={profile.class_or_year || ''}
                    onChange={(e) => setProfile({ ...profile, class_or_year: e.target.value })}
                    placeholder="e.g. 2nd Year"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Stream</label>
                  <input
                    type="text"
                    value={profile.stream || ''}
                    onChange={(e) => setProfile({ ...profile, stream: e.target.value })}
                    placeholder="e.g. Computer Science"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">CGPA</label>
                  <input
                    type="text"
                    value={profile.cgpa || ''}
                    onChange={(e) => setProfile({ ...profile, cgpa: e.target.value })}
                    placeholder="e.g. 8.5"
                    className={inputClass}
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* About You Section */}
          <motion.div
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            transition={{ ...fadeInUpTransition, delay: 0.15 }}
          >
            <div className="bg-white rounded-2xl border border-gray-200 border-l-4 border-l-emerald-500 p-6 shadow-sm">
              <div className="flex items-center gap-2.5 mb-5">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-700">
                  <Heart size={16} />
                </div>
                <h2 className="text-sm font-semibold text-gray-900">About You</h2>
              </div>
              <div className="space-y-4">
                <TagInput
                  label="Hobbies"
                  tags={profile.hobbies || []}
                  onChange={(hobbies) => setProfile({ ...profile, hobbies })}
                />
                <TagInput
                  label="Interests"
                  tags={profile.interests || []}
                  onChange={(interests) => setProfile({ ...profile, interests })}
                />
                <TagInput
                  label="Strengths"
                  tags={profile.strengths || []}
                  onChange={(strengths) => setProfile({ ...profile, strengths })}
                  maxTags={5}
                />
                <TagInput
                  label="Weaknesses"
                  tags={profile.weaknesses || []}
                  onChange={(weaknesses) => setProfile({ ...profile, weaknesses })}
                  maxTags={5}
                />
                <TagInput
                  label="Languages"
                  tags={profile.languages || []}
                  onChange={(languages) => setProfile({ ...profile, languages })}
                />
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Career Aspiration</label>
                  <textarea
                    value={profile.career_aspiration_raw || ''}
                    onChange={(e) => setProfile({ ...profile, career_aspiration_raw: e.target.value })}
                    rows={3}
                    placeholder="What career path excites you the most?"
                    className={`${inputClass} resize-none`}
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Save Button */}
          <motion.div
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            transition={{ ...fadeInUpTransition, delay: 0.2 }}
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
