'use client'

import { useState, useRef, useCallback, useEffect } from 'react'

// -- Web Speech API type declarations --
// These types are not included in all TypeScript DOM libs, so we declare them
// locally to avoid TS2304 errors.

interface SpeechRecognitionResultItem {
  transcript: string
  confidence: number
}

interface SpeechRecognitionResultEntry {
  readonly length: number
  readonly isFinal: boolean
  [index: number]: SpeechRecognitionResultItem
}

interface SpeechRecognitionResultList {
  readonly length: number
  [index: number]: SpeechRecognitionResultEntry
}

interface SpeechRecognitionEventPayload extends Event {
  readonly results: SpeechRecognitionResultList
  readonly resultIndex: number
}

interface SpeechRecognitionErrorPayload extends Event {
  readonly error: string
  readonly message: string
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  start(): void
  stop(): void
  abort(): void
  onstart: ((this: SpeechRecognitionInstance, ev: Event) => void) | null
  onresult: ((this: SpeechRecognitionInstance, ev: SpeechRecognitionEventPayload) => void) | null
  onerror: ((this: SpeechRecognitionInstance, ev: SpeechRecognitionErrorPayload) => void) | null
  onend: ((this: SpeechRecognitionInstance, ev: Event) => void) | null
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognitionInstance
}

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor
    webkitSpeechRecognition?: SpeechRecognitionConstructor
  }
}

interface UseVoicePipelineOptions {
  onSilence?: () => void
  silenceTimeout?: number
}

interface UseVoicePipelineReturn {
  startListening: () => void
  stopListening: () => void
  interimTranscript: string
  finalTranscript: string
  isListening: boolean
  isSupported: boolean
  resetTranscript: () => void
}

export function useVoicePipeline(
  options: UseVoicePipelineOptions = {}
): UseVoicePipelineReturn {
  const { onSilence, silenceTimeout = 3000 } = options

  const [isListening, setIsListening] = useState(false)
  const [interimTranscript, setInterimTranscript] = useState('')
  const [finalTranscript, setFinalTranscript] = useState('')
  const [isSupported, setIsSupported] = useState(false)

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null)
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const onSilenceRef = useRef(onSilence)
  const isListeningRef = useRef(false)

  // Keep callback ref up to date
  useEffect(() => {
    onSilenceRef.current = onSilence
  }, [onSilence])

  // Check browser support on mount
  useEffect(() => {
    const supported =
      typeof window !== 'undefined' &&
      !!(window.SpeechRecognition || window.webkitSpeechRecognition)
    setIsSupported(supported)
  }, [])

  const clearSilenceTimer = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current)
      silenceTimerRef.current = null
    }
  }, [])

  const resetSilenceTimer = useCallback(() => {
    clearSilenceTimer()
    silenceTimerRef.current = setTimeout(() => {
      if (isListeningRef.current && onSilenceRef.current) {
        onSilenceRef.current()
      }
    }, silenceTimeout)
  }, [clearSilenceTimer, silenceTimeout])

  const stopListening = useCallback(() => {
    clearSilenceTimer()
    isListeningRef.current = false
    setIsListening(false)
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop()
      } catch {
        // Ignore — may already be stopped
      }
    }
  }, [clearSilenceTimer])

  const startListening = useCallback(() => {
    if (!isSupported) return

    // Don't reset transcripts here — caller uses resetTranscript() explicitly when needed

    const SpeechRecognitionClass =
      window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognitionClass) return

    const recognition = new SpeechRecognitionClass()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-IN'

    recognition.onstart = () => {
      isListeningRef.current = true
      setIsListening(true)
      resetSilenceTimer()
    }

    recognition.onresult = (event: SpeechRecognitionEventPayload) => {
      resetSilenceTimer()

      let interim = ''
      let final = ''

      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i]
        if (result.isFinal) {
          final += result[0].transcript + ' '
        } else {
          interim += result[0].transcript
        }
      }

      setFinalTranscript(final.trim())
      setInterimTranscript(interim)
    }

    recognition.onerror = (event: SpeechRecognitionErrorPayload) => {
      // Recoverable errors — just log
      if (event.error === 'no-speech') {
        resetSilenceTimer()
        return
      }
      if (event.error === 'aborted') {
        return
      }
      console.warn('SpeechRecognition error:', event.error)
      stopListening()
    }

    recognition.onend = () => {
      // Auto-restart if still supposed to be listening (browser can stop unexpectedly)
      if (isListeningRef.current) {
        try {
          recognition.start()
        } catch {
          isListeningRef.current = false
          setIsListening(false)
        }
      } else {
        setIsListening(false)
      }
    }

    recognitionRef.current = recognition

    try {
      recognition.start()
    } catch {
      console.warn('Failed to start SpeechRecognition')
    }
  }, [isSupported, resetSilenceTimer, stopListening])

  const resetTranscript = useCallback(() => {
    setInterimTranscript('')
    setFinalTranscript('')
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearSilenceTimer()
      if (recognitionRef.current) {
        isListeningRef.current = false
        try {
          recognitionRef.current.stop()
        } catch {
          // noop
        }
      }
    }
  }, [clearSilenceTimer])

  return {
    startListening,
    stopListening,
    interimTranscript,
    finalTranscript,
    isListening,
    isSupported,
    resetTranscript,
  }
}
