'use client'

import { useState, useEffect, useRef } from 'react'
import { SalaryProfile } from '@/types'
import {
  SALARY_FIELDS, EXPERIENCE_LEVELS, COUNTRY_LIST,
  EMPLOYMENT_TYPES, CURRENCIES,
} from '@/lib/salary'

// ─── Country searchable dropdown ──────────────────────────────────────────────

function CountrySelect({
  value,
  onChange,
  inputClass,
}: {
  value: string
  onChange: (v: string) => void
  inputClass: string
}) {
  const [search, setSearch]   = useState('')
  const [open, setOpen]       = useState(false)
  const containerRef          = useRef<HTMLDivElement>(null)
  const searchRef             = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) searchRef.current?.focus()
  }, [open])

  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
        setSearch('')
      }
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [])

  const filtered = search.trim()
    ? COUNTRY_LIST.filter(c => c.toLowerCase().includes(search.toLowerCase()))
    : COUNTRY_LIST

  function select(country: string) {
    onChange(country)
    setSearch('')
    setOpen(false)
  }

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger button — shows selected value or placeholder */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={`${inputClass} flex items-center justify-between text-left`}
      >
        <span className={value ? 'text-gray-800' : 'text-gray-400'}>
          {value || 'Select country'}
        </span>
        <svg
          className={`w-4 h-4 text-gray-400 shrink-0 transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-20 top-full mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
          {/* Search input */}
          <div className="p-2 border-b border-gray-100">
            <input
              ref={searchRef}
              type="text"
              placeholder="Search country…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full rounded-md border border-gray-200 px-2.5 py-1.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>

          {/* Results */}
          <div className="max-h-48 overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="px-3 py-2.5 text-sm text-gray-400">No countries found</p>
            ) : (
              filtered.map(country => (
                <button
                  key={country}
                  type="button"
                  onClick={() => select(country)}
                  className={[
                    'w-full text-left px-3 py-2 text-sm transition-colors',
                    country === value
                      ? 'bg-blue-50 text-blue-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-50',
                  ].join(' ')}
                >
                  {country}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Known field values for detecting custom entries when loading ──────────────

const KNOWN_FIELDS = SALARY_FIELDS.map(f => f.value) as string[]

// ─── Form state ───────────────────────────────────────────────────────────────

type FormState = {
  salary_min:              string
  salary_max:              string
  currency:                string
  field:                   string  // dropdown value; 'other' when custom
  custom_field:            string  // used when field === 'other'
  experience_level:        string
  country:                 string  // always a value from COUNTRY_LIST
  employment_type:         string
  include_in_benchmarks:   boolean
}

function makeFormState(p: SalaryProfile | null): FormState {
  const knownField = p?.field && KNOWN_FIELDS.includes(p.field)
  return {
    salary_min:             p ? String(p.salary_min) : '',
    salary_max:             p ? String(p.salary_max) : '',
    currency:               p?.currency         ?? 'ILS',
    field:                  knownField ? p!.field : p?.field ? 'other' : '',
    custom_field:           knownField ? ''       : p?.field ?? '',
    experience_level:       p?.experience_level ?? '',
    country:                p?.country          ?? '',
    employment_type:        p?.employment_type  ?? '',
    include_in_benchmarks:  p?.include_in_benchmarks ?? true,
  }
}

// ─── Form component ───────────────────────────────────────────────────────────

export default function SalaryProfileForm({
  profile,
  onSaved,
  onCancel,
}: {
  profile:  SalaryProfile | null
  onSaved:  (saved: SalaryProfile) => void
  onCancel?: () => void
}) {
  const [form, setForm]     = useState<FormState>(makeFormState(profile))
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState<string | null>(null)

  function set(key: keyof FormState, value: string) {
    setForm(f => ({ ...f, [key]: value }))
    setError(null)
  }

  function toggle(key: keyof FormState) {
    setForm(f => ({ ...f, [key]: !f[key] }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const min = Number(form.salary_min)
    const max = Number(form.salary_max)

    if (!form.salary_min || !form.salary_max || isNaN(min) || isNaN(max))
      return setError('Enter a valid salary range.')
    if (min < 0 || max < min)
      return setError('Maximum must be greater than or equal to minimum.')
    if (!form.field)
      return setError('Select a field.')
    if (form.field === 'other' && !form.custom_field.trim())
      return setError('Enter your field.')
    if (!form.experience_level)
      return setError('Select an experience level.')
    if (!form.country || !COUNTRY_LIST.includes(form.country))
      return setError('Select a country from the list.')
    if (!form.employment_type)
      return setError('Select an employment type.')

    const fieldValue = form.field === 'other' ? form.custom_field.trim() : form.field

    setSaving(true)
    try {
      const res = await fetch('/api/salary/me', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          salary_min:             min,
          salary_max:             max,
          currency:               form.currency,
          field:                  fieldValue,
          experience_level:       form.experience_level,
          country:                form.country,
          employment_type:        form.employment_type,
          include_in_benchmarks:  form.include_in_benchmarks,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Failed to save')
      onSaved(json.profile)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const labelClass  = 'block text-xs font-semibold text-gray-600 mb-1'
  const inputClass  = 'w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 bg-white'
  const selectClass = inputClass

  return (
    <form onSubmit={handleSubmit} className="space-y-4">

      {/* Salary range + currency */}
      <div>
        <label className={labelClass}>Monthly salary range</label>
        <div className="flex gap-2 items-center">
          <select
            value={form.currency}
            onChange={e => set('currency', e.target.value)}
            className="rounded-lg border border-gray-200 px-2 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white shrink-0"
          >
            {CURRENCIES.map(c => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
          <input
            type="number"
            min={0}
            placeholder="Min"
            value={form.salary_min}
            onChange={e => set('salary_min', e.target.value)}
            className={inputClass}
          />
          <span className="text-gray-400 text-sm shrink-0">–</span>
          <input
            type="number"
            min={0}
            placeholder="Max"
            value={form.salary_max}
            onChange={e => set('salary_max', e.target.value)}
            className={inputClass}
          />
        </div>
        <p className="text-xs text-gray-400 mt-1">
          Use a range instead of an exact number for better privacy and accuracy.
        </p>
      </div>

      {/* Field / profession */}
      <div>
        <label className={labelClass}>Field / profession</label>
        <select
          value={form.field}
          onChange={e => set('field', e.target.value)}
          className={selectClass}
        >
          <option value="">Select a field</option>
          {SALARY_FIELDS.map(f => (
            <option key={f.value} value={f.value}>{f.label}</option>
          ))}
        </select>
        {form.field === 'other' && (
          <input
            type="text"
            placeholder="Enter your field"
            value={form.custom_field}
            onChange={e => set('custom_field', e.target.value)}
            className={`${inputClass} mt-2`}
            autoFocus
          />
        )}
      </div>

      {/* Experience level */}
      <div>
        <label className={labelClass}>Experience level</label>
        <select
          value={form.experience_level}
          onChange={e => set('experience_level', e.target.value)}
          className={selectClass}
        >
          <option value="">Select experience</option>
          {EXPERIENCE_LEVELS.map(e => (
            <option key={e.value} value={e.value}>{e.label}</option>
          ))}
        </select>
      </div>

      {/* Country — searchable validated dropdown */}
      <div>
        <label className={labelClass}>Country</label>
        <CountrySelect
          value={form.country}
          onChange={v => set('country', v)}
          inputClass={inputClass}
        />
      </div>

      {/* Employment type */}
      <div>
        <label className={labelClass}>Employment type</label>
        <select
          value={form.employment_type}
          onChange={e => set('employment_type', e.target.value)}
          className={selectClass}
        >
          <option value="">Select type</option>
          {EMPLOYMENT_TYPES.map(e => (
            <option key={e.value} value={e.value}>{e.label}</option>
          ))}
        </select>
      </div>

      {/* Benchmark opt-in */}
      <div className="flex items-start gap-3 rounded-lg border border-gray-100 bg-gray-50 px-3 py-3">
        <input
          id="include_in_benchmarks"
          type="checkbox"
          checked={form.include_in_benchmarks}
          onChange={() => toggle('include_in_benchmarks')}
          className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-400 shrink-0 cursor-pointer"
        />
        <div>
          <label htmlFor="include_in_benchmarks" className="text-sm font-medium text-gray-800 cursor-pointer select-none">
            Use my salary anonymously in benchmarks
          </label>
          <p className="text-xs text-gray-500 mt-0.5">
            Your exact salary stays private. It is only used in anonymous aggregate calculations.
          </p>
        </div>
      </div>

      {error && (
        <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
      )}

      <div className="flex gap-2 pt-1">
        <button
          type="submit"
          disabled={saving}
          className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-semibold py-2 rounded-lg transition-colors"
        >
          {saving ? 'Saving…' : profile ? 'Update salary profile' : 'Save & see insights'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}
