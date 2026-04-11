import type { Metadata } from 'next'
import { Suspense } from 'react'
import LiveQuizPage from './PageClient'

export const metadata: Metadata = {
  title: 'Live Quiz Arena',
  description:
    'Compete in real-time quiz competitions on IKLAVYA. Test your knowledge, climb the leaderboard, and win badges in gamified learning battles.',
  keywords: ['live quiz', 'quiz competition', 'gamified learning', 'online quiz', 'leaderboard'],
  openGraph: {
    title: 'Live Quiz Arena — IKLAVYA',
    description: 'Compete in real-time quiz battles and climb the leaderboard.',
    url: '/live-quiz',
  },
  alternates: { canonical: '/live-quiz' },
}

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center"><div className="w-6 h-6 border-2 border-gray-300 border-t-violet-600 rounded-full animate-spin" /></div>}>
      <LiveQuizPage />
    </Suspense>
  )
}
