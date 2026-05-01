import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'RateMe - Rate Your Friends',
  description: 'A social platform to rate and get rated by friends',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
