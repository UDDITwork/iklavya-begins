'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

interface AnalyzingScreenProps {
  sessionId: string
  onReportReady: (reportData: Record<string, unknown>) => void
}

const STATUS_MESSAGES = [
  'Analyzing transcript...',
  'Evaluating responses...',
  'Building performance report...',
  'Generating improvement plan...',
  'Finalizing...',
]

export default function AnalyzingScreen({ sessionId, onReportReady }: AnalyzingScreenProps) {
  const [progress, setProgress] = useState(0)
  const [statusText, setStatusText] = useState(STATUS_MESSAGES[0])
  const [failed, setFailed] = useState(false)
  const hasStarted = useRef(false)

  useEffect(() => {
    if (hasStarted.current) return
    hasStarted.current = true

    generateReport()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function generateReport() {
    try {
      const res = await fetch(`/api/interview/sessions/${sessionId}/generate-report`, {
        method: 'POST',
      })

      if (!res.ok) {
        toast.error('Failed to generate report')
        return
      }

      const reader = res.body?.getReader()
      if (!reader) {
        toast.error('Streaming not supported')
        return
      }

      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        let currentEvent = ''
        for (const line of lines) {
          if (line.startsWith('event: ')) {
            currentEvent = line.slice(7).trim()
          } else if (line.startsWith('data: ')) {
            const dataStr = line.slice(6).trim()
            if (dataStr === '{}' && currentEvent === 'done') {
              currentEvent = ''
              continue
            }

            try {
              const data = JSON.parse(dataStr)

              if (currentEvent === 'progress') {
                const pct = data.percent ?? 0
                setProgress(pct)
                if (data.status) setStatusText(data.status)
                else if (pct < 20) setStatusText(STATUS_MESSAGES[0])
                else if (pct < 45) setStatusText(STATUS_MESSAGES[1])
                else if (pct < 70) setStatusText(STATUS_MESSAGES[2])
                else if (pct < 90) setStatusText(STATUS_MESSAGES[3])
                else setStatusText(STATUS_MESSAGES[4])
              }

              if (currentEvent === 'report') {
                setProgress(100)
                setStatusText('Complete!')
                // Transition to report view
                try {
                  onReportReady(data)
                } catch {
                  // If report data is bad, try fallback
                  await fetchReportFallback()
                }
                return
              }

              if (currentEvent === 'error') {
                toast.error(data.error || 'Analysis failed')
              }
            } catch {
              // non-JSON, skip
            }
            currentEvent = ''
          } else if (line.trim() === '') {
            currentEvent = ''
          }
        }
      }

      // If we reached here without a report event, try fetching the report directly
      await fetchReportFallback()
    } catch {
      // SSE stream failed — try direct fetch as last resort
      await fetchReportFallback()
    }
  }

  async function fetchReportFallback() {
    try {
      const reportRes = await fetch(`/api/interview/sessions/${sessionId}/report`)
      if (reportRes.ok) {
        const raw = await reportRes.json()
        // report_json may be a string (from DB) — parse it
        const reportData = raw.report_json
          ? (typeof raw.report_json === 'string' ? JSON.parse(raw.report_json) : raw.report_json)
          : raw
        setProgress(100)
        setStatusText('Complete!')
        onReportReady(reportData)
      } else {
        setStatusText('Failed — please try again')
        setFailed(true)
        toast.error('Report generation failed. Go back and try again.')
      }
    } catch {
      setStatusText('Failed — please try again')
      setFailed(true)
      toast.error('Could not load report.')
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[60vh] p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        className="bg-white rounded-2xl border border-gray-200 shadow-sm p-10 max-w-md w-full text-center"
      >
        {/* Animated Loader */}
        <div className="flex items-center justify-center mb-6">
          <motion.div
            className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          >
            <Loader2 size={28} className="text-green-700" />
          </motion.div>
        </div>

        <h2 className="text-lg font-bold text-gray-900 mb-2">
          Analyzing your interview...
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          Our AI is reviewing your responses and building a detailed report.
        </p>

        {/* Progress Bar */}
        <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden mb-3">
          <motion.div
            className="h-full bg-green-700 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-500">{statusText}</span>
          <span className="text-gray-400 font-mono">{progress}%</span>
        </div>

        {failed && (
          <button
            onClick={() => {
              setFailed(false)
              setProgress(0)
              setStatusText(STATUS_MESSAGES[0])
              hasStarted.current = false
              generateReport()
            }}
            className="mt-4 px-4 py-2 rounded-lg bg-green-800 text-white text-sm font-medium hover:bg-green-900 transition-colors"
          >
            Retry
          </button>
        )}
      </motion.div>
    </div>
  )
}
