import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import './globals.css'
import { LanguageProvider } from '@/contexts/LanguageContext'
import { LOCALE_COOKIE } from '@/lib/translations'
import type { Locale } from '@/lib/translations'

export const metadata: Metadata = {
  title: 'RateMe - Rate Your Friends',
  description: 'A social platform to rate and get rated by friends',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = cookies()
  const locale = (cookieStore.get(LOCALE_COOKIE)?.value ?? 'en') as Locale
  const dir = locale === 'he' ? 'rtl' : 'ltr'

  return (
    <html lang={locale} dir={dir}>
      <body>
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  )
}
