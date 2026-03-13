import React from 'react'
import { Composition } from 'remotion'
import { ModuleVideo } from './compositions/ModuleVideo'
import { COURSE_SCRIPTS } from './scripts/course-scripts'

const FPS = 30
const WIDTH = 1920
const HEIGHT = 1080

// Each module is 4 segments × 150 seconds = 600 seconds = 18000 frames
const MODULE_DURATION_FRAMES = 600 * FPS

function slugToCompositionId(slug: string): string {
  return slug.replace(/[^a-zA-Z0-9-]/g, '-')
}

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {COURSE_SCRIPTS.map((script) => {
        const id = slugToCompositionId(script.id)

        return (
          <Composition
            key={id}
            id={id}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            component={ModuleVideo as any}
            durationInFrames={MODULE_DURATION_FRAMES}
            fps={FPS}
            width={WIDTH}
            height={HEIGHT}
            defaultProps={{ script }}
          />
        )
      })}
    </>
  )
}
