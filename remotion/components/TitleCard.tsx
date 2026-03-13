import React from 'react';
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  AbsoluteFill,
} from 'remotion';

const BACKGROUND = '#FAFAFA';
const TEXT_COLOR = '#1A1A1A';
const ACCENT_GREEN = '#166534';

interface TitleCardProps {
  title: string;
  subtitle?: string;
  moduleNumber?: number;
}

export const TitleCard: React.FC<TitleCardProps> = ({
  title,
  subtitle,
  moduleNumber,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Main entry spring
  const entrySpring = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 90, mass: 0.7 },
  });

  // Scale from slightly larger to 1
  const scale = interpolate(entrySpring, [0, 1], [1.08, 1]);

  // Opacity fade-in
  const opacity = interpolate(entrySpring, [0, 0.4], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Subtitle appears slightly after title
  const subtitleSpring = spring({
    frame: frame - 12,
    fps,
    config: { damping: 16, stiffness: 100, mass: 0.6 },
  });

  const subtitleOpacity = interpolate(subtitleSpring, [0, 0.5], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const subtitleTranslateY = interpolate(subtitleSpring, [0, 1], [12, 0]);

  // Module number badge animation
  const badgeSpring = spring({
    frame: frame - 5,
    fps,
    config: { damping: 12, stiffness: 120, mass: 0.5 },
  });

  const badgeScale = interpolate(badgeSpring, [0, 1], [0, 1]);

  // Decorative line width animation
  const lineWidth = interpolate(frame, [10, 45], [0, 120], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Fade out at the end (last 15 frames of 90-frame duration)
  const fadeOut = interpolate(frame, [75, 90], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: BACKGROUND,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        opacity: opacity * fadeOut,
        transform: `scale(${scale})`,
      }}
    >
      {/* Background decorative circles */}
      <div
        style={{
          position: 'absolute',
          width: 400,
          height: 400,
          borderRadius: '50%',
          border: `2px solid ${ACCENT_GREEN}`,
          opacity: 0.06,
          top: '10%',
          right: '-5%',
          transform: `scale(${entrySpring})`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: 250,
          height: 250,
          borderRadius: '50%',
          border: `2px solid ${ACCENT_GREEN}`,
          opacity: 0.04,
          bottom: '5%',
          left: '-3%',
          transform: `scale(${entrySpring})`,
        }}
      />

      {/* Content container */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          maxWidth: '80%',
        }}
      >
        {/* Module number badge */}
        {moduleNumber !== undefined && (
          <div
            style={{
              backgroundColor: ACCENT_GREEN,
              color: '#FFFFFF',
              fontSize: 14,
              fontWeight: 700,
              padding: '6px 20px',
              borderRadius: 20,
              marginBottom: 24,
              letterSpacing: 2,
              textTransform: 'uppercase',
              transform: `scale(${badgeScale})`,
            }}
          >
            Module {moduleNumber}
          </div>
        )}

        {/* Title */}
        <h1
          style={{
            fontSize: 56,
            fontWeight: 800,
            color: TEXT_COLOR,
            margin: 0,
            lineHeight: 1.2,
            letterSpacing: -1,
          }}
        >
          {title}
        </h1>

        {/* Decorative line */}
        <div
          style={{
            width: lineWidth,
            height: 3,
            backgroundColor: ACCENT_GREEN,
            marginTop: 20,
            marginBottom: 20,
            borderRadius: 2,
          }}
        />

        {/* Subtitle */}
        {subtitle && (
          <p
            style={{
              fontSize: 24,
              fontWeight: 400,
              color: '#666666',
              margin: 0,
              lineHeight: 1.5,
              opacity: subtitleOpacity,
              transform: `translateY(${subtitleTranslateY}px)`,
              maxWidth: 600,
            }}
          >
            {subtitle}
          </p>
        )}
      </div>

      {/* iKlavya branding */}
      <div
        style={{
          position: 'absolute',
          bottom: 32,
          right: 40,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          opacity: subtitleOpacity,
        }}
      >
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            backgroundColor: ACCENT_GREEN,
          }}
        />
        <span
          style={{
            fontSize: 16,
            fontWeight: 600,
            color: ACCENT_GREEN,
            letterSpacing: 1.5,
          }}
        >
          iKlavya
        </span>
      </div>
    </AbsoluteFill>
  );
};

export default TitleCard;
