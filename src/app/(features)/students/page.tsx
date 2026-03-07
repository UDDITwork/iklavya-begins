import type { Metadata } from 'next'
import StudentsPage from './PageClient'

export const metadata: Metadata = {
  title: 'For Students — AI Career Readiness System',
  description:
    'From Educated to Employed — India\'s Own AI Career System built for Indian students. AI-powered interview preparation, ATS resume creation, skill-to-job matchmaking, and assured placement pathway to 150+ employers.',
  keywords: [
    'student career readiness', 'AI interview preparation India', 'ATS resume builder',
    'campus placement preparation', 'job readiness platform', 'IKLAVYA students',
    'AI career guidance', 'skill assessment India', 'employability platform',
  ],
  openGraph: {
    title: 'For Students — IKLAVYA AI Career Readiness',
    description:
      'India\'s Own AI Career System — built for Indian students, designed for Indian employers. Interview prep, resume building, skill matching & placement access.',
    url: '/students',
  },
  alternates: { canonical: '/students' },
}

export default function Page() {
  return <StudentsPage />
}
