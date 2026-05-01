'use client'

import { useState } from 'react'

type ReportModalProps = {
  ratingId: string
  raterName: string
  onClose: () => void
}

export default function ReportModal({ ratingId, raterName, onClose }: ReportModalProps) {
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!reason.trim()) return

    setLoading(true)
    setError('')

    const res = await fetch('/api/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating_id: ratingId, reason }),
    })

    const json = await res.json()

    if (!res.ok) {
      setError(json.error ?? 'Failed to submit report')
      setLoading(false)
      return
    }

    setSubmitted(true)
    setTimeout(onClose, 2000)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <div className="card p-6 w-full max-w-md">
        {submitted ? (
          <div className="text-center py-4">
            <div className="text-green-500 text-4xl mb-3">✓</div>
            <p className="font-medium text-gray-800">Report submitted</p>
            <p className="text-sm text-gray-500 mt-1">Thank you for keeping the community safe.</p>
          </div>
        ) : (
          <>
            <h3 className="text-lg font-semibold text-gray-800 mb-1">Report Rating</h3>
            <p className="text-sm text-gray-500 mb-4">
              Reporting the rating from <strong>{raterName}</strong>
            </p>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label" htmlFor="reason">Reason for reporting</label>
                <textarea
                  id="reason"
                  className="input resize-none"
                  rows={4}
                  placeholder="Describe why this rating is abusive, false, or inappropriate..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                  maxLength={1000}
                />
                <p className="text-xs text-gray-400 mt-1">{reason.length}/1000</p>
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={onClose} className="btn-secondary flex-1">
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-danger flex-1"
                  disabled={loading || !reason.trim()}
                >
                  {loading ? 'Submitting...' : 'Submit Report'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
