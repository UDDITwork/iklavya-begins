'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function CareerGuidanceRedirect() {
  const router = useRouter()
  useEffect(() => {
    router.replace('/dashboard/career-guidance')
  }, [router])
  return null
}
