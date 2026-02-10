import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/ui/Navbar'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
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
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#030014] text-white`}
      >
        <Navbar />
        <main className="pt-16">{children}</main>
      </body>
    </html>
  )
}
