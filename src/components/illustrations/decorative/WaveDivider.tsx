'use client'

export default function WaveDivider({ className, flip }: { className?: string; flip?: boolean }) {
  return (
    <div className={`w-full overflow-hidden leading-[0] ${flip ? 'rotate-180' : ''} ${className || ''}`}>
      <svg
        viewBox="0 0 1440 40"
        preserveAspectRatio="none"
        className="w-full h-[20px] md:h-[30px]"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M0 20 C240 35, 480 5, 720 20 C960 35, 1200 5, 1440 20"
          stroke="#1E40AF"
          strokeWidth={1}
          strokeOpacity={0.06}
          fill="none"
        />
        <path
          d="M0 25 C240 10, 480 35, 720 25 C960 10, 1200 35, 1440 25"
          stroke="#60A5FA"
          strokeWidth={0.5}
          strokeOpacity={0.04}
          fill="none"
        />
      </svg>
    </div>
  )
}
