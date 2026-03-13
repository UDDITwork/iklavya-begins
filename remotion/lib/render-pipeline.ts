/**
 * Master render pipeline for iKlavya Classroom.
 *
 * Orchestrates the full video production process:
 *   1. Generate voiceover audio via ElevenLabs (skips existing files)
 *   2. Render each module video via Remotion CLI
 *   3. Output MP4 files to remotion/output/
 *
 * Usage:
 *   ELEVENLABS_API_KEY=sk-... npx tsx remotion/lib/render-pipeline.ts
 *
 * Options (env vars):
 *   ELEVENLABS_API_KEY   – Required for voiceover generation
 *   ELEVENLABS_VOICE_ID  – Override default voice (Rachel)
 *   SKIP_VOICEOVER=1     – Skip voiceover step (use existing audio)
 *   MODULE_SLUG=<slug>   – Render only a single module
 */

import { execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { COURSE_SCRIPTS } from '../scripts/course-scripts'
import { generateAllVoiceovers } from './elevenlabs'

const ROOT_DIR = path.resolve(__dirname, '..', '..')
const REMOTION_DIR = path.resolve(__dirname, '..')
const OUTPUT_DIR = path.resolve(REMOTION_DIR, 'output')
const RENDER_ENTRY = path.resolve(REMOTION_DIR, 'render.ts')

function slugToCompositionId(slug: string): string {
  return slug.replace(/[^a-zA-Z0-9-]/g, '-')
}

function ensureDir(dir: string): void {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
}

async function main(): Promise<void> {
  console.log('='.repeat(60))
  console.log('  iKlavya Classroom – Video Render Pipeline')
  console.log('='.repeat(60))

  // Determine which modules to process
  const targetSlug = process.env.MODULE_SLUG
  const scripts = targetSlug
    ? COURSE_SCRIPTS.filter((s) => s.id === targetSlug)
    : COURSE_SCRIPTS

  if (scripts.length === 0) {
    console.error(
      targetSlug
        ? `No course script found for slug: "${targetSlug}"`
        : 'No course scripts defined in remotion/scripts/course-scripts.ts'
    )
    process.exit(1)
  }

  console.log(`\nModules to process: ${scripts.map((s) => s.id).join(', ')}`)

  // ── Step 1: Generate voiceovers ─────────────────────────────────────
  if (process.env.SKIP_VOICEOVER === '1') {
    console.log('\n[pipeline] Skipping voiceover generation (SKIP_VOICEOVER=1)')
  } else {
    console.log('\n[pipeline] Step 1: Generating voiceovers via ElevenLabs...')
    if (!process.env.ELEVENLABS_API_KEY) {
      console.error(
        '\nERROR: ELEVENLABS_API_KEY is not set.\n' +
          'Either set the env var or use SKIP_VOICEOVER=1 to skip.\n'
      )
      process.exit(1)
    }
    await generateAllVoiceovers(scripts)
  }

  // ── Step 2: Render videos ───────────────────────────────────────────
  console.log('\n[pipeline] Step 2: Rendering module videos via Remotion...')
  ensureDir(OUTPUT_DIR)

  const results: { slug: string; status: 'ok' | 'failed'; error?: string }[] = []

  for (const script of scripts) {
    const compositionId = slugToCompositionId(script.id)
    const outputFile = path.join(OUTPUT_DIR, `${script.id}.mp4`)

    console.log(`\n  Rendering: ${compositionId} -> ${path.basename(outputFile)}`)

    try {
      const cmd = [
        'npx',
        'remotion',
        'render',
        RENDER_ENTRY,
        compositionId,
        outputFile,
        '--codec=h264',
        '--crf=18',
        '--log=verbose',
      ].join(' ')

      execSync(cmd, {
        cwd: ROOT_DIR,
        stdio: 'inherit',
        env: { ...process.env },
        timeout: 10 * 60 * 1000, // 10 minutes per module
      })

      results.push({ slug: script.id, status: 'ok' })
      console.log(`  OK: ${path.basename(outputFile)}`)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      results.push({ slug: script.id, status: 'failed', error: msg })
      console.error(`  FAILED: ${script.id} – ${msg}`)
    }
  }

  // ── Summary ─────────────────────────────────────────────────────────
  console.log('\n' + '='.repeat(60))
  console.log('  Render Pipeline Complete')
  console.log('='.repeat(60))

  const succeeded = results.filter((r) => r.status === 'ok')
  const failed = results.filter((r) => r.status === 'failed')

  if (succeeded.length > 0) {
    console.log(`\n  Succeeded (${succeeded.length}):`)
    succeeded.forEach((r) => console.log(`    - ${r.slug}.mp4`))
  }

  if (failed.length > 0) {
    console.log(`\n  Failed (${failed.length}):`)
    failed.forEach((r) => console.log(`    - ${r.slug}: ${r.error}`))
  }

  console.log(`\n  Output directory: ${OUTPUT_DIR}`)

  if (failed.length > 0) {
    process.exit(1)
  }
}

main().catch((err) => {
  console.error('[pipeline] Fatal error:', err)
  process.exit(1)
})
