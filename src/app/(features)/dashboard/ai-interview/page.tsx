import type { Metadata } from 'next'
import AIInterviewPage from './components/AIInterviewPage'

export const metadata: Metadata = {
  title: 'AI Interview — IKLAVYA',
  description: 'Practice mock interviews with AI and get detailed performance analysis',
}

export default function Page() {
  return <AIInterviewPage />
}
