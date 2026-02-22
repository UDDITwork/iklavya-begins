'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, MessageSquare, User, LogOut, Menu, X, FileText,
  ChevronDown, Plus, Loader2
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/store/auth-store'
import { playPop } from '@/lib/sounds'

interface SessionItem {
  id: string
  title: string
  status: string
}

const sidebarLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/dashboard/career-guidance', label: 'Career Guidance', icon: MessageSquare, expandable: true },
  { href: '/dashboard/resume-builder', label: 'Resume Builder', icon: FileText },
  { href: '/dashboard/profile', label: 'Profile', icon: User },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuthStore()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [sessionsExpanded, setSessionsExpanded] = useState(false)
  const [sessions, setSessions] = useState<SessionItem[]>([])
  const [sessionsLoaded, setSessionsLoaded] = useState(false)
  const [creatingSession, setCreatingSession] = useState(false)

  const isCareerGuidanceActive =
    pathname === '/dashboard/career-guidance' ||
    pathname.startsWith('/dashboard/career-guidance/') ||
    pathname.startsWith('/session/')

  // Auto-expand when on career guidance or session page
  useEffect(() => {
    if (isCareerGuidanceActive) {
      setSessionsExpanded(true)
    }
  }, [isCareerGuidanceActive])

  // Fetch sessions when expanded
  useEffect(() => {
    if (sessionsExpanded && !sessionsLoaded) {
      fetchSessions()
    }
  }, [sessionsExpanded, sessionsLoaded])

  async function fetchSessions() {
    try {
      const res = await fetch('/api/sessions')
      if (res.ok) {
        const data = await res.json()
        setSessions((data.sessions || []).slice(0, 8))
      }
    } catch {
      // silently fail
    } finally {
      setSessionsLoaded(true)
    }
  }

  async function handleNewSession() {
    playPop()
    setCreatingSession(true)
    try {
      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Career Guidance Session' }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Failed to create session')
        return
      }
      setSessions((prev) => [{ id: data.id, title: 'Career Guidance Session', status: 'active' }, ...prev])
      setMobileOpen(false)
      router.push(`/session/${data.id}`)
    } catch {
      toast.error('Something went wrong')
    } finally {
      setCreatingSession(false)
    }
  }

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

  const navContent = (
    <>
      {/* User info */}
      <div className="p-5 border-b border-gray-100 bg-gradient-to-b from-green-50/40 to-transparent">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-600 to-emerald-700 flex items-center justify-center text-white font-semibold text-sm shrink-0 shadow-sm">
            {user?.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{user?.name}</p>
            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {sidebarLinks.map((link) => {
          const isActive = link.exact
            ? pathname === link.href
            : pathname === link.href || pathname.startsWith(link.href + '/')

          // Special handling for Career Guidance (expandable with nested sessions)
          if (link.expandable) {
            return (
              <div key={link.href}>
                <div className="flex items-center">
                  <Link
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="flex-1"
                  >
                    <div
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                        isCareerGuidanceActive
                          ? 'bg-green-50/60 text-green-800 border-l-[3px] border-green-700 ml-0 pl-[9px]'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      <link.icon size={18} />
                      {link.label}
                    </div>
                  </Link>
                  <button
                    onClick={() => setSessionsExpanded(!sessionsExpanded)}
                    className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <ChevronDown
                      size={14}
                      className={`transition-transform duration-200 ${sessionsExpanded ? 'rotate-180' : ''}`}
                    />
                  </button>
                </div>

                {/* Nested sessions */}
                {sessionsExpanded && (
                  <div className="ml-3 mt-1 pl-3 border-l-2 border-gray-100 space-y-0.5">
                    <button
                      onClick={handleNewSession}
                      disabled={creatingSession}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-green-800 hover:bg-green-50/40 transition-colors disabled:opacity-50"
                    >
                      {creatingSession ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : (
                        <Plus size={12} />
                      )}
                      New Session
                    </button>

                    {sessions.map((session) => {
                      const isSessionActive = pathname === `/session/${session.id}`
                      return (
                        <Link
                          key={session.id}
                          href={`/session/${session.id}`}
                          onClick={() => setMobileOpen(false)}
                        >
                          <div
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-colors duration-200 ${
                              isSessionActive
                                ? 'bg-green-50/60 text-green-800 font-medium'
                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            <MessageSquare size={12} className="shrink-0" />
                            <span className="truncate">{session.title}</span>
                            {session.status === 'active' && (
                              <span className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0 ml-auto" />
                            )}
                          </div>
                        </Link>
                      )
                    })}

                    {sessionsLoaded && sessions.length === 0 && (
                      <p className="px-3 py-2 text-xs text-gray-300">No sessions yet</p>
                    )}
                  </div>
                )}
              </div>
            )
          }

          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
            >
              <div
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-green-50/60 text-green-800 border-l-[3px] border-green-700 ml-0 pl-[9px]'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <link.icon size={18} />
                {link.label}
              </div>
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-gray-100">
        <button
          onClick={() => {
            setMobileOpen(false)
            handleLogout()
          }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors duration-200"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </>
  )

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="md:hidden fixed top-20 left-4 z-40 w-10 h-10 rounded-lg bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-600"
      >
        {mobileOpen ? <X size={18} /> : <Menu size={18} />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-30 bg-black/20"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:sticky top-16 z-30 h-[calc(100vh-4rem)] w-64 bg-white border-r border-gray-200 flex flex-col transition-transform duration-200 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {navContent}
      </aside>
    </>
  )
}
