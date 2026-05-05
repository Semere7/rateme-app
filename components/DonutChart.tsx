'use client'

const RADIUS = 36
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

type Props = {
  label: string
  percentage: number  // 0–100
}

export default function DonutChart({ label, percentage }: Props) {
  const clamped = Math.min(100, Math.max(0, percentage))
  const offset = CIRCUMFERENCE - (clamped / 100) * CIRCUMFERENCE

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-24 h-24">
        <svg viewBox="0 0 88 88" className="w-full h-full -rotate-90">
          {/* Track */}
          <circle
            cx="44"
            cy="44"
            r={RADIUS}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="10"
          />
          {/* Progress */}
          <circle
            cx="44"
            cy="44"
            r={RADIUS}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="10"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={offset}
            className="transition-all duration-700 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-base font-bold text-gray-800">
            {clamped === 0 ? '—' : `${Math.round(clamped)}%`}
          </span>
        </div>
      </div>
      <span className="text-xs font-medium text-gray-500">{label}</span>
    </div>
  )
}
