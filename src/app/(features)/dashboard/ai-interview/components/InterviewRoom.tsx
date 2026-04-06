'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, MicOff, SkipForward, PhoneOff, Clock, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { useVoicePipeline } from '../hooks/useVoicePipeline'
import { useTTSPlayer } from '../hooks/useTTSPlayer'

interface TranscriptEntry {
  role: 'interviewer' | 'candidate'
  text: string
}

const FILLER_WORDS = [
  'um', 'uh', 'hmm', 'like', 'you know', 'basically', 'actually',
  'literally', 'right', 'so yeah', 'i mean', 'kind of', 'sort of',
]

function countFillers(text: string): number {
  const lower = text.toLowerCase()
  let count = 0
  for (const filler of FILLER_WORDS) {
    const regex = new RegExp(`\\b${filler}\\b`, 'gi')
    const matches = lower.match(regex)
    if (matches) count += matches.length
  }
  return count
}

function highlightFillers(text: string): React.ReactNode[] {
  // Build a regex matching any filler word
  const pattern = FILLER_WORDS.map((f) => `\\b${f}\\b`).join('|')
  const regex = new RegExp(`(${pattern})`, 'gi')
  const parts = text.split(regex)

  return parts.map((part, i) => {
    const isMatch = FILLER_WORDS.some(
      (f) => part.toLowerCase() === f.toLowerCase()
    )
    if (isMatch) {
      return (
        <span key={i} className="text-red-500 bg-red-50 rounded px-0.5 font-medium">
          {part}
        </span>
      )
    }
    return <span key={i}>{part}</span>
  })
}

interface InterviewRoomProps {
  sessionId: string
  onInterviewEnd: () => void
}

export default function InterviewRoom({ sessionId, onInterviewEnd }: InterviewRoomProps) {
  const [currentQuestion, setCurrentQuestion] = useState('')
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([])
  const [questionNumber, setQuestionNumber] = useState(0)
  const [estimatedTotal, setEstimatedTotal] = useState(8)
  const [isAISpeaking, setIsAISpeaking] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [fillerCount, setFillerCount] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [started, setStarted] = useState(false)
  const [waitingForAI, setWaitingForAI] = useState(false)
  const [textInput, setTextInput] = useState('')

  const transcriptEndRef = useRef<HTMLDivElement>(null)
  const elapsedTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const submitAnswerRef = useRef<(text: string) => void>(() => {})

  const { speak, isSpeaking, stop: stopTTS } = useTTSPlayer()

  const handleSilence = useCallback(() => {
    // Auto-submit on silence — submitAnswerRef is set later
    submitAnswerRef.current?.('')
  }, [])

  const {
    startListening,
    stopListening,
    interimTranscript,
    finalTranscript,
    isListening,
    isSupported,
    resetTranscript,
  } = useVoicePipeline({ onSilence: handleSilence, silenceTimeout: 3000 })

  // Scroll transcript to bottom
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [transcript, interimTranscript])

  // Elapsed timer
  useEffect(() => {
    elapsedTimerRef.current = setInterval(() => {
      setElapsed((prev) => prev + 1)
    }, 1000)
    return () => {
      if (elapsedTimerRef.current) clearInterval(elapsedTimerRef.current)
    }
  }, [])

  // Sync TTS speaking state
  useEffect(() => {
    setIsAISpeaking(isSpeaking)
  }, [isSpeaking])

  // Parse SSE stream — handles named events (event: xxx\ndata: yyy)
  const parseSSE = useCallback(
    async (
      response: Response,
      callbacks: {
        onTextChunk?: (text: string) => void
        onMeta?: (meta: Record<string, unknown>) => void
        onFillers?: (fillers: Array<{ word: string; count: number }>) => void
        onInterviewComplete?: () => void
        onDone?: () => void
      }
    ) => {
      const reader = response.body?.getReader()
      if (!reader) return

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
              callbacks.onDone?.()
              currentEvent = ''
              continue
            }
            try {
              const data = JSON.parse(dataStr)
              switch (currentEvent) {
                case 'message':
                  callbacks.onTextChunk?.(data.text || '')
                  break
                case 'meta':
                  callbacks.onMeta?.(data)
                  break
                case 'fillers':
                  callbacks.onFillers?.(data.fillers || [])
                  break
                case 'interview_complete':
                  callbacks.onInterviewComplete?.()
                  break
                case 'error':
                  console.error('SSE error:', data.error)
                  break
                default:
                  // No named event — try to extract text
                  if (data.text) callbacks.onTextChunk?.(data.text)
                  break
              }
            } catch {
              // Non-JSON data line, skip
            }
            currentEvent = ''
          } else if (line.trim() === '') {
            currentEvent = ''
          }
        }
      }
    },
    []
  )

  // Start interview — fetch first question
  useEffect(() => {
    if (started) return
    setStarted(true)
    setWaitingForAI(true)

    async function startInterview() {
      try {
        const res = await fetch(`/api/interview/sessions/${sessionId}/start`, {
          method: 'POST',
        })

        if (!res.ok) {
          toast.error('Failed to start interview')
          return
        }

        let questionText = ''

        await parseSSE(res, {
          onTextChunk: (text) => {
            questionText += text
            setCurrentQuestion(questionText)
          },
          onMeta: (meta) => {
            if (meta.question_number) setQuestionNumber(meta.question_number as number)
            if (meta.estimated_remaining != null) {
              setEstimatedTotal((meta.question_number as number) + (meta.estimated_remaining as number))
            }
          },
        })

        if (questionText) {
          setQuestionNumber((prev) => prev || 1)
          setTranscript((prev) => [...prev, { role: 'interviewer', text: questionText }])
          setWaitingForAI(false)

          // Speak the question
          setIsAISpeaking(true)
          await speak(questionText)
          setIsAISpeaking(false)

          // Auto-start mic after TTS
          if (isSupported) {
            startListening()
          }
        }
      } catch {
        toast.error('Failed to start interview')
      }
    }

    startInterview()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Submit candidate answer and get next question
  const submitAnswer = useCallback(
    async (answerText?: string) => {
      // If called from silence handler with no arg, grab current transcript
      const text = answerText || (finalTranscript + ' ' + interimTranscript).trim()
      if (!text || isProcessing) return

      setIsProcessing(true)
      stopListening()
      resetTranscript()

      // Count fillers in this answer
      const newFillers = countFillers(text)
      setFillerCount((prev) => prev + newFillers)

      // Add candidate entry to transcript
      setTranscript((prev) => [...prev, { role: 'candidate', text }])

      setWaitingForAI(true)
      setCurrentQuestion('')

      try {
        const res = await fetch(`/api/interview/sessions/${sessionId}/message`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: text }),
        })

        if (!res.ok) {
          toast.error('Failed to send answer')
          setIsProcessing(false)
          setWaitingForAI(false)
          return
        }

        let questionText = ''
        let interviewDone = false

        await parseSSE(res, {
          onTextChunk: (chunk) => {
            questionText += chunk
            setCurrentQuestion(questionText)
          },
          onMeta: (meta) => {
            if (meta.question_number) setQuestionNumber(meta.question_number as number)
            if (meta.estimated_remaining != null) {
              setEstimatedTotal((meta.question_number as number) + (meta.estimated_remaining as number))
            }
          },
          onFillers: (fillers) => {
            const serverCount = fillers.reduce((sum, f) => sum + f.count, 0)
            if (serverCount > newFillers) {
              setFillerCount((prev) => prev + (serverCount - newFillers))
            }
          },
          onInterviewComplete: () => {
            interviewDone = true
          },
        })

        if (interviewDone) {
          onInterviewEnd()
          return
        }

        if (questionText) {
          setTranscript((prev) => [...prev, { role: 'interviewer', text: questionText }])
          setWaitingForAI(false)

          // Speak next question
          setIsAISpeaking(true)
          await speak(questionText)
          setIsAISpeaking(false)

          // Auto-start mic
          if (isSupported) {
            startListening()
          }
        }
      } catch {
        toast.error('Something went wrong')
      } finally {
        setIsProcessing(false)
      }
    },
    [
      isProcessing, stopListening, resetTranscript, sessionId, finalTranscript,
      interimTranscript, parseSSE, speak, isSupported, startListening, onInterviewEnd,
    ]
  )

  // Wire up silence handler ref so handleSilence can call submitAnswer
  useEffect(() => {
    submitAnswerRef.current = submitAnswer
  }, [submitAnswer])

  // Handle "Next" click
  function handleNext() {
    const voiceText = (finalTranscript + ' ' + interimTranscript).trim()
    const text = voiceText || textInput.trim()
    if (text) {
      setTextInput('')
      submitAnswer(text)
    } else {
      toast.error('Please answer the question before continuing')
    }
  }

  // Handle text input submit (for unsupported browsers)
  function handleTextSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (textInput.trim()) {
      submitAnswer(textInput.trim())
      setTextInput('')
    }
  }

  // Handle mic toggle
  function handleMicToggle() {
    if (isListening) {
      stopListening()
    } else {
      startListening()
    }
  }

  // Handle end interview
  async function handleEndInterview() {
    stopListening()
    stopTTS()

    try {
      await fetch(`/api/interview/sessions/${sessionId}/end`, {
        method: 'POST',
      })
    } catch {
      // proceed anyway
    }

    onInterviewEnd()
  }

  // Format elapsed time
  const minutes = Math.floor(elapsed / 60)
  const seconds = elapsed % 60
  const timeStr = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`

  const progress = estimatedTotal > 0 ? (questionNumber / estimatedTotal) * 100 : 0

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left — Main Interview Area */}
        <div className="lg:col-span-2 space-y-4">
          {/* Progress Bar */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="font-medium text-gray-700">
                Question {questionNumber} of ~{estimatedTotal}
              </span>
              <span className="text-gray-400 text-xs">
                {Math.round(progress)}% complete
              </span>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-green-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(progress, 100)}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </div>
          </div>

          {/* AI Question Card */}
          <motion.div
            className={`bg-white rounded-xl border-2 p-6 shadow-sm min-h-[160px] flex items-center justify-center transition-colors ${
              isAISpeaking
                ? 'border-indigo-400 shadow-indigo-100'
                : 'border-gray-200'
            }`}
            animate={
              isAISpeaking
                ? { borderColor: ['#818cf8', '#6366f1', '#818cf8'] }
                : { borderColor: '#e5e7eb' }
            }
            transition={
              isAISpeaking
                ? { duration: 1.5, repeat: Infinity, ease: 'easeInOut' }
                : { duration: 0.3 }
            }
          >
            {waitingForAI && !currentQuestion ? (
              <div className="flex items-center gap-3 text-gray-400">
                <div className="flex gap-1">
                  <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <span className="text-sm">AI is thinking...</span>
              </div>
            ) : (
              <p className="text-gray-800 text-base leading-relaxed">
                {currentQuestion}
              </p>
            )}
          </motion.div>

          {/* Controls Row */}
          <div className="flex items-center justify-center gap-4">
            {/* Mic Button */}
            {!isSupported ? (
              <div className="text-xs text-amber-500 flex items-center gap-1">
                <AlertCircle size={12} />
                Voice not supported — type your answers below
              </div>
            ) : (
              <button
                onClick={handleMicToggle}
                disabled={isAISpeaking || isProcessing}
                className={`w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-lg disabled:opacity-50 ${
                  isListening
                    ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-600'
                }`}
              >
                {isListening ? <Mic size={24} /> : <MicOff size={24} />}
              </button>
            )}

            {/* Next Button */}
            <button
              onClick={handleNext}
              disabled={isAISpeaking || isProcessing || waitingForAI}
              className="flex items-center gap-2 px-5 py-3 rounded-lg bg-green-800 text-white text-sm font-medium hover:bg-green-900 transition-colors disabled:opacity-50"
            >
              <SkipForward size={16} />
              Next
            </button>

            {/* End Interview */}
            <button
              onClick={handleEndInterview}
              className="flex items-center gap-2 px-5 py-3 rounded-lg bg-gray-100 text-gray-700 text-sm font-medium hover:bg-red-50 hover:text-red-700 transition-colors"
            >
              <PhoneOff size={16} />
              End Interview
            </button>
          </div>

          {/* Text input fallback for unsupported browsers */}
          {!isSupported && (
            <form onSubmit={handleTextSubmit} className="flex gap-2">
              <input
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Type your answer here..."
                disabled={isAISpeaking || isProcessing || waitingForAI}
                className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!textInput.trim() || isAISpeaking || isProcessing || waitingForAI}
                className="px-4 py-2.5 rounded-lg bg-green-800 text-white text-sm font-medium hover:bg-green-900 disabled:opacity-50"
              >
                Send
              </button>
            </form>
          )}

          {/* Current input indicator */}
          {isListening && (
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-gray-50 rounded-lg border border-gray-200 px-4 py-3"
              >
                <p className="text-xs text-gray-400 mb-1">Your answer (live):</p>
                <p className="text-sm text-gray-700 min-h-[20px]">
                  {finalTranscript}
                  {interimTranscript && (
                    <span className="text-gray-400"> {interimTranscript}</span>
                  )}
                  {!finalTranscript && !interimTranscript && (
                    <span className="text-gray-300 italic">Listening...</span>
                  )}
                </p>
              </motion.div>
            </AnimatePresence>
          )}
        </div>

        {/* Right — Sidebar */}
        <div className="space-y-4">
          {/* Timer */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm flex items-center gap-3">
            <Clock size={18} className="text-gray-400" />
            <div>
              <p className="text-xs text-gray-400">Elapsed</p>
              <p className="text-lg font-mono font-bold text-gray-900">{timeStr}</p>
            </div>
          </div>

          {/* Filler Counter */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
              fillerCount > 10
                ? 'bg-red-100 text-red-600'
                : fillerCount > 5
                  ? 'bg-amber-100 text-amber-600'
                  : 'bg-green-100 text-green-600'
            }`}>
              {fillerCount}
            </div>
            <div>
              <p className="text-xs text-gray-400">Filler Words</p>
              <p className="text-xs text-gray-500">
                {fillerCount === 0 ? 'Great job!' : fillerCount <= 5 ? 'Doing well' : 'Try to reduce'}
              </p>
            </div>
          </div>

          {/* Transcript */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col" style={{ maxHeight: '500px' }}>
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="text-sm font-semibold text-gray-700">Transcript</p>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {transcript.length === 0 && !isListening && (
                <p className="text-xs text-gray-300 text-center py-4">
                  Conversation will appear here...
                </p>
              )}

              {transcript.map((entry, i) => (
                <div key={i} className={`text-sm leading-relaxed ${
                  entry.role === 'interviewer' ? 'text-indigo-700' : 'text-gray-600'
                }`}>
                  <span className={`text-[10px] font-semibold uppercase tracking-wide block mb-0.5 ${
                    entry.role === 'interviewer' ? 'text-indigo-400' : 'text-gray-400'
                  }`}>
                    {entry.role === 'interviewer' ? 'Interviewer' : 'You'}
                  </span>
                  <p>
                    {entry.role === 'candidate'
                      ? highlightFillers(entry.text)
                      : entry.text}
                  </p>
                </div>
              ))}

              {/* Live interim during recording */}
              {isListening && (finalTranscript || interimTranscript) && (
                <div className="text-sm text-gray-400">
                  <span className="text-[10px] font-semibold uppercase tracking-wide block mb-0.5 text-gray-300">
                    You (speaking...)
                  </span>
                  <p>
                    {finalTranscript}
                    {interimTranscript && (
                      <span className="opacity-60"> {interimTranscript}</span>
                    )}
                  </p>
                </div>
              )}

              <div ref={transcriptEndRef} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
