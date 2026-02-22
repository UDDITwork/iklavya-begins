const AudioContext = typeof window !== 'undefined'
  ? window.AudioContext || (window as unknown as { webkitAudioContext: typeof window.AudioContext }).webkitAudioContext
  : null

let ctx: AudioContext | null = null

function getCtx(): AudioContext | null {
  if (!AudioContext) return null
  if (!ctx) ctx = new AudioContext()
  return ctx
}

/** Short, subtle pop sound for button clicks and interactions */
export function playPop() {
  const c = getCtx()
  if (!c) return
  const o = c.createOscillator()
  const g = c.createGain()
  o.type = 'sine'
  o.frequency.setValueAtTime(600, c.currentTime)
  o.frequency.exponentialRampToValueAtTime(200, c.currentTime + 0.08)
  g.gain.setValueAtTime(0.15, c.currentTime)
  g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.1)
  o.connect(g)
  g.connect(c.destination)
  o.start(c.currentTime)
  o.stop(c.currentTime + 0.1)
}

/** Soft send/whoosh sound for sending messages */
export function playSend() {
  const c = getCtx()
  if (!c) return
  const o = c.createOscillator()
  const g = c.createGain()
  o.type = 'sine'
  o.frequency.setValueAtTime(400, c.currentTime)
  o.frequency.exponentialRampToValueAtTime(800, c.currentTime + 0.1)
  g.gain.setValueAtTime(0.12, c.currentTime)
  g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.12)
  o.connect(g)
  g.connect(c.destination)
  o.start(c.currentTime)
  o.stop(c.currentTime + 0.12)
}

/** Gentle success chime */
export function playSuccess() {
  const c = getCtx()
  if (!c) return
  const notes = [523, 659, 784] // C5, E5, G5
  notes.forEach((freq, i) => {
    const o = c.createOscillator()
    const g = c.createGain()
    o.type = 'sine'
    o.frequency.setValueAtTime(freq, c.currentTime + i * 0.08)
    g.gain.setValueAtTime(0.1, c.currentTime + i * 0.08)
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + i * 0.08 + 0.2)
    o.connect(g)
    g.connect(c.destination)
    o.start(c.currentTime + i * 0.08)
    o.stop(c.currentTime + i * 0.08 + 0.2)
  })
}
