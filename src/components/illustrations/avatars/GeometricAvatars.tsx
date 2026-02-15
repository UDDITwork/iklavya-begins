'use client'

/* 5 unique geometric avatar faces using the green palette.
   Each has distinct features: different hairstyles (geometric shapes),
   accessories (glasses, earring). Simple but distinguishable. */

function AvatarBase({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="avatarSkin" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#DCFCE7" stopOpacity={0.8} />
          <stop offset="100%" stopColor="#BBF7D0" stopOpacity={0.4} />
        </linearGradient>
        <linearGradient id="avatarHair" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#166534" stopOpacity={0.3} />
          <stop offset="100%" stopColor="#14532D" stopOpacity={0.15} />
        </linearGradient>
      </defs>
      {/* Background circle */}
      <circle cx={32} cy={32} r={30} fill="#F0FDF4" fillOpacity={0.5} stroke="#166534" strokeWidth={1} strokeOpacity={0.08} />
      {children}
    </svg>
  )
}

/* Avatar 1: Short spiky hair, round face */
export function Avatar1({ className }: { className?: string }) {
  return (
    <AvatarBase className={className}>
      {/* Hair — spiky top */}
      <path d="M 20 24 L 24 14 L 28 22 L 32 12 L 36 22 L 40 14 L 44 24" fill="url(#avatarHair)" />
      {/* Face */}
      <circle cx={32} cy={30} r={12} fill="url(#avatarSkin)" stroke="#166534" strokeWidth={1} strokeOpacity={0.12} />
      {/* Eyes */}
      <circle cx={27} cy={28} r={1.5} fill="#166534" fillOpacity={0.3} />
      <circle cx={37} cy={28} r={1.5} fill="#166534" fillOpacity={0.3} />
      {/* Smile */}
      <path d="M 28 33 Q 32 37 36 33" stroke="#166534" strokeWidth={1} strokeOpacity={0.15} strokeLinecap="round" fill="none" />
      {/* Shoulders */}
      <path d="M 18 50 Q 32 42 46 50" fill="url(#avatarSkin)" stroke="#166534" strokeWidth={1} strokeOpacity={0.08} />
    </AvatarBase>
  )
}

/* Avatar 2: Curly/wavy hair, glasses */
export function Avatar2({ className }: { className?: string }) {
  return (
    <AvatarBase className={className}>
      {/* Hair — wavy/curly */}
      <ellipse cx={32} cy={20} rx={14} ry={10} fill="url(#avatarHair)" />
      <circle cx={22} cy={22} r={4} fill="url(#avatarHair)" />
      <circle cx={42} cy={22} r={4} fill="url(#avatarHair)" />
      {/* Face */}
      <circle cx={32} cy={30} r={12} fill="url(#avatarSkin)" stroke="#166534" strokeWidth={1} strokeOpacity={0.12} />
      {/* Glasses */}
      <circle cx={27} cy={28} r={4} fill="none" stroke="#166534" strokeWidth={1} strokeOpacity={0.2} />
      <circle cx={37} cy={28} r={4} fill="none" stroke="#166534" strokeWidth={1} strokeOpacity={0.2} />
      <line x1={31} y1={28} x2={33} y2={28} stroke="#166534" strokeWidth={1} strokeOpacity={0.2} />
      {/* Eyes (inside glasses) */}
      <circle cx={27} cy={28} r={1.2} fill="#166534" fillOpacity={0.3} />
      <circle cx={37} cy={28} r={1.2} fill="#166534" fillOpacity={0.3} />
      {/* Smile */}
      <path d="M 28 34 Q 32 37 36 34" stroke="#166534" strokeWidth={1} strokeOpacity={0.15} strokeLinecap="round" fill="none" />
      {/* Shoulders */}
      <path d="M 18 50 Q 32 42 46 50" fill="url(#avatarSkin)" stroke="#166534" strokeWidth={1} strokeOpacity={0.08} />
    </AvatarBase>
  )
}

/* Avatar 3: Long straight hair (female-presenting), earring dot */
export function Avatar3({ className }: { className?: string }) {
  return (
    <AvatarBase className={className}>
      {/* Hair — long straight */}
      <path d="M 20 22 L 20 40 Q 20 42 22 42 L 22 24 Q 32 16 42 24 L 42 42 Q 44 42 44 40 L 44 22 Q 32 12 20 22Z" fill="url(#avatarHair)" />
      {/* Face */}
      <circle cx={32} cy={30} r={11} fill="url(#avatarSkin)" stroke="#166534" strokeWidth={1} strokeOpacity={0.12} />
      {/* Eyes */}
      <circle cx={28} cy={28} r={1.5} fill="#166534" fillOpacity={0.3} />
      <circle cx={36} cy={28} r={1.5} fill="#166534" fillOpacity={0.3} />
      {/* Earring */}
      <circle cx={20} cy={33} r={2} fill="#4ADE80" fillOpacity={0.25} stroke="#4ADE80" strokeWidth={0.5} strokeOpacity={0.3} />
      {/* Smile */}
      <path d="M 28 33 Q 32 36 36 33" stroke="#166534" strokeWidth={1} strokeOpacity={0.15} strokeLinecap="round" fill="none" />
      {/* Shoulders */}
      <path d="M 18 50 Q 32 42 46 50" fill="url(#avatarSkin)" stroke="#166534" strokeWidth={1} strokeOpacity={0.08} />
    </AvatarBase>
  )
}

/* Avatar 4: Flat top/cap style, no accessories */
export function Avatar4({ className }: { className?: string }) {
  return (
    <AvatarBase className={className}>
      {/* Hair — flat top / cap */}
      <rect x={20} y={16} width={24} height={8} rx={4} fill="url(#avatarHair)" />
      <rect x={19} y={20} width={26} height={4} rx={2} fill="url(#avatarHair)" />
      {/* Face */}
      <circle cx={32} cy={30} r={12} fill="url(#avatarSkin)" stroke="#166534" strokeWidth={1} strokeOpacity={0.12} />
      {/* Eyes */}
      <circle cx={27} cy={28} r={1.5} fill="#166534" fillOpacity={0.3} />
      <circle cx={37} cy={28} r={1.5} fill="#166534" fillOpacity={0.3} />
      {/* Mouth — wider grin */}
      <path d="M 27 34 Q 32 38 37 34" stroke="#166534" strokeWidth={1} strokeOpacity={0.15} strokeLinecap="round" fill="none" />
      {/* Shoulders */}
      <path d="M 18 50 Q 32 42 46 50" fill="url(#avatarSkin)" stroke="#166534" strokeWidth={1} strokeOpacity={0.08} />
    </AvatarBase>
  )
}

/* Avatar 5: Side-parted hair, small beard */
export function Avatar5({ className }: { className?: string }) {
  return (
    <AvatarBase className={className}>
      {/* Hair — side parted */}
      <path d="M 20 24 Q 22 14 32 14 Q 44 14 44 24 L 44 22 Q 44 18 38 16 Q 32 14 26 18 Q 20 22 20 24Z" fill="url(#avatarHair)" />
      {/* Part line */}
      <line x1={28} y1={14} x2={26} y2={22} stroke="#14532D" strokeWidth={0.5} strokeOpacity={0.15} />
      {/* Face */}
      <circle cx={32} cy={30} r={12} fill="url(#avatarSkin)" stroke="#166534" strokeWidth={1} strokeOpacity={0.12} />
      {/* Eyes */}
      <circle cx={27} cy={28} r={1.5} fill="#166534" fillOpacity={0.3} />
      <circle cx={37} cy={28} r={1.5} fill="#166534" fillOpacity={0.3} />
      {/* Small beard */}
      <path d="M 27 36 Q 32 40 37 36" fill="url(#avatarHair)" stroke="none" />
      {/* Shoulders */}
      <path d="M 18 50 Q 32 42 46 50" fill="url(#avatarSkin)" stroke="#166534" strokeWidth={1} strokeOpacity={0.08} />
    </AvatarBase>
  )
}

const avatars = [Avatar1, Avatar2, Avatar3, Avatar4, Avatar5]

export default function GeometricAvatar({ index, className }: { index: number; className?: string }) {
  const AvatarComp = avatars[index % avatars.length]
  return <AvatarComp className={className} />
}
