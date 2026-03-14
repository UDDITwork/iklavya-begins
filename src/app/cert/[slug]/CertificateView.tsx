'use client'

import { useRef } from 'react'
import CertificateDownload from '@/components/assessment/CertificateDownload'

interface CertificateViewProps {
  cert: { student_name: string; cert_number: string }
  children: React.ReactNode
}

export default function CertificateView({ cert, children }: CertificateViewProps) {
  const certRef = useRef<HTMLDivElement>(null)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Certificate Verification</h1>
          <p className="text-sm text-gray-500">
            This certificate was issued to {cert.student_name}
          </p>
        </div>
        <CertificateDownload
          certRef={certRef}
          fileName={`iklavya-cert-${cert.cert_number}`}
        />
      </div>
      <div ref={certRef}>
        {children}
      </div>
    </div>
  )
}
