'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import RatingForm from '@/components/RatingForm'
import { Rating } from '@/types'

type Props = {
  rateeId: string
  rateeName: string
  existingRating: Rating | null
}

export default function ProfileRatingSection({ rateeId, rateeName, existingRating }: Props) {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  function handleSuccess() {
    setOpen(false)
    router.refresh()
  }

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800">
          {existingRating ? 'Your Rating' : 'Rate This Friend'}
        </h2>
        <button
          onClick={() => setOpen(!open)}
          className={open ? 'btn-secondary' : 'btn-primary'}
        >
          {open ? 'Cancel' : existingRating ? 'Update Rating' : 'Rate Now'}
        </button>
      </div>

      {existingRating && !open && (
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: 'Trust', value: existingRating.trust },
            { label: 'Communication', value: existingRating.communication },
            { label: 'Helpfulness', value: existingRating.helpfulness },
            { label: 'Respect', value: existingRating.respect },
          ].map((cat) => (
            <div key={cat.label} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">{cat.label}</span>
              <span className="text-sm font-semibold text-gray-800">{'★'.repeat(cat.value)}</span>
            </div>
          ))}
          {existingRating.comment && (
            <p className="col-span-2 text-sm text-gray-500 italic mt-2">
              &ldquo;{existingRating.comment}&rdquo;
            </p>
          )}
        </div>
      )}

      {open && (
        <RatingForm
          rateeId={rateeId}
          rateeName={rateeName}
          existingRating={existingRating}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  )
}
