'use client'

import { useState, useRef, useCallback, useEffect } from 'react'

interface UseTTSPlayerReturn {
  speak: (text: string) => Promise<void>
  isSpeaking: boolean
  stop: () => void
}

export function useTTSPlayer(): UseTTSPlayerReturn {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const blobUrlRef = useRef<string | null>(null)

  const cleanup = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      audioRef.current = null
    }
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current)
      blobUrlRef.current = null
    }
  }, [])

  const stop = useCallback(() => {
    cleanup()
    setIsSpeaking(false)
  }, [cleanup])

  const speak = useCallback(
    async (text: string): Promise<void> => {
      // Stop any current playback
      cleanup()

      try {
        const res = await fetch('/api/interview/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text }),
        })

        if (!res.ok) {
          console.warn('TTS API failed, falling back to browser TTS')
          // Fallback to browser speech synthesis
          return new Promise<void>((resolve) => {
            if (typeof window !== 'undefined' && window.speechSynthesis) {
              const utterance = new SpeechSynthesisUtterance(text)
              utterance.lang = 'en-IN'
              utterance.rate = 0.95
              setIsSpeaking(true)
              utterance.onend = () => {
                setIsSpeaking(false)
                resolve()
              }
              utterance.onerror = () => {
                setIsSpeaking(false)
                resolve()
              }
              window.speechSynthesis.speak(utterance)
            } else {
              resolve()
            }
          })
        }

        const blob = await res.blob()
        const url = URL.createObjectURL(blob)
        blobUrlRef.current = url

        return new Promise<void>((resolve) => {
          const audio = new Audio(url)
          audioRef.current = audio

          setIsSpeaking(true)

          audio.onended = () => {
            setIsSpeaking(false)
            resolve()
          }

          audio.onerror = () => {
            setIsSpeaking(false)
            resolve()
          }

          audio.play().catch(() => {
            setIsSpeaking(false)
            resolve()
          })
        })
      } catch {
        setIsSpeaking(false)
      }
    },
    [cleanup]
  )

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup()
    }
  }, [cleanup])

  return { speak, isSpeaking, stop }
}
