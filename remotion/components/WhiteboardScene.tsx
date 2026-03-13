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

interface WhiteboardSceneProps {
  title: string;
  keyPoints: string[];
  segmentIndex: number;
}

const TypewriterText: React.FC<{
  text: string;
  startFrame: number;
  style?: React.CSSProperties;
}> = ({ text, startFrame, style }) => {
  const frame = useCurrentFrame();
  const elapsed = frame - startFrame;
  const charsPerFrame = 0.8;
  const visibleChars = Math.min(
    Math.floor(Math.max(0, elapsed) * charsPerFrame),
    text.length
  );
  const displayedText = text.slice(0, visibleChars);
  const cursorOpacity =
    visibleChars < text.length ? (Math.floor(elapsed / 8) % 2 === 0 ? 1 : 0) : 0;

  return (
    <span style={style}>
      {displayedText}
      <span
        style={{
          opacity: cursorOpacity,
          color: ACCENT_GREEN,
          fontWeight: 300,
        }}
      >
        |
      </span>
    </span>
  );
};

const BulletLine: React.FC<{
  progress: number;
  width: number;
}> = ({ progress, width }) => {
  const dashLength = width;
  const dashOffset = interpolate(progress, [0, 1], [dashLength, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <svg
      width={width}
      height={3}
      style={{ position: 'absolute', left: 48, top: '50%', transform: 'translateY(-0.5px)' }}
    >
      <line
        x1={0}
        y1={1.5}
        x2={width}
        y2={1.5}
        stroke={ACCENT_GREEN}
        strokeWidth={2}
        strokeDasharray={dashLength}
        strokeDashoffset={dashOffset}
        strokeLinecap="round"
        opacity={0.25}
      />
    </svg>
  );
};

const CheckmarkIcon: React.FC<{
  progress: number;
}> = ({ progress }) => {
  const pathLength = 24;
  const dashOffset = interpolate(progress, [0, 1], [pathLength, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <svg width={22} height={22} viewBox="0 0 22 22" style={{ flexShrink: 0, marginTop: 2 }}>
      <circle cx={11} cy={11} r={10} fill={ACCENT_GREEN} opacity={progress * 0.15} />
      <path
        d="M6 11.5 L9.5 15 L16 7"
        fill="none"
        stroke={ACCENT_GREEN}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={pathLength}
        strokeDashoffset={dashOffset}
      />
    </svg>
  );
};

const KeyPointItem: React.FC<{
  text: string;
  index: number;
  appearFrame: number;
}> = ({ text, index, appearFrame }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entryProgress = spring({
    frame: frame - appearFrame,
    fps,
    config: { damping: 14, stiffness: 120, mass: 0.8 },
  });

  const opacity = interpolate(entryProgress, [0, 0.5], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const translateY = interpolate(entryProgress, [0, 1], [20, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const lineDrawProgress = interpolate(
    frame - appearFrame,
    [0, 15],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const iconProgress = interpolate(
    frame - appearFrame,
    [5, 20],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const textStartFrame = appearFrame + 10;

  if (frame < appearFrame) return null;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 14,
        marginBottom: 28,
        opacity,
        transform: `translateY(${translateY}px)`,
        position: 'relative',
      }}
    >
      <CheckmarkIcon progress={iconProgress} />
      <BulletLine progress={lineDrawProgress} width={Math.min(text.length * 8, 500)} />
      <TypewriterText
        text={text}
        startFrame={textStartFrame}
        style={{
          fontSize: 28,
          fontFamily: 'system-ui, -apple-system, sans-serif',
          color: TEXT_COLOR,
          lineHeight: 1.5,
          fontWeight: 400,
        }}
      />
    </div>
  );
};

export const WhiteboardScene: React.FC<WhiteboardSceneProps> = ({
  title,
  keyPoints,
  segmentIndex,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleEntryProgress = spring({
    frame,
    fps,
    config: { damping: 16, stiffness: 100, mass: 0.6 },
  });

  const titleOpacity = interpolate(titleEntryProgress, [0, 0.6], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const titleTranslateY = interpolate(titleEntryProgress, [0, 1], [-15, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const titleUnderlineWidth = interpolate(
    frame,
    [15, 40],
    [0, 100],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const TITLE_DURATION = 30;
  const KEY_POINT_SPACING = 50;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: BACKGROUND,
        padding: 60,
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      {/* Subtle grid pattern */}
      <svg
        style={{ position: 'absolute', inset: 0, opacity: 0.04 }}
        width="100%"
        height="100%"
      >
        <defs>
          <pattern id={`grid-${segmentIndex}`} width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke={TEXT_COLOR} strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#grid-${segmentIndex})`} />
      </svg>

      {/* Segment indicator */}
      <div
        style={{
          position: 'absolute',
          top: 24,
          right: 32,
          fontSize: 14,
          color: ACCENT_GREEN,
          fontWeight: 600,
          opacity: titleOpacity,
          letterSpacing: 1,
        }}
      >
        SEGMENT {segmentIndex + 1}
      </div>

      {/* Title */}
      <div
        style={{
          opacity: titleOpacity,
          transform: `translateY(${titleTranslateY}px)`,
          marginBottom: 48,
          position: 'relative',
        }}
      >
        <TypewriterText
          text={title}
          startFrame={5}
          style={{
            fontSize: 42,
            fontWeight: 700,
            color: TEXT_COLOR,
            letterSpacing: -0.5,
          }}
        />
        <div
          style={{
            height: 3,
            backgroundColor: ACCENT_GREEN,
            width: `${titleUnderlineWidth}%`,
            marginTop: 10,
            borderRadius: 2,
          }}
        />
      </div>

      {/* Key points */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        {keyPoints.map((point, index) => {
          const appearFrame = TITLE_DURATION + index * KEY_POINT_SPACING;
          return (
            <KeyPointItem
              key={index}
              text={point}
              index={index}
              appearFrame={appearFrame}
            />
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

export default WhiteboardScene;
