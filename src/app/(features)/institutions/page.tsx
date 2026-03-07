import type { Metadata } from 'next'
import InstitutionsPage from './PageClient'

export const metadata: Metadata = {
  title: 'For Institutions — AI-Powered Placement Infrastructure Partner',
  description:
    'Partner with IKLAVYA to strengthen placements, reputation & employer trust. AI-powered career readiness system for Indian colleges — structured student onboarding, placement cell support, employer connections & NAAC documentation.',
  keywords: [
    'college placement partner India', 'institutional placement support', 'AI placement infrastructure',
    'campus placement improvement', 'NAAC accreditation support', 'employer campus connect',
    'placement cell technology', 'student employability platform', 'IKLAVYA institutions',
    'college placement rates improvement',
  ],
  openGraph: {
    title: 'For Institutions — IKLAVYA Placement Infrastructure Partner',
    description:
      'India\'s AI-Powered Placement Infrastructure for Forward-Thinking Institutions. Strengthen placements, reputation & employer trust.',
    url: '/institutions',
  },
  alternates: { canonical: '/institutions' },
}

export default function Page() {
  return <InstitutionsPage />
}
