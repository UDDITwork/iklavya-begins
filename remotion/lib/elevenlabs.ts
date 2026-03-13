/**
 * ElevenLabs Text-to-Speech utility for iKlavya Classroom.
 *
 * Uses the ElevenLabs API to generate voiceover MP3 files from course scripts.
 * Reads ELEVENLABS_API_KEY from process.env.
 *
 * Usage (standalone):
 *   ELEVENLABS_API_KEY=sk-... npx tsx remotion/lib/elevenlabs.ts
 */

import fs from 'node:fs'
import path from 'node:path'
import type { CourseScript } from '../scripts/course-scripts'

const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1/text-to-speech'

/** Default voice: Rachel (professional female narrator) */
const DEFAULT_VOICE_ID = '21m00Tcm4TlvDq8ikWAM'

function getApiKey(): string {
  const key = process.env.ELEVENLABS_API_KEY
  if (!key) {
    throw new Error(
      'ELEVENLABS_API_KEY environment variable is not set. ' +
        'Get your key at https://elevenlabs.io and set it before running the pipeline.'
    )
  }
  return key
}

function getVoiceId(): string {
  return process.env.ELEVENLABS_VOICE_ID || DEFAULT_VOICE_ID
}

/**
 * Generate a single voiceover MP3 from text and save it to outputPath.
 */
export async function generateVoiceover(
  text: string,
  outputPath: string
): Promise<void> {
  const apiKey = getApiKey()
  const voiceId = getVoiceId()
  const url = `${ELEVENLABS_API_URL}/${voiceId}`

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'xi-api-key': apiKey,
      'Content-Type': 'application/json',
      Accept: 'audio/mpeg',
    },
    body: JSON.stringify({
      text,
      model_id: 'eleven_monolingual_v1',
      voice_settings: {
        stability: 0.75,
        similarity_boost: 0.75,
      },
    }),
  })

  if (!response.ok) {
    const errorBody = await response.text().catch(() => 'unknown error')
    throw new Error(
      `ElevenLabs API error (${response.status}): ${errorBody}`
    )
  }

  const arrayBuffer = await response.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  // Ensure output directory exists
  const dir = path.dirname(outputPath)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }

  fs.writeFileSync(outputPath, buffer)
}

/**
 * Generate voiceovers for all segments across all course scripts.
 * Skips files that already exist (incremental generation).
 *
 * Output naming: {moduleSlug}-segment-{index}.mp3
 * Saved to: remotion/audio/
 */
export async function generateAllVoiceovers(
  scripts: CourseScript[]
): Promise<void> {
  const audioDir = path.resolve(__dirname, '..', '..', 'public', 'audio')

  if (!fs.existsSync(audioDir)) {
    fs.mkdirSync(audioDir, { recursive: true })
  }

  const totalSegments = scripts.reduce(
    (sum, s) => sum + s.segments.length,
    0
  )
  let completed = 0

  for (const script of scripts) {
    console.log(`\n[voiceover] Module: ${script.title}`)

    for (let i = 0; i < script.segments.length; i++) {
      const segment = script.segments[i]
      const filename = `${script.id}-segment-${i}.mp3`
      const outputPath = path.join(audioDir, filename)

      completed++
      const progress = `[${completed}/${totalSegments}]`

      // Skip if file already exists (incremental generation)
      if (fs.existsSync(outputPath)) {
        console.log(`  ${progress} SKIP (exists): ${filename}`)
        continue
      }

      console.log(
        `  ${progress} Generating: ${filename} ("${segment.title}")`
      )

      try {
        await generateVoiceover(segment.narration, outputPath)
        console.log(`  ${progress} OK: ${filename}`)
      } catch (err) {
        console.error(
          `  ${progress} FAILED: ${filename} -`,
          err instanceof Error ? err.message : err
        )
        // Continue with next segment rather than aborting the whole pipeline
      }
    }
  }

  console.log(`\n[voiceover] Done. Generated audio in: ${audioDir}`)
}

// ── Standalone entry point ──────────────────────────────────────────────
// Run directly: npx tsx remotion/lib/elevenlabs.ts
if (require.main === module) {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { COURSE_SCRIPTS } = require('../scripts/course-scripts')
  generateAllVoiceovers(COURSE_SCRIPTS).catch((err) => {
    console.error('[voiceover] Fatal error:', err)
    process.exit(1)
  })
}
