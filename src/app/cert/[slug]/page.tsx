import CertificateQR from '@/components/assessment/CertificateQR'
import CertificateView from './CertificateView'

const API_URL = process.env.API_URL!

interface CertData {
  student_name: string
  student_email: string
  college: string
  profile_image?: string
  module_title: string
  module_category: string
  score: number
  total: number
  grade: string
  cert_number: string
  issued_date: string
  cert_url: string
}

async function getCertificate(slug: string): Promise<CertData | null> {
  try {
    const res = await fetch(`${API_URL}/certificates/public/${slug}`, { cache: 'force-cache' })
    if (!res.ok) return null
    const data = await res.json()
    return JSON.parse(data.cert_data_json) as CertData
  } catch {
    return null
  }
}

function getInitials(name: string) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

export default async function CertificatePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const cert = await getCertificate(slug)

  if (!cert) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-gray-900">Certificate Not Found</h1>
          <p className="text-gray-500">This certificate link is invalid or has expired.</p>
        </div>
      </div>
    )
  }

  const pct = Math.round((cert.score / cert.total) * 100)

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-[1200px] mx-auto space-y-6">
        <CertificateView cert={cert}>
          {/* Certificate — fixed dimensions for consistent PDF output */}
          <div className="overflow-x-auto">
            <div
              className="bg-white shadow-2xl relative mx-auto"
              style={{ width: '1100px', height: '780px' }}
            >
              {/* Top accent bar */}
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-green-700 via-emerald-600 to-green-700" />

              {/* Subtle inner border */}
              <div className="absolute inset-5 border border-gray-200 pointer-events-none" />

              {/* Content */}
              <div className="relative h-full flex flex-col items-center px-20 pt-14 pb-10">

                {/* Logo */}
                <div className="flex items-center gap-3 mb-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/iklavya logo.png"
                    alt="IKLAVYA"
                    style={{ height: '48px', width: 'auto' }}
                    crossOrigin="anonymous"
                  />
                </div>

                {/* Divider */}
                <div className="w-48 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent mb-4" />

                {/* Title */}
                <h2 className="text-2xl tracking-[0.3em] text-gray-500 uppercase font-light mb-8" style={{ fontFamily: 'Georgia, serif' }}>
                  Certificate of Completion
                </h2>

                {/* Certification text */}
                <p className="text-sm text-gray-400 tracking-widest uppercase mb-5">This is to certify that</p>

                {/* User photo + Name */}
                <div className="flex flex-col items-center mb-3">
                  {cert.profile_image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={cert.profile_image}
                      alt={cert.student_name}
                      className="rounded-full border-2 border-green-200 mb-4"
                      style={{ width: '72px', height: '72px', objectFit: 'cover' }}
                      crossOrigin="anonymous"
                    />
                  ) : (
                    <div
                      className="rounded-full bg-gradient-to-br from-green-600 to-emerald-700 flex items-center justify-center text-white font-bold text-2xl border-2 border-green-200 mb-4"
                      style={{ width: '72px', height: '72px' }}
                    >
                      {getInitials(cert.student_name)}
                    </div>
                  )}
                  <h3 className="text-4xl font-bold text-gray-900" style={{ fontFamily: 'Georgia, serif' }}>
                    {cert.student_name}
                  </h3>
                  <div className="w-56 h-0.5 bg-gradient-to-r from-transparent via-green-500 to-transparent mt-2 mb-1" />
                  {cert.college && (
                    <p className="text-sm text-gray-400">{cert.college}</p>
                  )}
                </div>

                {/* Module info */}
                <p className="text-sm text-gray-400 mt-4 mb-2">has successfully completed the assessment</p>
                <h4 className="text-xl font-bold text-green-800 text-center mb-1" style={{ fontFamily: 'Georgia, serif' }}>
                  {cert.module_title}
                </h4>
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-6">{cert.module_category}</p>

                {/* Score and Grade */}
                <div className="flex items-center gap-12 mb-auto">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-gray-800">{cert.score}<span className="text-lg text-gray-400 font-normal">/{cert.total}</span></p>
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">Score</p>
                  </div>
                  <div className="w-px h-12 bg-gray-200" />
                  <div className="text-center">
                    <p className="text-3xl font-bold text-green-700">{cert.grade}</p>
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">Grade</p>
                  </div>
                  <div className="w-px h-12 bg-gray-200" />
                  <div className="text-center">
                    <p className="text-3xl font-bold text-gray-700">{pct}%</p>
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">Percentile</p>
                  </div>
                </div>

                {/* Bottom footer */}
                <div className="w-full flex items-end justify-between mt-4">
                  <div className="text-left">
                    <div className="w-36 h-px bg-gray-300 mb-2" />
                    <p className="text-xs text-gray-400">
                      Issued: {new Date(cert.issued_date).toLocaleDateString('en-US', {
                        year: 'numeric', month: 'long', day: 'numeric'
                      })}
                    </p>
                  </div>

                  <div className="text-center">
                    <p className="text-[10px] text-gray-300 tracking-wider">
                      Certificate No: {cert.cert_number}
                    </p>
                    <p className="text-[9px] text-gray-300 mt-0.5">iklavya.in</p>
                  </div>

                  <div className="flex flex-col items-center">
                    <CertificateQR url={cert.cert_url} />
                    <p className="text-[9px] text-gray-300 mt-1">Scan to verify</p>
                  </div>
                </div>
              </div>

              {/* Bottom accent bar */}
              <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-green-700 via-emerald-600 to-green-700" />
            </div>
          </div>
        </CertificateView>
      </div>
    </div>
  )
}
