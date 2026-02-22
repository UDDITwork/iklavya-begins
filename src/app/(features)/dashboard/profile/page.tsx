'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Loader2, Save } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/store/auth-store'
import TagInput from '@/components/ui/TagInput'
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

  async function handleSave() {
    setSaving(true)
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      })

      if (res.ok) {
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
    'w-full px-4 py-3 min-h-[44px] rounded-lg border border-gray-300 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-100 transition-all duration-200 text-sm'

  return (
    <div className="p-6 sm:p-8 max-w-3xl">
      <motion.div
        variants={fadeInUp}
        initial="initial"
        animate="animate"
        transition={fadeInUpTransition}
      >
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Profile</h1>
        <p className="text-sm text-gray-500 mb-8">
          Manage your personal and education details
        </p>

        <div className="rounded-xl bg-gray-50 border border-gray-200 p-5 mb-8">
          <h2 className="text-xs text-gray-400 uppercase tracking-wider mb-3">Account</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-400 text-xs">Name</span>
              <p className="font-medium text-gray-900">{user.name}</p>
            </div>
            <div>
              <span className="text-gray-400 text-xs">Email</span>
              <p className="font-medium text-gray-900">{user.email}</p>
            </div>
            <div>
              <span className="text-gray-400 text-xs">College</span>
              <p className="font-medium text-gray-900">{user.college}</p>
            </div>
            {user.phone && (
              <div>
                <span className="text-gray-400 text-xs">Phone</span>
                <p className="font-medium text-gray-900">{user.phone}</p>
              </div>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={24} className="animate-spin text-gray-400" />
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <h2 className="text-xs text-gray-400 uppercase tracking-wider mb-4">Education</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Education Level</label>
                  <input
                    type="text"
                    value={profile.education_level || ''}
                    onChange={(e) => setProfile({ ...profile, education_level: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Class / Year</label>
                  <input
                    type="text"
                    value={profile.class_or_year || ''}
                    onChange={(e) => setProfile({ ...profile, class_or_year: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Stream</label>
                  <input
                    type="text"
                    value={profile.stream || ''}
                    onChange={(e) => setProfile({ ...profile, stream: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">CGPA</label>
                  <input
                    type="text"
                    value={profile.cgpa || ''}
                    onChange={(e) => setProfile({ ...profile, cgpa: e.target.value })}
                    className={inputClass}
                  />
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xs text-gray-400 uppercase tracking-wider mb-4">About You</h2>
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
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Career Aspiration</label>
                  <textarea
                    value={profile.career_aspiration_raw || ''}
                    onChange={(e) => setProfile({ ...profile, career_aspiration_raw: e.target.value })}
                    rows={3}
                    className={`${inputClass} resize-none`}
                  />
                </div>
              </div>
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 rounded-lg border-2 border-green-800 bg-green-800 text-white text-sm font-medium hover:bg-green-900 transition-colors duration-200 disabled:opacity-50"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              Save Changes
            </button>
          </div>
        )}
      </motion.div>
    </div>
  )
}
