/**
 * Remotion configuration for iKlavya Classroom video rendering.
 */

import { Config } from '@remotion/cli/config'

// Use h264 codec for broad compatibility
Config.setCodec('h264')

// Output quality (crf: 0 = lossless, 51 = worst; 18 is visually lossless)
Config.setCrf(18)

// Number of parallel renders (adjust based on your machine)
Config.setConcurrency(2)

// Overwrite existing output files
Config.setOverwriteOutput(true)
