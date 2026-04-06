'use client'

import { useState, useCallback } from 'react'
import SessionList from './SessionList'
import SetupForm from './SetupForm'
import InterviewRoom from './InterviewRoom'
import AnalyzingScreen from './AnalyzingScreen'
import ReportView from './ReportView'

type Phase = 'list' | 'setup' | 'interview' | 'analyzing' | 'report'

export default function AIInterviewPage() {
  const [phase, setPhase] = useState<Phase>('list')
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)
  const [reportData, setReportData] = useState<Record<string, unknown> | null>(null)

  const goToSetup = useCallback(() => {
    setCurrentSessionId(null)
    setReportData(null)
    setPhase('setup')
  }, [])

  const goToList = useCallback(() => {
    setCurrentSessionId(null)
    setReportData(null)
    setPhase('list')
  }, [])

  const startInterview = useCallback((sessionId: string) => {
    setCurrentSessionId(sessionId)
    setPhase('interview')
  }, [])

  const goToAnalyzing = useCallback(() => {
    setPhase('analyzing')
  }, [])

  const showReport = useCallback((data: Record<string, unknown>) => {
    setReportData(data)
    setPhase('report')
  }, [])

  const viewExistingReport = useCallback((sessionId: string, data: Record<string, unknown>) => {
    setCurrentSessionId(sessionId)
    setReportData(data)
    setPhase('report')
  }, [])

  return (
    <div className="min-h-screen">
      {phase === 'list' && (
        <SessionList
          onNewInterview={goToSetup}
          onViewReport={viewExistingReport}
        />
      )}

      {phase === 'setup' && (
        <SetupForm
          onStart={startInterview}
          onBack={goToList}
        />
      )}

      {phase === 'interview' && currentSessionId && (
        <InterviewRoom
          sessionId={currentSessionId}
          onInterviewEnd={goToAnalyzing}
        />
      )}

      {phase === 'analyzing' && currentSessionId && (
        <AnalyzingScreen
          sessionId={currentSessionId}
          onReportReady={showReport}
        />
      )}

      {phase === 'report' && reportData && (
        <ReportView
          sessionId={currentSessionId}
          reportData={reportData}
          onPracticeAgain={goToSetup}
          onBackToList={goToList}
        />
      )}
    </div>
  )
}
