'use client'

import { useState } from 'react'
import { Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react'

interface StepOneProps {
  form: {
    name: string
    email: string
    password: string
    confirmPassword: string
    phone: string
    college: string
  }
  onChange: (updates: Partial<StepOneProps['form']>) => void
  onSubmit: () => void
  isSubmitting: boolean
  errors: Record<string, string>
}

export default function StepOne({ form, onChange, onSubmit, isSubmitting, errors }: StepOneProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const inputClass =
    'w-full px-4 py-3 min-h-[44px] rounded-lg border border-gray-300 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-100 transition-all duration-200 text-sm'

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-xs font-medium text-gray-700 mb-1.5">
          Full Name
        </label>
        <input
          id="name"
          type="text"
          value={form.name}
          onChange={(e) => onChange({ name: e.target.value })}
          placeholder="Enter your full name"
          className={inputClass}
        />
        {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
      </div>

      <div>
        <label htmlFor="email" className="block text-xs font-medium text-gray-700 mb-1.5">
          Email Address
        </label>
        <input
          id="email"
          type="email"
          value={form.email}
          onChange={(e) => onChange({ email: e.target.value })}
          placeholder="you@example.com"
          className={inputClass}
        />
        {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="password" className="block text-xs font-medium text-gray-700 mb-1.5">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={form.password}
              onChange={(e) => onChange({ password: e.target.value })}
              placeholder="Min 8 characters"
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
          <label htmlFor="confirmPassword" className="block text-xs font-medium text-gray-700 mb-1.5">
            Confirm Password
          </label>
          <div className="relative">
            <input
              id="confirmPassword"
              type={showConfirm ? 'text' : 'password'}
              value={form.confirmPassword}
              onChange={(e) => onChange({ confirmPassword: e.target.value })}
              placeholder="Re-enter password"
              className={`${inputClass} pr-11`}
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.confirmPassword && <p className="mt-1 text-xs text-red-500">{errors.confirmPassword}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="phone" className="block text-xs font-medium text-gray-700 mb-1.5">
          Phone Number <span className="text-gray-400">(optional)</span>
        </label>
        <input
          id="phone"
          type="tel"
          value={form.phone}
          onChange={(e) => onChange({ phone: e.target.value })}
          placeholder="+91 XXXXXXXXXX"
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="college" className="block text-xs font-medium text-gray-700 mb-1.5">
          College / Institution
        </label>
        <input
          id="college"
          type="text"
          value={form.college}
          onChange={(e) => onChange({ college: e.target.value })}
          placeholder="Enter your college name"
          className={inputClass}
        />
        {errors.college && <p className="mt-1 text-xs text-red-500">{errors.college}</p>}
      </div>

      <button
        type="button"
        onClick={onSubmit}
        disabled={isSubmitting}
        className="w-full flex items-center justify-center gap-2 px-6 py-3 min-h-[44px] rounded-lg border-2 border-green-800 bg-green-800 text-white text-sm font-medium hover:bg-green-900 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <>
            Create Account
            <ArrowRight size={16} />
          </>
        )}
      </button>
    </div>
  )
}
