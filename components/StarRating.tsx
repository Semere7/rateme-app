'use client'

type StarRatingProps = {
  value: number
  max?: number
  onChange?: (value: number) => void
  size?: 'sm' | 'md' | 'lg'
  readonly?: boolean
}

export default function StarRating({
  value,
  max = 5,
  onChange,
  size = 'md',
  readonly = false,
}: StarRatingProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  }

  return (
    <div className="flex gap-1">
      {Array.from({ length: max }, (_, i) => i + 1).map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => !readonly && onChange?.(star)}
          disabled={readonly}
          className={`${sizeClasses[size]} transition-transform ${
            readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'
          }`}
          aria-label={`${star} star${star !== 1 ? 's' : ''}`}
        >
          <svg
            viewBox="0 0 24 24"
            fill={star <= value ? '#FBBF24' : 'none'}
            stroke={star <= value ? '#FBBF24' : '#D1D5DB'}
            strokeWidth={1.5}
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
            />
          </svg>
        </button>
      ))}
    </div>
  )
}
