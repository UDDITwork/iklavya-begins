import CertificateQR from '@/components/assessment/CertificateQR'
import CertificateView from './CertificateView'

const API_URL = process.env.API_URL!

interface CertData {
  student_name: string
  student_email: string
  college: string
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

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Download button wrapper (client component) */}
        <CertificateView cert={cert}>
          {/* Certificate */}
          <div className="aspect-[1.414/1] w-full bg-white border-2 border-gray-200 shadow-xl rounded-lg overflow-hidden relative">
            {/* Decorative border frame */}
            <div className="absolute inset-4 border-2 border-green-200 rounded-lg pointer-events-none" />
            <div className="absolute inset-6 border border-green-100 rounded-lg pointer-events-none" />

            {/* Corner ornaments */}
            <div className="absolute top-4 left-4 w-16 h-16 border-t-4 border-l-4 border-green-600 rounded-tl-lg" />
            <div className="absolute top-4 right-4 w-16 h-16 border-t-4 border-r-4 border-green-600 rounded-tr-lg" />
            <div className="absolute bottom-4 left-4 w-16 h-16 border-b-4 border-l-4 border-green-600 rounded-bl-lg" />
            <div className="absolute bottom-4 right-4 w-16 h-16 border-b-4 border-r-4 border-green-600 rounded-br-lg" />

            <div className="relative h-full flex flex-col items-center justify-between py-12 px-16">
              {/* Top Section */}
              <div className="text-center space-y-3">
                <div className="flex items-center justify-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-emerald-700 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-lg">I</span>
                  </div>
                  <h1 className="text-3xl font-extrabold tracking-wider text-green-800">IKLAVYA</h1>
                </div>
                <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-green-500 to-transparent mx-auto" />
                <h2 className="text-xl md:text-2xl font-serif text-gray-600 tracking-widest uppercase">
                  Certificate of Completion
                </h2>
              </div>

              {/* Middle Section */}
              <div className="text-center space-y-5 max-w-2xl">
                <p className="text-sm text-gray-500 tracking-wide">This is to certify that</p>
                <h3 className="text-3xl md:text-4xl font-bold text-gray-900 font-serif border-b-2 border-green-200 pb-2 inline-block">
                  {cert.student_name}
                </h3>
                {cert.college && (
                  <p className="text-sm text-gray-500">{cert.college}</p>
                )}
                <p className="text-sm text-gray-500 tracking-wide">has successfully completed</p>
                <h4 className="text-xl md:text-2xl font-bold text-green-800">
                  {cert.module_title}
                </h4>
                <p className="text-sm text-gray-400">{cert.module_category}</p>

                <div className="flex items-center justify-center gap-8 pt-2">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-800">{cert.score}/{cert.total}</p>
                    <p className="text-xs text-gray-400 uppercase tracking-wider">Score</p>
                  </div>
                  <div className="w-px h-10 bg-gray-200" />
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-700">{cert.grade}</p>
                    <p className="text-xs text-gray-400 uppercase tracking-wider">Grade</p>
                  </div>
                </div>
              </div>

              {/* Bottom Section */}
              <div className="w-full flex items-end justify-between">
                <div className="text-center space-y-1">
                  <div className="w-32 h-px bg-gray-300" />
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
                </div>

                <div className="flex flex-col items-center gap-1">
                  <CertificateQR url={cert.cert_url} />
                  <p className="text-[9px] text-gray-300">Scan to verify</p>
                </div>
              </div>
            </div>
          </div>
        </CertificateView>
      </div>
    </div>
  )
}
