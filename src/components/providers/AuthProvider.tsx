'use client'

import { useEffect } from 'react'
import { useAuthStore } from '@/store/auth-store'

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const { setUser } = useAuthStore()

  useEffect(() => {
    async function checkSession() {
      console.log('[AUTH] Checking session...')
      try {
        const res = await fetch('/api/auth/me', { credentials: 'same-origin' })
        console.log('[AUTH] /api/auth/me status:', res.status)
        if (res.ok) {
          const data = await res.json()
          console.log('[AUTH] Session valid, user:', data.user?.email)
          setUser(data.user)
        } else {
          console.log('[AUTH] Session invalid (not ok)')
          setUser(null)
        }
      } catch (err) {
        console.error('[AUTH] Session check error:', err)
        setUser(null)
      }
    }
    checkSession()
  }, [setUser])

  return <>{children}</>
}
