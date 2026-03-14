'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, UserPlus, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { fadeInUp, fadeInUpTransition } from '@/lib/animations'

export default function MentorSignupPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    specialization: '',
    bio: '',
    expertise: '',
    linkedin: '',
    experience_years: '',
  })

  function validate() {
    const errs: Record<string, string> = {}
    if (!form.name.trim()) errs.name = 'Name is required'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Invalid email address'
    if (form.password.length < 6) errs.password = 'Password must be at least 6 characters'
    if (!form.specialization.trim()) errs.specialization = 'Specialization is required'
    if (!form.bio.trim()) errs.bio = 'Bio is required'
    if (!form.expertise.trim()) errs.expertise = 'At least one area of expertise is required'
    if (form.experience_years && isNaN(Number(form.experience_years))) {
      errs.experience_years = 'Must be a number'
    }
    if (form.linkedin && !/^https?:\/\/(www\.)?linkedin\.com\//.test(form.linkedin)) {
      errs.linkedin = 'Must be a valid LinkedIn URL'
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  function handleChange(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    setIsSubmitting(true)
    try {
      const payload = {
        name: form.name,
        email: form.email,
        password: form.password,
        phone: form.phone || undefined,
        specialization: form.specialization,
        bio: form.bio,
        expertise: form.expertise.split(',').map((s) => s.trim()).filter(Boolean),
        linkedin: form.linkedin || undefined,
        experience_years: form.experience_years ? Number(form.experience_years) : undefined,
      }

      const res = await fetch('/api/mentor/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || 'Registration failed')
        return
      }

      toast.success('Account created! Your profile will be reviewed by admin.')
      router.push('/mentor/dashboard')
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const inputClass =
    'w-full px-4 py-3 min-h-[44px] rounded-lg border border-gray-300 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-100 transition-all duration-200 text-sm'

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <motion.div
        variants={fadeInUp}
        initial="initial"
        animate="animate"
        transition={fadeInUpTransition}
        className="w-full max-w-lg"
      >
        <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-8">
          <div className="text-center mb-8">
            <Link href="/" className="text-2xl font-bold text-gray-900 tracking-tight">
              IKLAVYA
            </Link>
            <span className="ml-2 text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
              Mentor Portal
            </span>
            <h1 className="mt-4 text-xl font-semibold text-gray-900">
              Create Mentor Account
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Join IKLAVYA as a mentor and guide students
            </p>
          </div>

          <div className="mb-6 rounded-lg bg-amber-50 border border-amber-200 p-3">
            <p className="text-xs text-amber-800">
              Your profile will be verified by admin before it appears to students.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-xs font-medium text-gray-700 mb-1.5">
                  Full Name *
                </label>
                <input
                  id="name"
                  type="text"
                  value={form.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="Dr. Jane Smith"
                  className={inputClass}
                />
                {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
              </div>

              <div>
                <label htmlFor="email" className="block text-xs font-medium text-gray-700 mb-1.5">
                  Email Address *
                </label>
                <input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="you@example.com"
                  className={inputClass}
                />
                {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="password" className="block text-xs font-medium text-gray-700 mb-1.5">
                  Password *
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    placeholder="Min. 6 characters"
                    className={`${inputClass} pr-11`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
              </div>

              <div>
                <label htmlFor="phone" className="block text-xs font-medium text-gray-700 mb-1.5">
                  Phone (optional)
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={form.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="+91 9876543210"
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label htmlFor="specialization" className="block text-xs font-medium text-gray-700 mb-1.5">
                Specialization *
              </label>
              <input
                id="specialization"
                type="text"
                value={form.specialization}
                onChange={(e) => handleChange('specialization', e.target.value)}
                placeholder="e.g., Data Science, Software Engineering"
                className={inputClass}
              />
              {errors.specialization && <p className="mt-1 text-xs text-red-500">{errors.specialization}</p>}
            </div>

            <div>
              <label htmlFor="bio" className="block text-xs font-medium text-gray-700 mb-1.5">
                Bio *
              </label>
              <textarea
                id="bio"
                value={form.bio}
                onChange={(e) => handleChange('bio', e.target.value)}
                placeholder="Tell students about your background and what you can help with..."
                rows={3}
                className={`${inputClass} min-h-[80px] resize-none`}
              />
              {errors.bio && <p className="mt-1 text-xs text-red-500">{errors.bio}</p>}
            </div>

            <div>
              <label htmlFor="expertise" className="block text-xs font-medium text-gray-700 mb-1.5">
                Areas of Expertise * (comma-separated)
              </label>
              <input
                id="expertise"
                type="text"
                value={form.expertise}
                onChange={(e) => handleChange('expertise', e.target.value)}
                placeholder="Python, Machine Learning, Career Guidance"
                className={inputClass}
              />
              {errors.expertise && <p className="mt-1 text-xs text-red-500">{errors.expertise}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="linkedin" className="block text-xs font-medium text-gray-700 mb-1.5">
                  LinkedIn URL (optional)
                </label>
                <input
                  id="linkedin"
                  type="url"
                  value={form.linkedin}
                  onChange={(e) => handleChange('linkedin', e.target.value)}
                  placeholder="https://linkedin.com/in/..."
                  className={inputClass}
                />
                {errors.linkedin && <p className="mt-1 text-xs text-red-500">{errors.linkedin}</p>}
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
                  placeholder="e.g., 5"
                  className={inputClass}
                />
                {errors.experience_years && <p className="mt-1 text-xs text-red-500">{errors.experience_years}</p>}
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 min-h-[44px] rounded-lg border-2 border-emerald-700 bg-emerald-700 text-white text-sm font-medium hover:bg-emerald-800 hover:border-emerald-800 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
            >
              {isSubmitting ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <UserPlus size={16} />
              )}
              {isSubmitting ? 'Creating account...' : 'Create Mentor Account'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link href="/mentor/login" className="text-emerald-700 font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
