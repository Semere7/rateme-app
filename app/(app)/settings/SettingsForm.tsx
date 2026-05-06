'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import { LANGUAGES } from '@/lib/translations'

export default function SettingsForm() {
  const { locale, setLocale, t } = useLanguage()

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">{t.nav.settings}</h1>
      <div className="card p-6">
        <h2 className="text-sm font-semibold text-gray-800 mb-0.5">{t.nav.language}</h2>
        <p className="text-xs text-gray-400 mb-3">Choose your preferred app language</p>
        <div className="flex gap-2">
          {LANGUAGES.map(lang => (
            <button
              key={lang.locale}
              type="button"
              onClick={() => setLocale(lang.locale)}
              className={[
                'flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-colors',
                locale === lang.locale
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'text-gray-700 border-gray-200 hover:bg-gray-50',
              ].join(' ')}
            >
              {lang.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
