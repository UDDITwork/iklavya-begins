'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import Image from 'next/image'
import {
  Mic, BookOpen, FileText, BarChart3, Zap,
  MessageCircle, Award, Shield, Users, Menu, X,
  LayoutDashboard, LogOut, Briefcase, GraduationCap, Building2, PlaySquare, Bell
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/store/auth-store'
import { useNotificationStore } from '@/store/notification-store'

const navLinks = [
  { href: '/ai-interview', label: 'Interview', icon: Mic },
  { href: '/ai-courses', label: 'Courses', icon: BookOpen },
  { href: '/dashboard/classroom', label: 'Classroom', icon: PlaySquare },
  { href: '/dashboard/resume-builder', label: 'Resume', icon: FileText },
  { href: '/skill-assessment', label: 'Skills', icon: BarChart3 },
  { href: '/live-quiz', label: 'Quiz', icon: Zap },
  { href: '/dashboard/career-guidance', label: 'Career', icon: MessageCircle },
  { href: '/certifications', label: 'Certs', icon: Award },
  { href: '/for-employers', label: 'Employers', icon: Briefcase },
  { href: '/support', label: 'Support', icon: Users },
  { href: '/admin', label: 'Admin', icon: Shield },
]

function LiveClock() {
  const [now, setNow] = useState<Date | null>(null)

  useEffect(() => {
    setNow(new Date())
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  if (!now) return null

  const hours = now.getHours()
  const minutes = now.getMinutes()
  const seconds = now.getSeconds()
  const h12 = hours % 12 || 12
  const ampm = hours >= 12 ? 'PM' : 'AM'
  const pad = (n: number) => n.toString().padStart(2, '0')

  const day = now.toLocaleDateString('en-IN', { weekday: 'short' })
  const date = now.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })

  // Analog clock angles
  const hourAngle = ((hours % 12) + minutes / 60) * 30
  const minuteAngle = (minutes + seconds / 60) * 6
  const secondAngle = seconds * 6

  return (
    <div className="hidden sm:flex items-center gap-3">
      {/* Tiny analog clock */}
      <svg width="32" height="32" viewBox="0 0 32 32" className="shrink-0">
        <circle cx="16" cy="16" r="14.5" fill="none" stroke="#D1D5DB" strokeWidth="1" />
        {/* Hour ticks */}
        {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
          <line
            key={deg}
            x1="16"
            y1="3"
            x2="16"
            y2={deg % 90 === 0 ? '5.5' : '4.5'}
            stroke={deg % 90 === 0 ? '#374151' : '#9CA3AF'}
            strokeWidth={deg % 90 === 0 ? '1.2' : '0.8'}
            strokeLinecap="round"
            transform={`rotate(${deg} 16 16)`}
          />
        ))}
        {/* Hour hand */}
        <line
          x1="16" y1="16" x2="16" y2="8"
          stroke="#374151" strokeWidth="1.6" strokeLinecap="round"
          transform={`rotate(${hourAngle} 16 16)`}
        />
        {/* Minute hand */}
        <line
          x1="16" y1="16" x2="16" y2="5.5"
          stroke="#374151" strokeWidth="1.1" strokeLinecap="round"
          transform={`rotate(${minuteAngle} 16 16)`}
        />
        {/* Second hand */}
        <line
          x1="16" y1="18" x2="16" y2="5"
          stroke="#DC2626" strokeWidth="0.5" strokeLinecap="round"
          transform={`rotate(${secondAngle} 16 16)`}
        />
        <circle cx="16" cy="16" r="1.2" fill="#374151" />
      </svg>

      {/* Digital time + date */}
      <div className="leading-tight">
        <p className="text-sm font-semibold text-gray-800 tabular-nums tracking-wide">
          {h12}:{pad(minutes)}
          <span className="text-[10px] font-medium text-gray-400 ml-0.5">{ampm}</span>
        </p>
        <p className="text-[10px] text-gray-400 font-medium">
          {day}, {date}
        </p>
      </div>
    </div>
  )
}

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { user, isLoading, logout } = useAuthStore()
  const { unreadCount } = useNotificationStore()

  const isAuthPage = pathname === '/login' || pathname === '/register'
  const isSessionPage = pathname.startsWith('/session/') || pathname.startsWith('/resume-session/')
  const isDashboard = pathname.startsWith('/dashboard')
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

  // Show Students/Institutions/Employers only when NOT logged in and NOT on dashboard
  const showPageLinks = !user && !isDashboard

  return (
    <>
      <nav aria-label="Main navigation" className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-xl font-bold text-gray-900 tracking-tight">
                IKLAVYA
              </span>
            </Link>

            {/* Page links for guests only */}
            {showPageLinks && (
              <div className="hidden sm:flex items-center gap-1">
                {[
                  { href: '/students', label: 'Students', icon: GraduationCap, color: 'text-green-800' },
                  { href: '/institutions', label: 'Institutions', icon: Building2, color: 'text-amber-700' },
                  { href: '/for-employers', label: 'Employers', icon: Briefcase, color: 'text-orange-600' },
                ].map((link) => {
                  const isActive = pathname === link.href
                  return (
                    <Link key={link.href} href={link.href}>
                      <div className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? `${link.color} bg-gray-50`
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}>
                        <link.icon size={16} />
                        <span>{link.label}</span>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}

            {/* Live clock for logged-in users (non-dashboard) */}
            {user && !isDashboard && <LiveClock />}

            <div className="flex items-center gap-3">
              {isLoading ? (
                <div className="w-24 h-10 rounded-lg bg-gray-100 animate-pulse" />
              ) : user ? (
                <div className="flex items-center gap-2">
                  <Link href="/dashboard" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                    <LayoutDashboard size={16} />
                    <span className="hidden sm:inline">Dashboard</span>
                  </Link>
                  <Link href="/dashboard/notifications" className="relative p-2 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
                    <Bell size={18} />
                    {unreadCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-500 flex items-center justify-center text-[9px] font-bold text-white animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </Link>
                  <Link href="/dashboard">
                    {user.profile_image ? (
                      <Image
                        src={user.profile_image}
                        alt={user.name}
                        width={36}
                        height={36}
                        className="w-9 h-9 rounded-full object-cover border border-gray-200"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-green-50 border border-green-200 flex items-center justify-center text-green-800 font-semibold text-sm">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </Link>
                </div>
              ) : (
                <div className="hidden sm:flex items-center gap-2">
                  <Link href="/login">
                    <button className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors">
                      Login
                    </button>
                  </Link>
                  <Link href="/register">
                    <button className="px-5 py-2.5 rounded-lg bg-green-700 hover:bg-green-800 text-white text-sm font-medium transition-colors">
                      Get Started
                    </button>
                  </Link>
                </div>
              )}

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={mobileMenuOpen}
                className="sm:hidden w-10 h-10 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors"
              >
                {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed top-16 inset-x-0 z-40 bg-white border-b border-gray-200 sm:hidden shadow-lg"
          >
            {/* Page links for guests only (mobile) */}
            {showPageLinks && (
              <div className="p-3 border-b border-gray-100 grid grid-cols-3 gap-1.5">
                {[
                  { href: '/students', label: 'Students', icon: GraduationCap, color: 'text-green-800', bg: 'bg-green-50/40' },
                  { href: '/institutions', label: 'Institutions', icon: Building2, color: 'text-amber-700', bg: 'bg-amber-50/40' },
                  { href: '/for-employers', label: 'Employers', icon: Briefcase, color: 'text-orange-600', bg: 'bg-orange-50/40' },
                ].map((link) => (
                  <Link key={link.href} href={link.href} onClick={() => setMobileMenuOpen(false)}>
                    <div className={`flex flex-col items-center gap-1.5 p-3 rounded-xl text-center transition-colors ${
                      pathname === link.href ? `${link.bg} ${link.color}` : 'text-gray-600 hover:bg-gray-50'
                    }`}>
                      <link.icon size={20} />
                      <span className="text-[11px] font-bold">{link.label}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}

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
                      className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl text-center transition-colors duration-200 ${
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
                    {user.profile_image ? (
                      <Image
                        src={user.profile_image}
                        alt={user.name}
                        width={32}
                        height={32}
                        className="w-8 h-8 rounded-full object-cover border border-gray-200"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-green-50 border border-green-200 flex items-center justify-center text-green-800 font-semibold text-xs">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="text-xs font-medium text-gray-900">{user.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Link href="/dashboard/notifications" onClick={() => setMobileMenuOpen(false)} className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-50">
                      <Bell size={16} />
                      {unreadCount > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-red-500 flex items-center justify-center text-[8px] font-bold text-white">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      )}
                    </Link>
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
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link href="/login" className="flex-1" onClick={() => setMobileMenuOpen(false)}>
                    <button className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 text-xs font-medium hover:bg-gray-50 transition-colors">
                      Login
                    </button>
                  </Link>
                  <Link href="/register" className="flex-1" onClick={() => setMobileMenuOpen(false)}>
                    <button className="w-full px-4 py-2.5 rounded-lg bg-green-700 text-white text-xs font-medium hover:bg-green-800 transition-colors">
                      Get Started
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
