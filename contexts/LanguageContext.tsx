'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { getT, LANGUAGES, LOCALE_COOKIE } from '@/lib/translations'
import type { Locale, Translation } from '@/lib/translations'

type LanguageContextValue = {
  locale:    Locale
  setLocale: (l: Locale) => void
  t:         Translation
  dir:       'ltr' | 'rtl'
}

const LanguageContext = createContext<LanguageContextValue>({
  locale:    'en',
  setLocale: () => {},
  t:         getT('en'),
  dir:       'ltr',
})

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en')

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(LOCALE_COOKIE) as Locale | null
    if (stored && LANGUAGES.some(l => l.locale === stored)) {
      apply(stored)
    }
  }, [])

  function apply(l: Locale) {
    const lang = LANGUAGES.find(x => x.locale === l)!
    setLocaleState(l)
    localStorage.setItem(LOCALE_COOKIE, l)
    // Write cookie so server components can read it
    document.cookie = `${LOCALE_COOKIE}=${l};path=/;max-age=31536000;SameSite=Lax`
    // Set RTL/LTR on the document
    document.documentElement.dir = lang.dir
    document.documentElement.lang = l
  }

  function setLocale(l: Locale) { apply(l) }

  const lang = LANGUAGES.find(x => x.locale === locale)!

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t: getT(locale), dir: lang.dir }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  return useContext(LanguageContext)
}
