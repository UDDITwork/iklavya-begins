'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth-store'
import Sidebar from '@/components/dashboard/Sidebar'
import QuizBroadcastPopup from '@/components/dashboard/QuizBroadcastPopup'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isLoading } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/login')
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="w-6 h-6 border-2 border-gray-300 border-t-green-700 rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <Sidebar />
      <main className="flex-1 overflow-auto bg-[#F7F8FA]">
        {children}
      </main>
      <QuizBroadcastPopup />
    </div>
  )
}
