'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Mic, MicOff, PhoneOff, Video, VideoOff,
  Volume2, VolumeX, ChevronDown, Clock, AlertTriangle,
  MessageSquare, BarChart3, Send,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useVoicePipeline } from '../hooks/useVoicePipeline'
import { useTTSPlayer } from '../hooks/useTTSPlayer'
import STARTracker from './STARTracker'

// Dynamic Atmosphere — mood-based color system
function getMood(fillerCount: number, questionNumber: number): { bg: string; globeGlow: string; label: string } {
  const fillerRate = questionNumber > 0 ? fillerCount / questionNumber : 0
  if (fillerRate > 3) return { bg: 'from-red-950 to-gray-950', globeGlow: 'rgba(239,68,68,0.3)', label: 'high-stress' }
  if (fillerRate > 1.5) return { bg: 'from-amber-950 to-gray-950', globeGlow: 'rgba(245,158,11,0.2)', label: 'moderate' }
  return { bg: 'from-gray-900 to-gray-950', globeGlow: 'rgba(34,197,94,0.2)', label: 'calm' }
}

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
  const pattern = FILLER_WORDS.map((f) => `\\b${f}\\b`).join('|')
  const regex = new RegExp(`(${pattern})`, 'gi')
  const parts = text.split(regex)
  return parts.map((part, i) => {
    const isMatch = FILLER_WORDS.some((f) => part.toLowerCase() === f.toLowerCase())
    if (isMatch) {
      return (
        <span key={i} className="text-red-400 bg-red-500/10 rounded px-0.5 font-medium">
          {part}
        </span>
      )
    }
    return <span key={i}>{part}</span>
  })
}

function stripMetaTags(text: string): string {
  let clean = text
    .replace(/<interview_meta>[\s\S]*?<\/interview_meta>/g, '')
    .replace(/<interview_complete>[\s\S]*?<\/interview_complete>/g, '')
  const partialStart = clean.indexOf('<interview')
  if (partialStart !== -1) {
    clean = clean.substring(0, partialStart)
  }
  return clean.trim()
}

interface InterviewRoomProps {
  sessionId: string
  onInterviewEnd: () => void
}

export default function InterviewRoom({ sessionId, onInterviewEnd }: InterviewRoomProps) {
  const [currentQuestion, setCurrentQuestion] = useState('')
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([])
  const [questionNumber, setQuestionNumber] = useState(0)
  const [estimatedTotal, setEstimatedTotal] = useState(18)
  const [isAISpeaking, setIsAISpeaking] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [fillerCount, setFillerCount] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [started, setStarted] = useState(false)
  const [waitingForAI, setWaitingForAI] = useState(false)
  const [pendingQuestion, setPendingQuestion] = useState('') // holds question until TTS starts
  const [revealedQuestion, setRevealedQuestion] = useState('') // what's actually shown
  const [textInput, setTextInput] = useState('')
  const [videoEnabled, setVideoEnabled] = useState(true)
  const [audioMuted, setAudioMuted] = useState(false)
  const [showTranscript, setShowTranscript] = useState(false)

  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const transcriptEndRef = useRef<HTMLDivElement>(null)
  const elapsedTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const submitAnswerRef = useRef<(text: string) => void>(() => {})

  const { speak, isSpeaking, stop: stopTTS } = useTTSPlayer()

  const handleSilence = useCallback(() => {
    submitAnswerRef.current?.('')
  }, [])

  const {
    startListening, stopListening, interimTranscript, finalTranscript,
    isListening, isSupported, resetTranscript,
  } = useVoicePipeline({ onSilence: handleSilence, silenceTimeout: 3000 })

  // Initialize webcam
  useEffect(() => {
    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480, facingMode: 'user' },
          audio: false, // Audio handled by SpeechRecognition
        })
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }
      } catch {
        // Camera not available — proceed without video
        setVideoEnabled(false)
      }
    }
    startCamera()
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop())
    }
  }, [])

  // Scroll transcript to bottom
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [transcript, interimTranscript])

  // Elapsed timer
  useEffect(() => {
    elapsedTimerRef.current = setInterval(() => setElapsed((p) => p + 1), 1000)
    return () => { if (elapsedTimerRef.current) clearInterval(elapsedTimerRef.current) }
  }, [])

  useEffect(() => { setIsAISpeaking(isSpeaking) }, [isSpeaking])

  // Toggle webcam
  function toggleVideo() {
    if (streamRef.current) {
      const videoTrack = streamRef.current.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled
        setVideoEnabled(videoTrack.enabled)
      }
    }
  }

  // Parse SSE stream
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
              callbacks.onDone?.(); currentEvent = ''; continue
            }
            try {
              const data = JSON.parse(dataStr)
              switch (currentEvent) {
                case 'message': callbacks.onTextChunk?.(data.text || ''); break
                case 'meta': callbacks.onMeta?.(data); break
                case 'fillers': callbacks.onFillers?.(data.fillers || []); break
                case 'interview_complete': callbacks.onInterviewComplete?.(); break
                case 'error': console.error('SSE error:', data.error); break
                default: if (data.text) callbacks.onTextChunk?.(data.text); break
              }
            } catch { /* skip */ }
            currentEvent = ''
          } else if (line.trim() === '') { currentEvent = '' }
        }
      }
    },
    []
  )

  // Start interview
  useEffect(() => {
    if (started) return
    setStarted(true)
    setWaitingForAI(true)
    async function startInterview() {
      try {
        const res = await fetch(`/api/interview/sessions/${sessionId}/start`, { method: 'POST' })
        if (!res.ok) { toast.error('Failed to start interview'); return }
        let questionText = ''
        // Accumulate text silently — don't show yet
        await parseSSE(res, {
          onTextChunk: (text) => { questionText += text },
          onMeta: (meta) => {
            if (meta.question_number) setQuestionNumber(meta.question_number as number)
            if (meta.estimated_remaining != null) setEstimatedTotal((meta.question_number as number) + (meta.estimated_remaining as number))
          },
        })
        const cleanQuestion = stripMetaTags(questionText)
        if (cleanQuestion) {
          setQuestionNumber((prev) => prev || 1)
          setWaitingForAI(false)
          // Stop mic FIRST so it doesn't pick up AI's voice
          stopListening()
          // Show "AI is about to speak" state but don't show question text yet
          // Set text but DON'T manually set isAISpeaking — let the TTS hook control it
          // The question overlay only shows when hook's isSpeaking becomes true (audio.play() fires)
          setCurrentQuestion(cleanQuestion)
          setTranscript((prev) => [...prev, { role: 'interviewer', text: cleanQuestion }])
          await speak(cleanQuestion)
          // speak() resolved = audio finished, hook already set isSpeaking=false
          // Reset transcript to discard any AI audio the mic may have picked up, then start fresh
          if (isSupported) { resetTranscript(); startListening() }
        }
      } catch { toast.error('Failed to start interview') }
    }
    startInterview()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Submit answer
  const submitAnswer = useCallback(
    async (answerText?: string) => {
      const text = answerText || (finalTranscript + ' ' + interimTranscript).trim()
      if (!text || isProcessing) return
      setIsProcessing(true); stopListening(); resetTranscript()
      const newFillers = countFillers(text)
      setFillerCount((prev) => prev + newFillers)
      setTranscript((prev) => [...prev, { role: 'candidate', text }])
      setWaitingForAI(true); setCurrentQuestion('')
      try {
        const res = await fetch(`/api/interview/sessions/${sessionId}/message`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: text }),
        })
        if (!res.ok) { toast.error('Failed to send answer'); setIsProcessing(false); setWaitingForAI(false); return }
        let questionText = ''
        let interviewDone = false
        // Accumulate text silently
        await parseSSE(res, {
          onTextChunk: (chunk) => { questionText += chunk },
          onMeta: (meta) => {
            if (meta.question_number) setQuestionNumber(meta.question_number as number)
            if (meta.estimated_remaining != null) setEstimatedTotal((meta.question_number as number) + (meta.estimated_remaining as number))
          },
          onFillers: (fillers) => {
            const serverCount = fillers.reduce((sum, f) => sum + f.count, 0)
            if (serverCount > newFillers) setFillerCount((prev) => prev + (serverCount - newFillers))
          },
          onInterviewComplete: () => { interviewDone = true },
        })
        const cleanQuestion = stripMetaTags(questionText)
        // Always show and speak the AI's response first — even if interview is ending
        if (cleanQuestion) {
          setCurrentQuestion(cleanQuestion)
          setTranscript((prev) => [...prev, { role: 'interviewer', text: cleanQuestion }])
          setWaitingForAI(false)
          await speak(cleanQuestion)
        }
        // THEN transition if interview is complete (after speaking the closing statement)
        if (interviewDone) {
          // Give 2s for user to process the closing statement before transitioning
          await new Promise(r => setTimeout(r, 2000))
          onInterviewEnd()
          return
        }
        if (cleanQuestion && !interviewDone) {
          // Reset transcript to discard any AI audio the mic picked up
          if (isSupported) { resetTranscript(); startListening() }
        }
      } catch { toast.error('Something went wrong') } finally { setIsProcessing(false) }
    },
    [isProcessing, stopListening, resetTranscript, sessionId, finalTranscript, interimTranscript, parseSSE, speak, isSupported, startListening, onInterviewEnd]
  )

  useEffect(() => { submitAnswerRef.current = submitAnswer }, [submitAnswer])

  function handleNext() {
    const voiceText = (finalTranscript + ' ' + interimTranscript).trim()
    const text = voiceText || textInput.trim()
    if (text) { setTextInput(''); submitAnswer(text) }
    else toast.error('Please answer the question first')
  }

  function handleTextSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (textInput.trim()) { submitAnswer(textInput.trim()); setTextInput('') }
  }

  function handleMicToggle() {
    if (isListening) stopListening(); else startListening()
  }

  async function handleEndInterview() {
    stopListening(); stopTTS()
    streamRef.current?.getTracks().forEach((t) => t.stop())
    try { await fetch(`/api/interview/sessions/${sessionId}/end`, { method: 'POST' }) } catch { /* proceed */ }
    onInterviewEnd()
  }

  const minutes = Math.floor(elapsed / 60)
  const seconds = elapsed % 60
  const timeStr = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  const progress = estimatedTotal > 0 ? (questionNumber / estimatedTotal) * 100 : 0
  const mood = getMood(fillerCount, questionNumber)
  const currentCandidateText = (finalTranscript + ' ' + interimTranscript).trim()

  return (
    <div className={`flex flex-col h-[calc(100vh-64px)] bg-gradient-to-br ${mood.bg} transition-all duration-[3000ms]`}>
      {/* Top Bar */}
      <div className="shrink-0 bg-gray-900 border-b border-gray-800 px-4 sm:px-6 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-sm font-medium text-white">Mock Interview</span>
          <span className="text-xs text-gray-400">Q{questionNumber} of ~{estimatedTotal}</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-gray-400">
            <Clock size={13} />
            <span className="text-xs font-mono">{timeStr}</span>
          </div>
          <div className={`flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full ${
            fillerCount > 10 ? 'bg-red-500/20 text-red-400'
            : fillerCount > 5 ? 'bg-amber-500/20 text-amber-400'
            : 'bg-green-500/20 text-green-400'
          }`}>
            <BarChart3 size={11} />
            {fillerCount} fillers
          </div>
          {/* Progress */}
          <div className="hidden sm:flex items-center gap-2 w-32">
            <div className="flex-1 h-1 bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-green-500 rounded-full"
                animate={{ width: `${Math.min(progress, 100)}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <span className="text-[10px] text-gray-500">{Math.round(progress)}%</span>
          </div>
        </div>
      </div>

      {/* Main Content — Video Call Layout */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Video Area */}
        <div className="flex-1 flex flex-col sm:flex-row gap-1 p-2 min-h-0">
          {/* AI Interviewer Panel */}
          <div className="flex-1 relative rounded-xl overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700/50">
            {/* AI Avatar — Glassmorphism Neural Globe */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="relative w-32 h-32 sm:w-40 sm:h-40">
                {/* Outer glow ring */}
                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: 'conic-gradient(from 0deg, rgba(34,197,94,0.3), rgba(16,185,129,0.1), rgba(34,197,94,0.3), rgba(5,150,105,0.1), rgba(34,197,94,0.3))',
                  }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                />

                {/* Middle orbit ring */}
                <motion.div
                  className="absolute inset-2 rounded-full border border-green-500/20"
                  style={{
                    background: 'conic-gradient(from 180deg, rgba(74,222,128,0.15), transparent 40%, rgba(74,222,128,0.15), transparent 80%)',
                  }}
                  animate={{ rotate: -360 }}
                  transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
                />

                {/* Inner glass sphere */}
                <div className="absolute inset-4 rounded-full overflow-hidden"
                  style={{
                    background: 'radial-gradient(ellipse at 30% 20%, rgba(255,255,255,0.08), transparent 50%), radial-gradient(circle at 50% 50%, rgba(22,101,52,0.6), rgba(5,46,22,0.9))',
                    backdropFilter: 'blur(20px)',
                    boxShadow: isAISpeaking
                      ? '0 0 40px rgba(34,197,94,0.4), inset 0 0 30px rgba(34,197,94,0.1)'
                      : '0 0 20px rgba(34,197,94,0.15), inset 0 0 20px rgba(0,0,0,0.3)',
                  }}>
                  {/* Grid lines (globe wireframe) */}
                  <motion.svg
                    className="absolute inset-0 w-full h-full opacity-30"
                    viewBox="0 0 100 100"
                    animate={{ rotate: isAISpeaking ? 360 : 0 }}
                    transition={{ duration: isAISpeaking ? 4 : 20, repeat: Infinity, ease: 'linear' }}
                  >
                    {/* Horizontal latitude lines */}
                    <ellipse cx="50" cy="30" rx="38" ry="8" fill="none" stroke="rgba(74,222,128,0.5)" strokeWidth="0.5" />
                    <ellipse cx="50" cy="50" rx="42" ry="10" fill="none" stroke="rgba(74,222,128,0.4)" strokeWidth="0.5" />
                    <ellipse cx="50" cy="70" rx="38" ry="8" fill="none" stroke="rgba(74,222,128,0.5)" strokeWidth="0.5" />
                    {/* Vertical longitude lines */}
                    <ellipse cx="50" cy="50" rx="10" ry="42" fill="none" stroke="rgba(74,222,128,0.4)" strokeWidth="0.5" />
                    <ellipse cx="50" cy="50" rx="25" ry="42" fill="none" stroke="rgba(74,222,128,0.3)" strokeWidth="0.5" />
                    <ellipse cx="50" cy="50" rx="38" ry="42" fill="none" stroke="rgba(74,222,128,0.2)" strokeWidth="0.5" />
                    {/* Neural dots */}
                    {[
                      [30, 25], [70, 30], [55, 45], [35, 55], [65, 60],
                      [45, 35], [60, 70], [40, 70], [75, 45], [25, 45],
                    ].map(([cx, cy], i) => (
                      <circle key={i} cx={cx} cy={cy} r="1.5" fill="rgba(134,239,172,0.7)">
                        <animate attributeName="opacity" values="0.3;1;0.3" dur={`${1.5 + i * 0.2}s`} repeatCount="indefinite" />
                      </circle>
                    ))}
                  </motion.svg>

                  {/* Center — pulsing core dot instead of text */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div
                      className="w-3 h-3 rounded-full bg-green-400"
                      animate={isAISpeaking
                        ? { scale: [1, 1.8, 1], opacity: [0.6, 1, 0.6], boxShadow: ['0 0 0 0 rgba(74,222,128,0)', '0 0 12px 4px rgba(74,222,128,0.4)', '0 0 0 0 rgba(74,222,128,0)'] }
                        : { scale: [1, 1.2, 1], opacity: [0.4, 0.7, 0.4] }
                      }
                      transition={{ duration: isAISpeaking ? 1 : 3, repeat: Infinity, ease: 'easeInOut' }}
                    />
                  </div>
                </div>

                {/* Pulse ring when speaking */}
                {isAISpeaking && (
                  <>
                    <motion.div
                      className="absolute inset-0 rounded-full border border-green-400/30"
                      animate={{ scale: [1, 1.3, 1.3], opacity: [0.6, 0, 0] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
                    />
                    <motion.div
                      className="absolute inset-0 rounded-full border border-green-400/20"
                      animate={{ scale: [1, 1.5, 1.5], opacity: [0.4, 0, 0] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'easeOut', delay: 0.5 }}
                    />
                  </>
                )}
              </div>

              <p className="mt-3 text-sm font-medium text-green-200/80 tracking-wide">IKLAVYA Interviewer</p>
              {isAISpeaking && (
                <div className="flex items-center gap-[3px] mt-2">
                  {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                    <motion.div
                      key={i}
                      className="w-[3px] bg-green-400 rounded-full"
                      animate={{ height: ['4px', `${12 + Math.random() * 12}px`, '4px'] }}
                      transition={{ duration: 0.5 + Math.random() * 0.3, repeat: Infinity, delay: i * 0.08, ease: 'easeInOut' }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Question Overlay — only visible when AI is speaking or thinking */}
            <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
              <AnimatePresence mode="wait">
                {/* Show thinking dots while waiting */}
                {waitingForAI && !isAISpeaking && (
                  <motion.div
                    key="thinking"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="bg-black/70 backdrop-blur-sm rounded-lg px-4 py-3"
                  >
                    <div className="flex items-center gap-2 text-gray-300">
                      <div className="flex gap-1">
                        {[0, 1, 2].map((i) => (
                          <span key={i} className="w-1.5 h-1.5 rounded-full bg-green-400 animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
                        ))}
                      </div>
                      <span className="text-xs">Thinking...</span>
                    </div>
                  </motion.div>
                )}
                {/* Show question text AFTER AI finishes speaking */}
                {!isAISpeaking && !waitingForAI && currentQuestion && (
                  <motion.div
                    key={currentQuestion}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="bg-black/70 backdrop-blur-sm rounded-lg px-4 py-3 max-h-32 overflow-y-auto"
                  >
                    <p className="text-sm text-white leading-relaxed">{currentQuestion}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Recording indicator */}
            <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/50 rounded-full px-2.5 py-1">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              <span className="text-[10px] text-gray-300 font-medium">REC</span>
            </div>
          </div>

          {/* User Video Panel */}
          <div className="flex-1 relative rounded-xl overflow-hidden bg-gray-900 border border-gray-700/50">
            {videoEnabled ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover scale-x-[-1]"
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gray-700 flex items-center justify-center">
                  <span className="text-2xl sm:text-3xl font-bold text-gray-400">You</span>
                </div>
                <p className="mt-2 text-xs text-gray-500">Camera off</p>
              </div>
            )}

            {/* Name tag */}
            <div className="absolute bottom-3 left-3 bg-black/50 backdrop-blur-sm rounded-md px-2.5 py-1">
              <span className="text-xs text-white font-medium">You</span>
            </div>

            {/* Listening indicator */}
            {isListening && (
              <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-red-500/80 rounded-full px-2.5 py-1">
                <Mic size={10} className="text-white" />
                <span className="text-[10px] text-white font-medium">LIVE</span>
              </div>
            )}

            {/* STAR Method Tracker */}
            {currentCandidateText.length > 20 && (
              <div className="absolute top-3 left-3">
                <STARTracker candidateText={currentCandidateText} />
              </div>
            )}

            {/* Live transcript overlay */}
            {isListening && (finalTranscript || interimTranscript) && (
              <div className="absolute bottom-12 left-3 right-3">
                <div className="bg-black/60 backdrop-blur-sm rounded-lg px-3 py-2 max-h-20 overflow-y-auto">
                  <p className="text-xs text-gray-200">
                    {finalTranscript}
                    {interimTranscript && <span className="text-gray-400"> {interimTranscript}</span>}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Transcript Sidebar (toggled) */}
        <AnimatePresence>
          {showTranscript && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="shrink-0 bg-gray-900 border-l border-gray-800 flex flex-col overflow-hidden"
            >
              <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
                <span className="text-sm font-semibold text-white">Transcript</span>
                <button onClick={() => setShowTranscript(false)} className="text-gray-500 hover:text-gray-300">
                  <ChevronDown size={16} className="rotate-90" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {transcript.length === 0 && (
                  <p className="text-xs text-gray-600 text-center py-4">Conversation will appear here...</p>
                )}
                {transcript.map((entry, i) => (
                  <div key={i} className="text-sm leading-relaxed">
                    <span className={`text-[10px] font-semibold uppercase tracking-wider block mb-0.5 ${
                      entry.role === 'interviewer' ? 'text-green-500' : 'text-blue-400'
                    }`}>
                      {entry.role === 'interviewer' ? 'Interviewer' : 'You'}
                    </span>
                    <p className={entry.role === 'interviewer' ? 'text-gray-300' : 'text-gray-400'}>
                      {entry.role === 'candidate' ? highlightFillers(entry.text) : entry.text}
                    </p>
                  </div>
                ))}
                <div ref={transcriptEndRef} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Controls */}
      <div className="shrink-0 bg-gray-900 border-t border-gray-800 px-4 py-3">
        <div className="flex items-center justify-center gap-3">
          {/* Audio toggle */}
          <button
            onClick={() => setAudioMuted(!audioMuted)}
            className={`w-11 h-11 rounded-full flex items-center justify-center transition-colors ${
              audioMuted ? 'bg-gray-700 text-gray-400' : 'bg-gray-700 text-white hover:bg-gray-600'
            }`}
            title={audioMuted ? 'Unmute audio' : 'Mute audio'}
          >
            {audioMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>

          {/* Mic toggle */}
          {isSupported ? (
            <button
              onClick={handleMicToggle}
              disabled={isAISpeaking || isProcessing}
              className={`w-11 h-11 rounded-full flex items-center justify-center transition-all disabled:opacity-40 ${
                isListening
                  ? 'bg-white text-gray-900 ring-2 ring-white/30'
                  : 'bg-gray-700 text-white hover:bg-gray-600'
              }`}
              title={isListening ? 'Mute mic' : 'Unmute mic'}
            >
              {isListening ? <Mic size={18} /> : <MicOff size={18} />}
            </button>
          ) : (
            <div className="flex items-center gap-1.5 text-amber-400 text-xs bg-amber-500/10 px-3 py-2 rounded-full">
              <AlertTriangle size={12} />
              No mic — use text
            </div>
          )}

          {/* Video toggle */}
          <button
            onClick={toggleVideo}
            className={`w-11 h-11 rounded-full flex items-center justify-center transition-colors ${
              videoEnabled ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-700 text-gray-400'
            }`}
            title={videoEnabled ? 'Turn off camera' : 'Turn on camera'}
          >
            {videoEnabled ? <Video size={18} /> : <VideoOff size={18} />}
          </button>

          {/* Next / Submit */}
          <button
            onClick={handleNext}
            disabled={isAISpeaking || isProcessing || waitingForAI}
            className="h-11 px-5 rounded-full bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-40 flex items-center gap-2"
          >
            <Send size={14} />
            Next
          </button>

          {/* Transcript toggle */}
          <button
            onClick={() => setShowTranscript(!showTranscript)}
            className={`w-11 h-11 rounded-full flex items-center justify-center transition-colors ${
              showTranscript ? 'bg-green-600 text-white' : 'bg-gray-700 text-white hover:bg-gray-600'
            }`}
            title="Toggle transcript"
          >
            <MessageSquare size={18} />
          </button>

          {/* End call */}
          <button
            onClick={handleEndInterview}
            className="w-11 h-11 rounded-full bg-red-600 text-white flex items-center justify-center hover:bg-red-700 transition-colors"
            title="End interview"
          >
            <PhoneOff size={18} />
          </button>
        </div>

        {/* Text input fallback */}
        {!isSupported && (
          <form onSubmit={handleTextSubmit} className="flex gap-2 mt-3 max-w-lg mx-auto">
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Type your answer..."
              disabled={isAISpeaking || isProcessing || waitingForAI}
              className="flex-1 px-4 py-2 rounded-full bg-gray-800 border border-gray-700 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-green-500 disabled:opacity-40"
            />
            <button
              type="submit"
              disabled={!textInput.trim() || isAISpeaking || isProcessing || waitingForAI}
              className="px-4 py-2 rounded-full bg-green-600 text-white text-sm font-medium hover:bg-green-700 disabled:opacity-40"
            >
              Send
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
