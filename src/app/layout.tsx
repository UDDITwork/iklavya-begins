import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import Navbar from '@/components/ui/Navbar'
import ChatBot from '@/components/ui/ChatBot'
import AuthProvider from '@/components/providers/AuthProvider'

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
})

const SITE_URL = 'https://iklavya.in'
const SITE_NAME = 'IKLAVYA'
const DEFAULT_DESCRIPTION =
  'AI-powered career readiness platform for students — mock interviews, resume builder, skill assessments, video courses, certifications & career guidance.'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'IKLAVYA — AI-Powered Career Readiness for Students',
    template: '%s | IKLAVYA',
  },
  description: DEFAULT_DESCRIPTION,
  keywords: [
    'career readiness',
    'AI mock interview',
    'resume builder',
    'skill assessment',
    'online courses',
    'certifications',
    'career guidance',
    'student placement',
    'job preparation',
    'soft skills training',
    'campus hiring',
    'employability platform',
  ],
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: SITE_URL,
    siteName: SITE_NAME,
    title: 'IKLAVYA — AI-Powered Career Readiness for Students',
    description: DEFAULT_DESCRIPTION,
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'IKLAVYA — AI-Powered Career Readiness Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'IKLAVYA — AI-Powered Career Readiness for Students',
    description: DEFAULT_DESCRIPTION,
    images: ['/og-image.png'],
  },
  icons: {
    icon: [
      { url: 'https://img.icons8.com/parakeet/48/teacher.png', sizes: '48x48', type: 'image/png' },
      { url: 'https://img.icons8.com/parakeet/192/teacher.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: 'https://img.icons8.com/parakeet/192/teacher.png',
  },
  manifest: '/manifest.json',
  alternates: {
    canonical: SITE_URL,
  },
}

export const viewport: Viewport = {
  themeColor: '#111827',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: SITE_NAME,
              url: SITE_URL,
              logo: `${SITE_URL}/iklavya logo.png`,
              description: DEFAULT_DESCRIPTION,
              sameAs: [
                'https://twitter.com/iklavya',
                'https://linkedin.com/company/iklavya',
                'https://instagram.com/iklavya',
              ],
              contactPoint: {
                '@type': 'ContactPoint',
                email: 'contact@iklavya.in',
                contactType: 'customer support',
              },
            }),
          }}
        />
      </head>
      <body
        className={`${inter.variable} antialiased bg-white text-gray-900`}
      >
        <AuthProvider>
          <Navbar />
          <main className="pt-16">{children}</main>
          <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
          <ChatBot />
        </AuthProvider>
      </body>
    </html>
  )
}
