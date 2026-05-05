const sizes = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-20 h-20 text-3xl',
}

type Props = {
  src?: string | null
  name: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export default function Avatar({ src, name, size = 'md', className = '' }: Props) {
  const base = `${sizes[size]} rounded-full shrink-0 overflow-hidden ${className}`
  const initial = name?.charAt(0)?.toUpperCase() ?? '?'

  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={name}
        className={`${base} object-cover`}
      />
    )
  }

  return (
    <div className={`${base} bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold`}>
      {initial}
    </div>
  )
}
