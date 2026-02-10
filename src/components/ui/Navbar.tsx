'use client'

import { motion, AnimatePresence } from 'framer-motion'
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
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 100, damping: 20 }}
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-[#030014]/80 border-b border-white/5"
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <motion.span
                className="text-xl font-bold gradient-text"
                whileHover={{ scale: 1.05 }}
              >
                IKLAVYA
              </motion.span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href
                return (
                  <Link key={link.href} href={link.href}>
                    <motion.div
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-purple-500/15 text-purple-300'
                          : 'text-white/40 hover:text-white/70 hover:bg-white/[0.03]'
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <link.icon size={14} />
                      {link.label}
                    </motion.div>
                  </Link>
                )
              })}
            </div>

            {/* CTA + Mobile Menu Toggle */}
            <div className="flex items-center gap-3">
              <Link href="/ai-interview">
                <motion.button
                  className="hidden sm:block px-4 py-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500
                    text-white text-xs font-semibold hover:shadow-[0_0_15px_rgba(139,92,246,0.3)] transition-shadow"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Start Interview
                </motion.button>
              </Link>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden w-9 h-9 rounded-lg glass flex items-center justify-center text-white/60"
              >
                {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-16 inset-x-0 z-40 bg-[#030014]/95 backdrop-blur-xl border-b border-white/5 lg:hidden"
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
                      className={`flex flex-col items-center gap-1.5 p-3 rounded-xl text-center transition-all ${
                        isActive
                          ? 'bg-purple-500/15 text-purple-300'
                          : 'text-white/40 hover:bg-white/[0.03]'
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
