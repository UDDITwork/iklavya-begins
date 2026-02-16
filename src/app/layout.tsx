import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import Navbar from '@/components/ui/Navbar'
import AuthProvider from '@/components/providers/AuthProvider'

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'IKLAVYA - Student Career Readiness Portal',
  description:
    'AI-powered career readiness platform with interview simulation, courses, resume building, skill assessment, and career guidance.',
  keywords: [
    'career readiness',
    'AI interview',
    'resume builder',
    'skill assessment',
    'online courses',
    'certifications',
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} antialiased bg-white text-gray-900`}
      >
        <AuthProvider>
          <Navbar />
          <main className="pt-16">{children}</main>
          <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
        </AuthProvider>
      </body>
    </html>
  )
}
