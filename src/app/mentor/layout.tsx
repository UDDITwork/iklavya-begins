'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { LogOut } from 'lucide-react'
import { Toaster } from 'react-hot-toast'

export default function MentorLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()

  async function handleLogout() {
    try {
      await fetch('/api/mentor/logout', { method: 'POST' })
      toast.success('Logged out successfully')
      router.push('/mentor/login')
    } catch {
      toast.error('Failed to log out')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-center" />
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <Link href="/mentor/dashboard" className="flex items-center gap-2">
            <span className="text-xl font-bold text-gray-900 tracking-tight">IKLAVYA</span>
            <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
              Mentor Portal
            </span>
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}
