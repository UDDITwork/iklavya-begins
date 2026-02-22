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
      try {
        const res = await fetch('/api/auth/me')
        if (res.ok) {
          const data = await res.json()
          setUser(data.user)
        } else {
          setUser(null)
        }
      } catch {
        setUser(null)
      }
    }
    checkSession()
  }, [setUser])

  return <>{children}</>
}
