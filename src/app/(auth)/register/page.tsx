'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/store/auth-store'
import { registerStep1Schema, registerStep2Schema, registerStep3Schema } from '@/lib/validators'
import StepIndicator from '@/components/registration/StepIndicator'
import StepOne from '@/components/registration/StepOne'
import StepTwo from '@/components/registration/StepTwo'
import StepThree from '@/components/registration/StepThree'

const STEPS = ['Account', 'Education', 'About You']

export default function RegisterPage() {
  const router = useRouter()
  const { setUser } = useAuthStore()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [accountCreated, setAccountCreated] = useState(false)

  const [step1, setStep1] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    college: '',
  })

  const [step2, setStep2] = useState({
    education_level: '',
    class_or_year: '',
    institution: '',
    board: '',
    stream: '',
    cgpa: '',
  })

  const [step3, setStep3] = useState({
    parent_occupation: '',
    siblings: '',
    income_range: '',
    hobbies: [] as string[],
    interests: [] as string[],
    strengths: [] as string[],
    weaknesses: [] as string[],
    languages: [] as string[],
    career_aspiration_raw: '',
  })

  async function handleStep1Submit() {
    const result = registerStep1Schema.safeParse(step1)
    if (!result.success) {
      const fieldErrors: Record<string, string> = {}
      result.error.issues.forEach((e) => {
        const field = e.path[0] as string
        fieldErrors[field] = e.message
      })
      setErrors(fieldErrors)
      return
    }
    setErrors({})
    setIsSubmitting(true)

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: step1.name,
          email: step1.email,
          password: step1.password,
          phone: step1.phone || undefined,
          college: step1.college,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || 'Registration failed')
        return
      }

      setUser(data.user)
      setAccountCreated(true)
      toast.success('Account created! Complete your profile.')
      setCurrentStep(2)
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleStep2Next() {
    const result = registerStep2Schema.safeParse(step2)
    if (!result.success) {
      const fieldErrors: Record<string, string> = {}
      result.error.issues.forEach((e) => {
        const field = e.path[0] as string
        fieldErrors[field] = e.message
      })
      setErrors(fieldErrors)
      return
    }
    setErrors({})
    setIsSubmitting(true)

    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(step2),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || 'Failed to save education details')
        return
      }

      setCurrentStep(3)
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleStep3Submit() {
    const result = registerStep3Schema.safeParse(step3)
    if (!result.success) {
      const fieldErrors: Record<string, string> = {}
      result.error.issues.forEach((e) => {
        const field = e.path[0] as string
        fieldErrors[field] = e.message
      })
      setErrors(fieldErrors)
      return
    }
    setErrors({})
    setIsSubmitting(true)

    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(step3),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || 'Failed to save profile')
        return
      }

      const meRes = await fetch('/api/auth/me')
      if (meRes.ok) {
        const meData = await meRes.json()
        setUser(meData.user)
      }

      toast.success('Profile complete! Welcome to IKLAVYA.')
      router.push('/dashboard')
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="w-full max-w-lg">
      <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-8">
        <div className="text-center mb-6">
          <Link href="/" className="text-2xl font-bold text-gray-900 tracking-tight">
            IKLAVYA
          </Link>
          <h1 className="mt-3 text-lg font-semibold text-gray-900">
            {currentStep === 1 && 'Create your account'}
            {currentStep === 2 && 'Education Details'}
            {currentStep === 3 && 'Tell us about yourself'}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {currentStep === 1 && 'Start your career readiness journey'}
            {currentStep === 2 && 'Help us understand your academic background'}
            {currentStep === 3 && 'This helps our AI give better career guidance'}
          </p>
        </div>

        <StepIndicator currentStep={currentStep} steps={STEPS} />

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {currentStep === 1 && (
              <StepOne
                form={step1}
                onChange={(updates) => setStep1((prev) => ({ ...prev, ...updates }))}
                onSubmit={handleStep1Submit}
                isSubmitting={isSubmitting}
                errors={errors}
              />
            )}
            {currentStep === 2 && (
              <StepTwo
                form={step2}
                onChange={(updates) => setStep2((prev) => ({ ...prev, ...updates }))}
                onNext={handleStep2Next}
                onBack={accountCreated ? undefined : () => setCurrentStep(1)}
                isSubmitting={isSubmitting}
                errors={errors}
              />
            )}
            {currentStep === 3 && (
              <StepThree
                form={step3}
                onChange={(updates) => setStep3((prev) => ({ ...prev, ...updates }))}
                onSubmit={handleStep3Submit}
                onBack={() => setCurrentStep(2)}
                isSubmitting={isSubmitting}
                errors={errors}
              />
            )}
          </motion.div>
        </AnimatePresence>

        {currentStep === 1 && (
          <p className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link href="/login" className="text-green-800 font-medium hover:underline">
              Sign in
            </Link>
          </p>
        )}
      </div>
    </div>
  )
}
