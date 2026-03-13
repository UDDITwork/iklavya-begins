import React from 'react';
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  AbsoluteFill,
} from 'remotion';

const ACCENT_GREEN = '#166534';

interface HandCursorProps {
  /** Array of { x, y, frame } positions the cursor should visit */
  waypoints: Array<{ x: number; y: number; frame: number }>;
  /** Whether to show the cursor (defaults to true) */
  visible?: boolean;
}

const PenIcon: React.FC<{ opacity: number }> = ({ opacity }) => (
  <svg
    width={32}
    height={32}
    viewBox="0 0 32 32"
    style={{ opacity, filter: 'drop-shadow(1px 2px 3px rgba(0,0,0,0.15))' }}
  >
    {/* Pen body */}
    <path
      d="M6 26 L4 28 L8 27 L26 9 L23 6 Z"
      fill="#333333"
      stroke="#222222"
      strokeWidth={0.5}
    />
    {/* Pen tip */}
    <path
      d="M4 28 L6 26 L5.2 27.5 Z"
      fill={ACCENT_GREEN}
    />
    {/* Pen top edge highlight */}
    <path
      d="M23 6 L26 9 L27 8 L24 5 Z"
      fill="#555555"
    />
    {/* Eraser band */}
    <path
      d="M24 5 L27 8 L28 7 L25 4 Z"
      fill="#CC4444"
    />
  </svg>
);

export const HandCursor: React.FC<HandCursorProps> = ({
  waypoints,
  visible = true,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  if (!visible || waypoints.length === 0) return null;

  // Find current and next waypoint
  let currentWaypointIndex = 0;
  for (let i = 0; i < waypoints.length; i++) {
    if (frame >= waypoints[i].frame) {
      currentWaypointIndex = i;
    }
  }

  const currentWaypoint = waypoints[currentWaypointIndex];
  const nextWaypoint = waypoints[Math.min(currentWaypointIndex + 1, waypoints.length - 1)];

  // Compute position with spring animation for natural movement
  let x: number;
  let y: number;

  if (currentWaypointIndex === waypoints.length - 1 || currentWaypoint === nextWaypoint) {
    // At the last waypoint, stay put
    x = currentWaypoint.x;
    y = currentWaypoint.y;
  } else {
    const transitionProgress = spring({
      frame: frame - currentWaypoint.frame,
      fps,
      config: {
        damping: 12,
        stiffness: 80,
        mass: 0.5,
        overshootClamping: false,
      },
      durationInFrames: nextWaypoint.frame - currentWaypoint.frame,
    });

    x = interpolate(transitionProgress, [0, 1], [currentWaypoint.x, nextWaypoint.x]);
    y = interpolate(transitionProgress, [0, 1], [currentWaypoint.y, nextWaypoint.y]);
  }

  // Fade in at first waypoint, fade out after last
  const fadeIn = interpolate(
    frame,
    [waypoints[0].frame - 5, waypoints[0].frame],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const lastFrame = waypoints[waypoints.length - 1].frame;
  const fadeOut = interpolate(
    frame,
    [lastFrame + 10, lastFrame + 20],
    [1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const opacity = fadeIn * fadeOut;

  // Slight wobble during movement for natural feel
  const isMoving =
    currentWaypointIndex < waypoints.length - 1 &&
    frame >= currentWaypoint.frame &&
    frame < nextWaypoint.frame;

  const wobbleX = isMoving ? Math.sin(frame * 0.8) * 1.5 : 0;
  const wobbleY = isMoving ? Math.cos(frame * 1.1) * 1.0 : 0;

  // Subtle rotation that follows movement direction
  let rotation = -45; // default pen angle
  if (isMoving) {
    const dx = nextWaypoint.x - currentWaypoint.x;
    const dy = nextWaypoint.y - currentWaypoint.y;
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);
    rotation = angle - 135;
  }

  if (frame < waypoints[0].frame - 5) return null;

  return (
    <AbsoluteFill style={{ pointerEvents: 'none', zIndex: 100 }}>
      <div
        style={{
          position: 'absolute',
          left: x + wobbleX,
          top: y + wobbleY,
          transform: `rotate(${rotation}deg)`,
          transformOrigin: '4px 28px',
          transition: 'transform 0.05s ease',
        }}
      >
        <PenIcon opacity={opacity} />
      </div>
    </AbsoluteFill>
  );
};

export default HandCursor;
