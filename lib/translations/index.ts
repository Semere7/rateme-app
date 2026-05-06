import en from './en'
import he from './he'
import am from './am'

export type { Translation } from './en'

export type Locale = 'en' | 'he' | 'am'

export const LANGUAGES: { locale: Locale; label: string; dir: 'ltr' | 'rtl' }[] = [
  { locale: 'en', label: 'English',  dir: 'ltr' },
  { locale: 'he', label: 'עברית',    dir: 'rtl' },
  { locale: 'am', label: 'አማርኛ',    dir: 'ltr' },
]

const translations = { en, he, am }

export function getT(locale: Locale) {
  return translations[locale] ?? translations.en
}

export const LOCALE_COOKIE = 'rateme-locale'
