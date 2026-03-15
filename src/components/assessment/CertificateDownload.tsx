'use client'

import { useState, useRef, useCallback } from 'react'
import { toPng } from 'html-to-image'
import { jsPDF } from 'jspdf'
import { Download, Loader2 } from 'lucide-react'

interface CertificateDownloadProps {
  certRef: React.RefObject<HTMLDivElement | null>
  fileName?: string
}

export default function CertificateDownload({ certRef, fileName = 'iklavya-certificate' }: CertificateDownloadProps) {
  const [downloading, setDownloading] = useState(false)

  const handleDownload = useCallback(async () => {
    if (!certRef.current) return
    setDownloading(true)
    try {
      const dataUrl = await toPng(certRef.current, {
        quality: 1,
        pixelRatio: 3,
        backgroundColor: '#ffffff',
      })

      const img = new Image()
      img.src = dataUrl
      await new Promise<void>((resolve) => {
        img.onload = () => resolve()
      })

      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [img.width / 2, img.height / 2],
      })

      pdf.addImage(dataUrl, 'PNG', 0, 0, img.width / 2, img.height / 2)
      pdf.save(`${fileName}.pdf`)
    } catch (err) {
      console.error('Failed to generate PDF:', err)
    } finally {
      setDownloading(false)
    }
  }, [certRef, fileName])

  return (
    <button
      onClick={handleDownload}
      disabled={downloading}
      className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 shadow-sm"
    >
      {downloading ? (
        <Loader2 size={18} className="animate-spin" />
      ) : (
        <Download size={18} />
      )}
      Download PDF
    </button>
  )
}
