'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function ResumeBuilderRedirect() {
  const router = useRouter()
  useEffect(() => {
    router.replace('/dashboard/resume-builder')
  }, [router])
  return null
}
