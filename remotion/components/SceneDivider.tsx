import React from 'react';
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  AbsoluteFill,
} from 'remotion';

const BACKGROUND = '#FAFAFA';
const ACCENT_GREEN = '#166534';

interface SceneDividerProps {
  /** Direction of the pan: 'left' or 'right' (default: 'left') */
  direction?: 'left' | 'right';
}

export const SceneDivider: React.FC<SceneDividerProps> = ({
  direction = 'left',
}) => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();

  const directionMultiplier = direction === 'left' ? -1 : 1;

  // Main pan animation with spring for smooth easing
  const panSpring = spring({
    frame,
    fps,
    config: { damping: 18, stiffness: 80, mass: 0.8 },
    durationInFrames: 30,
  });

  // Translate the entire scene to simulate camera pan
  const translateX = interpolate(
    panSpring,
    [0, 1],
    [0, directionMultiplier * width]
  );

  // Wipe overlay that slides across
  const wipeProgress = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const wipeX = interpolate(
    wipeProgress,
    [0, 1],
    [directionMultiplier * -width, directionMultiplier * width]
  );

  // Fade effect at edges
  const edgeFade = interpolate(frame, [0, 5, 25, 30], [1, 0.6, 0.6, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{ overflow: 'hidden', backgroundColor: BACKGROUND }}>
      {/* Moving background to simulate pan */}
      <AbsoluteFill
        style={{
          transform: `translateX(${translateX}px)`,
          opacity: edgeFade,
        }}
      >
        {/* Subtle grid that moves with the pan */}
        <svg
          style={{ position: 'absolute', inset: 0, opacity: 0.04 }}
          width="100%"
          height="100%"
        >
          <defs>
            <pattern
              id="divider-grid"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="#1A1A1A"
                strokeWidth="0.5"
              />
            </pattern>
          </defs>
          <rect width="200%" height="100%" fill="url(#divider-grid)" />
        </svg>
      </AbsoluteFill>

      {/* Wipe overlay - green accent bar */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          width: 6,
          backgroundColor: ACCENT_GREEN,
          transform: `translateX(${wipeX}px)`,
          boxShadow: `${directionMultiplier * -20}px 0 40px rgba(22, 101, 52, 0.15), ${directionMultiplier * 20}px 0 40px rgba(22, 101, 52, 0.15)`,
        }}
      />

      {/* Leading edge shadow for depth */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          width: 80,
          transform: `translateX(${wipeX + (directionMultiplier * -40)}px)`,
          background:
            direction === 'left'
              ? 'linear-gradient(to right, transparent, rgba(0,0,0,0.05))'
              : 'linear-gradient(to left, transparent, rgba(0,0,0,0.05))',
        }}
      />

      {/* Trailing edge shadow */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          width: 80,
          transform: `translateX(${wipeX + (directionMultiplier * 40)}px)`,
          background:
            direction === 'left'
              ? 'linear-gradient(to left, transparent, rgba(0,0,0,0.05))'
              : 'linear-gradient(to right, transparent, rgba(0,0,0,0.05))',
        }}
      />
    </AbsoluteFill>
  );
};

export default SceneDivider;
