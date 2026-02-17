'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Mic, BookOpen, FileText, BarChart3, Zap,
  MessageCircle, Award, Shield, Users, Menu, X,
  LayoutDashboard, LogOut
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/store/auth-store'

const navLinks = [
  { href: '/ai-interview', label: 'Interview', icon: Mic },
  { href: '/ai-courses', label: 'Courses', icon: BookOpen },
  { href: '/resume-builder', label: 'Resume', icon: FileText },
  { href: '/skill-assessment', label: 'Skills', icon: BarChart3 },
  { href: '/live-quiz', label: 'Quiz', icon: Zap },
  { href: '/career-guidance', label: 'Career', icon: MessageCircle },
  { href: '/certifications', label: 'Certs', icon: Award },
  { href: '/support', label: 'Support', icon: Users },
  { href: '/admin', label: 'Admin', icon: Shield },
]

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { user, isLoading, logout } = useAuthStore()

  const isAuthPage = pathname === '/login' || pathname === '/register'
  const isSessionPage = pathname.startsWith('/session/')
  if (isAuthPage || isSessionPage) return null

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

  const allLinks = user
    ? [{ href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard }, ...navLinks]
    : navLinks

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-xl font-bold text-gray-900 tracking-tight">
                IKLAVYA
              </span>
            </Link>

            <div className="hidden lg:flex items-center gap-1">
              {allLinks.map((link) => {
                const isActive = pathname === link.href
                return (
                  <Link key={link.href} href={link.href}>
                    <div
                      className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-2 min-h-[40px] rounded-lg text-xs font-medium transition-colors duration-200 ${
                        isActive
                          ? 'bg-green-50/40 text-green-800'
                          : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      <link.icon size={14} />
                      {link.label}
                    </div>
                  </Link>
                )
              })}
            </div>

            <div className="flex items-center gap-3">
              {isLoading ? (
                <div className="hidden sm:block w-24 h-10 rounded-lg bg-gray-100 animate-pulse" />
              ) : user ? (
                <div className="hidden sm:flex items-center gap-2">
                  <Link href="/dashboard">
                    <div className="w-9 h-9 rounded-full bg-green-50 border border-green-200 flex items-center justify-center text-green-800 font-semibold text-sm">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1.5 px-3 py-2 min-h-[40px] rounded-lg text-xs font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors duration-200"
                  >
                    <LogOut size={14} />
                    Logout
                  </button>
                </div>
              ) : (
                <div className="hidden sm:flex items-center gap-2">
                  <Link href="/login">
                    <button className="px-4 py-2 sm:py-2.5 min-h-[40px] rounded-lg border border-gray-300 text-gray-700 text-xs font-medium hover:bg-gray-50 transition-colors duration-200">
                      Login
                    </button>
                  </Link>
                  <Link href="/register">
                    <button className="px-4 sm:px-5 py-2 sm:py-2.5 min-h-[44px] rounded-lg border-2 border-green-800 hover:bg-green-50 text-green-800 text-xs font-medium transition-colors duration-200">
                      Register
                    </button>
                  </Link>
                </div>
              )}

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden w-10 h-10 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors"
              >
                {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed top-16 inset-x-0 z-40 bg-white border-b border-gray-200 lg:hidden shadow-sm"
          >
            <div className="p-3 grid grid-cols-3 gap-1.5">
              {allLinks.map((link) => {
                const isActive = pathname === link.href
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <div
                      className={`flex flex-col items-center gap-1.5 p-2.5 sm:p-3 min-h-[60px] rounded-xl text-center transition-colors duration-200 ${
                        isActive
                          ? 'bg-green-50/40 text-green-800'
                          : 'text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      <link.icon size={18} />
                      <span className="text-[10px] font-medium">{link.label}</span>
                    </div>
                  </Link>
                )
              })}
            </div>

            <div className="p-3 border-t border-gray-100">
              {user ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-green-50 border border-green-200 flex items-center justify-center text-green-800 font-semibold text-xs">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-xs font-medium text-gray-900">{user.name}</span>
                  </div>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false)
                      handleLogout()
                    }}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-gray-500 hover:bg-gray-50"
                  >
                    <LogOut size={14} />
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link href="/login" className="flex-1" onClick={() => setMobileMenuOpen(false)}>
                    <button className="w-full px-4 py-2.5 min-h-[40px] rounded-lg border border-gray-300 text-gray-700 text-xs font-medium hover:bg-gray-50 transition-colors">
                      Login
                    </button>
                  </Link>
                  <Link href="/register" className="flex-1" onClick={() => setMobileMenuOpen(false)}>
                    <button className="w-full px-4 py-2.5 min-h-[44px] rounded-lg border-2 border-green-800 text-green-800 text-xs font-medium hover:bg-green-50 transition-colors">
                      Register
                    </button>
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
