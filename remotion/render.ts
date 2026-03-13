/**
 * Remotion CLI entry point for iKlavya Classroom.
 *
 * This file is passed to the Remotion CLI:
 *   npx remotion render remotion/render.ts <CompositionId> output.mp4
 *
 * It registers all compositions via RemotionRoot.
 */

import { registerRoot } from 'remotion'
import { RemotionRoot } from './Root'

registerRoot(RemotionRoot)
