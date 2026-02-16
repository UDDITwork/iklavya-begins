'use client'

import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Mic, BookOpen, FileText, BarChart3, Zap,
  MessageCircle, Award, Users, Shield, LogOut,
  GraduationCap, Calendar
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/store/auth-store'
import { staggerContainer, staggerItem, fadeInUp, fadeInUpTransition } from '@/lib/animations'

const featureLinks = [
  { href: '/ai-interview', label: 'AI Interview', icon: Mic, description: 'Practice mock interviews with AI' },
  { href: '/ai-courses', label: 'Courses', icon: BookOpen, description: 'Browse video course library' },
  { href: '/resume-builder', label: 'Resume Builder', icon: FileText, description: 'Build ATS-optimized resumes' },
  { href: '/skill-assessment', label: 'Skill Assessment', icon: BarChart3, description: 'Evaluate your soft skills' },
  { href: '/live-quiz', label: 'Live Quiz', icon: Zap, description: 'Compete in real-time quizzes' },
  { href: '/career-guidance', label: 'Career Guidance', icon: MessageCircle, description: 'Get AI career advice' },
  { href: '/certifications', label: 'Certifications', icon: Award, description: 'Earn certificates & badges' },
  { href: '/support', label: 'Support', icon: Users, description: 'Get help & book mentors' },
  { href: '/admin', label: 'Admin Panel', icon: Shield, description: 'Platform analytics & management' },
]

export default function DashboardPage() {
  const router = useRouter()
  const { user, logout } = useAuthStore()

  async function handleLogout() {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      logout()
      toast.success('Logged out successfully')
      router.push('/')
    } catch {
      toast.error('Failed to logout')
    }
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <motion.div
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          transition={fadeInUpTransition}
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Welcome back, {user.name.split(' ')[0]}
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Continue your career readiness journey
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2.5 min-h-[40px] rounded-lg border border-gray-300 text-gray-700 text-xs font-medium hover:bg-gray-50 transition-colors duration-200"
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>

          <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-5 mb-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-green-50 border border-green-200 flex items-center justify-center text-green-800 font-semibold text-lg shrink-0">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider">Name</p>
                  <p className="text-sm font-medium text-gray-900 mt-0.5">{user.name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider">Email</p>
                  <p className="text-sm font-medium text-gray-900 mt-0.5">{user.email}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider">College</p>
                  <p className="text-sm font-medium text-gray-900 mt-0.5">{user.college}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                <GraduationCap size={13} />
                <span className="capitalize">{user.role}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                <Calendar size={13} />
                <span>Joined {new Date(user.created_at).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</span>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Quick Access</h2>
          <p className="text-sm text-gray-500 mt-0.5">Jump into any feature</p>
        </div>

        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {featureLinks.map((feature) => (
            <motion.div key={feature.href} variants={staggerItem}>
              <Link href={feature.href}>
                <div className="group rounded-xl bg-white border border-gray-200 shadow-sm p-5 hover:border-green-300 hover:shadow-md transition-all duration-200">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-9 h-9 rounded-lg bg-green-50/60 flex items-center justify-center text-green-800 group-hover:bg-green-100 transition-colors duration-200">
                      <feature.icon size={18} />
                    </div>
                    <h3 className="text-sm font-semibold text-gray-900">{feature.label}</h3>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">{feature.description}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  )
}
