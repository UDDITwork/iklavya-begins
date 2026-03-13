import React from 'react';
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  AbsoluteFill,
} from 'remotion';

const ACCENT_GREEN = '#166534';
const GREEN_LIGHT = '#22c55e';

export const QuizTransition: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entry animation
  const entrySpring = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 100, mass: 0.6 },
  });

  const scale = interpolate(entrySpring, [0, 1], [0.85, 1]);
  const opacity = interpolate(entrySpring, [0, 0.4], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Pulse animation for the icon
  const pulsePhase = Math.sin(frame * 0.2) * 0.5 + 0.5;
  const pulseScale = interpolate(pulsePhase, [0, 1], [1, 1.1]);
  const pulseOpacity = interpolate(pulsePhase, [0, 1], [0.6, 1]);

  // Ring expanding animation
  const ringScale = interpolate(frame % 40, [0, 40], [0.8, 1.6]);
  const ringOpacity = interpolate(frame % 40, [0, 40], [0.4, 0]);

  // Fade out toward end (60-frame duration)
  const fadeOut = interpolate(frame, [48, 60], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Subtitle text entry
  const subtitleOpacity = interpolate(frame, [15, 25], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(135deg, ${ACCENT_GREEN} 0%, #14532d 50%, #052e16 100%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        opacity: opacity * fadeOut,
        transform: `scale(${scale})`,
      }}
    >
      {/* Animated background rings */}
      <div
        style={{
          position: 'absolute',
          width: 200,
          height: 200,
          borderRadius: '50%',
          border: '2px solid rgba(255, 255, 255, 0.3)',
          transform: `scale(${ringScale})`,
          opacity: ringOpacity,
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: 200,
          height: 200,
          borderRadius: '50%',
          border: '2px solid rgba(255, 255, 255, 0.2)',
          transform: `scale(${interpolate((frame + 20) % 40, [0, 40], [0.8, 1.6])})`,
          opacity: interpolate((frame + 20) % 40, [0, 40], [0.3, 0]),
        }}
      />

      {/* Content */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 20,
        }}
      >
        {/* Question mark icon with pulse */}
        <div
          style={{
            transform: `scale(${pulseScale})`,
            opacity: pulseOpacity,
          }}
        >
          <svg width={80} height={80} viewBox="0 0 80 80">
            <circle cx={40} cy={40} r={36} fill="rgba(255,255,255,0.15)" />
            <circle cx={40} cy={40} r={28} fill="rgba(255,255,255,0.1)" />
            <text
              x={40}
              y={48}
              textAnchor="middle"
              fontSize={36}
              fontWeight={700}
              fill="#FFFFFF"
              fontFamily="system-ui, -apple-system, sans-serif"
            >
              ?
            </text>
          </svg>
        </div>

        {/* Main text */}
        <h2
          style={{
            color: '#FFFFFF',
            fontSize: 48,
            fontWeight: 800,
            margin: 0,
            letterSpacing: -0.5,
            textShadow: '0 2px 8px rgba(0,0,0,0.2)',
          }}
        >
          Knowledge Check
        </h2>

        {/* Subtitle */}
        <p
          style={{
            color: 'rgba(255, 255, 255, 0.75)',
            fontSize: 20,
            fontWeight: 400,
            margin: 0,
            opacity: subtitleOpacity,
          }}
        >
          Test your understanding
        </p>
      </div>

      {/* Corner accents */}
      <div
        style={{
          position: 'absolute',
          top: 24,
          left: 24,
          width: 40,
          height: 40,
          borderTop: '3px solid rgba(255,255,255,0.3)',
          borderLeft: '3px solid rgba(255,255,255,0.3)',
          opacity: entrySpring,
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: 24,
          right: 24,
          width: 40,
          height: 40,
          borderBottom: '3px solid rgba(255,255,255,0.3)',
          borderRight: '3px solid rgba(255,255,255,0.3)',
          opacity: entrySpring,
        }}
      />
    </AbsoluteFill>
  );
};

export default QuizTransition;
