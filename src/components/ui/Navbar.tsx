'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Mic, BookOpen, FileText, BarChart3, Zap,
  MessageCircle, Award, Shield, Users, Menu, X
} from 'lucide-react'

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

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
              {navLinks.map((link) => {
                const isActive = pathname === link.href
                return (
                  <Link key={link.href} href={link.href}>
                    <div
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors duration-200 ${
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
              <Link href="/ai-interview">
                <button className="hidden sm:block px-5 py-2 rounded-lg border-2 border-green-800 hover:bg-green-50
                  text-green-800 text-xs font-medium transition-colors duration-200">
                  Start Interview
                </button>
              </Link>

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
            <div className="p-4 grid grid-cols-3 gap-2">
              {navLinks.map((link) => {
                const isActive = pathname === link.href
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <div
                      className={`flex flex-col items-center gap-1.5 p-3 rounded-xl text-center transition-colors duration-200 ${
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
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
