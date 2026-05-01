'use client'

import { useState } from 'react'
import ReportModal from '@/components/ReportModal'

export default function ReportTrigger({ ratingId, raterName }: { ratingId: string; raterName: string }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-xs text-red-400 hover:text-red-600 hover:underline transition-colors"
      >
        Report
      </button>
      {open && (
        <ReportModal
          ratingId={ratingId}
          raterName={raterName}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  )
}
