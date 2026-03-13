#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────────────
# iKlavya Classroom – Full Render Pipeline
#
# Generates voiceover audio via ElevenLabs and renders module videos
# using Remotion.
#
# Usage:
#   ELEVENLABS_API_KEY=sk-... bash remotion/render-all.sh
#
# Options:
#   SKIP_VOICEOVER=1    Skip voiceover generation (use existing audio)
#   MODULE_SLUG=<slug>  Render only a specific module
# ──────────────────────────────────────────────────────────────────────

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "============================================================"
echo "  iKlavya Classroom – Render Pipeline"
echo "============================================================"
echo ""

# ── Pre-flight checks ────────────────────────────────────────────────

# Check for ELEVENLABS_API_KEY (unless skipping voiceover)
if [[ "${SKIP_VOICEOVER:-}" != "1" ]]; then
  if [[ -z "${ELEVENLABS_API_KEY:-}" ]]; then
    echo "ERROR: ELEVENLABS_API_KEY environment variable is not set."
    echo ""
    echo "Either:"
    echo "  1. Set it: export ELEVENLABS_API_KEY=sk-..."
    echo "  2. Skip voiceover: SKIP_VOICEOVER=1 bash remotion/render-all.sh"
    echo ""
    exit 1
  fi
  echo "[check] ELEVENLABS_API_KEY is set"
fi

# Check that node_modules exist
if [[ ! -d "$PROJECT_ROOT/node_modules" ]]; then
  echo "[check] node_modules not found, running npm install..."
  cd "$PROJECT_ROOT" && npm install
fi

echo "[check] All pre-flight checks passed"
echo ""

# ── Step 1: Generate voiceovers ──────────────────────────────────────

if [[ "${SKIP_VOICEOVER:-}" == "1" ]]; then
  echo "[step 1] Skipping voiceover generation (SKIP_VOICEOVER=1)"
else
  echo "[step 1] Generating voiceovers via ElevenLabs..."
  cd "$PROJECT_ROOT"
  npx tsx remotion/lib/elevenlabs.ts
  echo "[step 1] Voiceover generation complete"
fi
echo ""

# ── Step 2: Ensure output directory exists ───────────────────────────

mkdir -p "$SCRIPT_DIR/output"

# ── Step 3: Render module videos ─────────────────────────────────────

echo "[step 2] Rendering module videos via Remotion..."
echo ""

# Extract composition IDs from course-scripts via a small inline script
COMPOSITION_IDS=$(cd "$PROJECT_ROOT" && npx tsx -e "
  const { COURSE_SCRIPTS } = require('./remotion/scripts/course-scripts');
  const slug = process.env.MODULE_SLUG;
  const scripts = slug
    ? COURSE_SCRIPTS.filter((s: any) => s.id === slug)
    : COURSE_SCRIPTS;
  scripts.forEach((s: any) => console.log(s.id));
")

SUCCESS_COUNT=0
FAIL_COUNT=0

while IFS= read -r SLUG; do
  COMPOSITION_ID="${SLUG//[^a-zA-Z0-9-]/-}"
  OUTPUT_FILE="$SCRIPT_DIR/output/${SLUG}.mp4"

  echo "  Rendering: $COMPOSITION_ID -> $(basename "$OUTPUT_FILE")"

  cd "$PROJECT_ROOT"
  if npx remotion render remotion/render.ts "$COMPOSITION_ID" "$OUTPUT_FILE" \
    --codec=h264 --crf=18; then
    echo "  OK: $(basename "$OUTPUT_FILE")"
    SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
  else
    echo "  FAILED: $SLUG"
    FAIL_COUNT=$((FAIL_COUNT + 1))
  fi
  echo ""
done <<< "$COMPOSITION_IDS"

# ── Summary ──────────────────────────────────────────────────────────

echo "============================================================"
echo "  Render Pipeline Complete"
echo "============================================================"
echo ""
echo "  Succeeded: $SUCCESS_COUNT"
echo "  Failed:    $FAIL_COUNT"
echo "  Output:    $SCRIPT_DIR/output/"
echo ""

if [[ "$FAIL_COUNT" -gt 0 ]]; then
  exit 1
fi
