'use client'

import { useState } from 'react'
import StarRating from './StarRating'

type RatingFormProps = {
  rateeId: string
  rateeName: string
  existingRating?: {
    trust: number
    communication: number
    helpfulness: number
    respect: number
    comment: string
  } | null
  onSuccess: () => void
}

const categories = [
  { key: 'trust', label: 'Trust', description: 'How trustworthy is this person?' },
  { key: 'communication', label: 'Communication', description: 'How well do they communicate?' },
  { key: 'helpfulness', label: 'Helpfulness', description: 'How helpful are they?' },
  { key: 'respect', label: 'Respect', description: 'How respectful are they?' },
] as const

type CategoryKey = 'trust' | 'communication' | 'helpfulness' | 'respect'

export default function RatingForm({ rateeId, rateeName, existingRating, onSuccess }: RatingFormProps) {
  const [ratings, setRatings] = useState<Record<CategoryKey, number>>({
    trust: existingRating?.trust ?? 0,
    communication: existingRating?.communication ?? 0,
    helpfulness: existingRating?.helpfulness ?? 0,
    respect: existingRating?.respect ?? 0,
  })
  const [comment, setComment] = useState(existingRating?.comment ?? '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    const unrated = categories.filter((c) => ratings[c.key] === 0)
    if (unrated.length > 0) {
      setError(`Please rate: ${unrated.map((c) => c.label).join(', ')}`)
      return
    }

    setLoading(true)

    const res = await fetch('/api/ratings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ratee_id: rateeId, ...ratings, comment }),
    })

    const json = await res.json()

    if (!res.ok) {
      setError(json.error ?? 'Failed to submit rating')
      setLoading(false)
      return
    }

    onSuccess()
  }

  const allRated = categories.every((c) => ratings[c.key] > 0)

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <p className="text-sm text-gray-500">
        Rating <span className="font-medium text-gray-800">{rateeName}</span>
        {existingRating && ' — updating your existing rating'}
      </p>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      {categories.map((cat) => (
        <div key={cat.key}>
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm font-medium text-gray-700">{cat.label}</label>
            <span className="text-xs text-gray-400">{cat.description}</span>
          </div>
          <StarRating
            value={ratings[cat.key]}
            onChange={(v) => setRatings((prev) => ({ ...prev, [cat.key]: v }))}
            size="lg"
          />
        </div>
      ))}

      <div>
        <label className="label" htmlFor="comment">Comment (optional)</label>
        <textarea
          id="comment"
          className="input resize-none"
          rows={3}
          placeholder="Share your experience with this person..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          maxLength={500}
        />
        <p className="text-xs text-gray-400 mt-1">{comment.length}/500</p>
      </div>

      <button
        type="submit"
        className="btn-primary w-full"
        disabled={loading || !allRated}
      >
        {loading ? 'Submitting...' : existingRating ? 'Update Rating' : 'Submit Rating'}
      </button>
    </form>
  )
}
