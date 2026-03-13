import React from 'react';
import {
  useCurrentFrame,
  interpolate,
  AbsoluteFill,
} from 'remotion';

interface SubtitleBarProps {
  text: string;
  startFrame: number;
  durationFrames: number;
}

const HIGHLIGHT_COLOR = '#FFFFFF';
const DIM_COLOR = 'rgba(255, 255, 255, 0.45)';

export const SubtitleBar: React.FC<SubtitleBarProps> = ({
  text,
  startFrame,
  durationFrames,
}) => {
  const frame = useCurrentFrame();

  const words = text.split(/\s+/).filter((w) => w.length > 0);

  if (words.length === 0) return null;

  // Calculate which word is currently highlighted
  const elapsed = frame - startFrame;
  const framesPerWord = durationFrames / words.length;
  const currentWordIndex = Math.floor(
    interpolate(elapsed, [0, durationFrames], [0, words.length], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    })
  );

  // Fade in/out the bar
  const barOpacity = interpolate(
    frame,
    [startFrame - 5, startFrame, startFrame + durationFrames - 5, startFrame + durationFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // Subtle slide-up entry
  const translateY = interpolate(
    frame,
    [startFrame - 5, startFrame],
    [10, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  if (frame < startFrame - 5 || frame > startFrame + durationFrames + 5) {
    return null;
  }

  return (
    <AbsoluteFill style={{ pointerEvents: 'none', zIndex: 50 }}>
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          opacity: barOpacity,
          transform: `translateY(${translateY}px)`,
        }}
      >
        {/* Semi-transparent dark background */}
        <div
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.78)',
            backdropFilter: 'blur(8px)',
            padding: '18px 40px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: 22,
              fontFamily: 'system-ui, -apple-system, sans-serif',
              fontWeight: 400,
              lineHeight: 1.6,
              textAlign: 'center',
              maxWidth: '85%',
            }}
          >
            {words.map((word, index) => {
              // Smooth per-word highlight transition
              const wordProgress = interpolate(
                elapsed,
                [
                  index * framesPerWord - 2,
                  index * framesPerWord,
                  (index + 1) * framesPerWord - 2,
                  (index + 1) * framesPerWord,
                ],
                [0, 1, 1, 0],
                { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
              );

              const isCurrentOrPast = index <= currentWordIndex;

              const color = isCurrentOrPast
                ? HIGHLIGHT_COLOR
                : DIM_COLOR;

              const fontWeight = index === currentWordIndex ? 600 : 400;

              // Subtle scale on current word
              const wordScale =
                index === currentWordIndex
                  ? interpolate(wordProgress, [0, 1], [1, 1.05], {
                      extrapolateLeft: 'clamp',
                      extrapolateRight: 'clamp',
                    })
                  : 1;

              return (
                <span
                  key={index}
                  style={{
                    color,
                    fontWeight,
                    display: 'inline-block',
                    transform: `scale(${wordScale})`,
                    marginRight: 6,
                    transition: 'color 0.1s ease',
                  }}
                >
                  {word}
                </span>
              );
            })}
          </p>
        </div>
      </div>
    </AbsoluteFill>
  );
};

export default SubtitleBar;
