'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ACHIEVEMENT_TYPES,
  ACHIEVEMENT_CATEGORIES,
  IMPACT_LEVELS,
  CATEGORY_STYLES,
  getAchievementDefaults,
} from '@/lib/achievements'
import type { AchievementCategory } from '@/lib/achievements'

type Props = {
  trigger?: React.ReactNode
}

export default function AddAchievementModal({ trigger }: Props) {
  const [open, setOpen]               = useState(false)
  const [achievementType, setAchievementType] = useState('')
  const [title, setTitle]             = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState('')
  const router = useRouter()

  const selectedType = ACHIEVEMENT_TYPES.find((a) => a.type === achievementType) ?? null
  const defaults     = achievementType ? getAchievementDefaults(achievementType) : null

  function openModal()  { setOpen(true) }
  function closeModal() {
    setOpen(false)
    setAchievementType(''); setTitle(''); setDescription(''); setError(''); setLoading(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedType) return
    setLoading(true)
    setError('')

    const res = await fetch('/api/achievements', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        achievement_type: achievementType,
        title:       title.trim() || selectedType.label,
        description: description.trim(),
      }),
    })

    const json = await res.json()

    if (!res.ok) {
      setError(json.error ?? 'Failed to add achievement')
      setLoading(false)
      return
    }

    closeModal()
    router.refresh()
  }

  return (
    <>
      <span onClick={openModal} className="cursor-pointer">
        {trigger ?? (
          <button type="button" className="btn-primary text-sm px-3 py-1.5">
            + Add Achievement
          </button>
        )}
      </span>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onMouseDown={(e) => { if (e.target === e.currentTarget) closeModal() }}
        >
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md flex flex-col max-h-[90vh]">

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
              <h2 className="text-lg font-semibold text-gray-800">Add Achievement</h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 text-xl leading-none" aria-label="Close">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
              )}

              {/* Achievement type */}
              <div>
                <label className="label">Achievement Type</label>
                <select
                  className="input"
                  value={achievementType}
                  onChange={(e) => { setAchievementType(e.target.value); setTitle('') }}
                  required
                >
                  <option value="">Select type…</option>
                  {ACHIEVEMENT_TYPES.map((a) => (
                    <option key={a.type} value={a.type}>
                      {a.icon} {a.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Points preview — shown once a type is selected */}
              {selectedType && defaults && (
                <div className="flex items-center gap-3 px-4 py-3 bg-blue-50 rounded-xl border border-blue-100">
                  <span className="text-3xl shrink-0">{selectedType.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-blue-900 text-sm">{selectedType.label}</p>
                    <div className="flex flex-wrap items-center gap-1.5 mt-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold border ${CATEGORY_STYLES[defaults.category as AchievementCategory]}`}>
                        {ACHIEVEMENT_CATEGORIES[defaults.category as AchievementCategory].label}
                      </span>
                      <span className="text-xs text-blue-500">
                        Impact {defaults.impactLevel}/5 · {IMPACT_LEVELS.find((l) => l.level === defaults.impactLevel)?.label}
                      </span>
                    </div>
                    <p className="text-xs text-blue-700 font-bold mt-1">
                      {ACHIEVEMENT_CATEGORIES[defaults.category as AchievementCategory].weight} × {defaults.impactLevel} = +{defaults.points} points
                    </p>
                  </div>
                </div>
              )}

              {/* Title */}
              <div>
                <label className="label">
                  Title <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <input
                  className="input"
                  placeholder={selectedType ? selectedType.label : 'e.g. MIT, AWS Solutions Architect, Google…'}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={100}
                />
                <p className="text-xs text-gray-400 mt-1">Specify the institution, company, or certification name</p>
              </div>

              {/* Description */}
              <div>
                <label className="label">
                  Description <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <textarea
                  className="input resize-none"
                  rows={2}
                  placeholder="Add extra details…"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={300}
                />
              </div>

              {/* Note */}
              <p className="text-xs text-gray-400 bg-gray-50 rounded-lg px-3 py-2.5">
                Points are fixed per achievement type and count toward your score immediately.
              </p>

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={closeModal} disabled={loading} className="btn-secondary flex-1">
                  Cancel
                </button>
                <button type="submit" disabled={loading || !selectedType} className="btn-primary flex-1">
                  {loading ? 'Adding…' : defaults ? `Add · +${defaults.points} pts` : 'Add Achievement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
