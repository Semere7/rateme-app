'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Achievement } from '@/types'
import {
  getAchievementMeta,
  ACHIEVEMENT_CATEGORIES,
  IMPACT_LEVELS,
  CATEGORY_STYLES,
  formatPercentile,
  PERCENTILE_COLORS,
  getAchievementLevel,
  getLevelProgress,
  LEVEL_BADGE_COLORS,
  LEVEL_BAR_COLORS,
} from '@/lib/achievements'
import type { AchievementCategory } from '@/lib/achievements'
import AddAchievementModal from './AddAchievementModal'

type RankInfo = { rank: number; total: number; topPct: number } | null

type Props = {
  achievements: Achievement[]
  totalPoints: number
  rankInfo: RankInfo
  isOwn: boolean
  profileId: string
  compact?: boolean
}

export default function AchievementsSection({
  achievements,
  totalPoints,
  rankInfo,
  isOwn,
  profileId,
  compact = false,
}: Props) {
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const router = useRouter()

  const displayed = compact ? achievements.slice(0, 2) : achievements

  async function handleDelete(id: string) {
    setDeletingId(id)
    await fetch(`/api/achievements/${id}`, { method: 'DELETE' })
    setDeletingId(null)
    router.refresh()
  }

  function categoryStyle(cat: string): string {
    return CATEGORY_STYLES[cat as AchievementCategory] ?? 'bg-gray-100 text-gray-600 border-gray-200'
  }

  function categoryLabel(cat: string): string {
    return ACHIEVEMENT_CATEGORIES[cat as AchievementCategory]?.label ?? cat
  }

  function impactLabel(level: number): string {
    return IMPACT_LEVELS.find((l) => l.level === level)?.label ?? `Level ${level}`
  }

  const percentile = rankInfo ? formatPercentile(rankInfo.topPct) : null
  const level      = getAchievementLevel(totalPoints)
  const levelPct   = getLevelProgress(totalPoints, level)

  return (
    <div>
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-gray-800">
          {compact ? 'Achievements' : 'Achievements'}
          {!compact && achievements.length > 0 && (
            <span className="text-sm font-normal text-gray-400 ml-1.5">({achievements.length})</span>
          )}
        </h2>
        {isOwn && <AddAchievementModal />}
      </div>

      {/* ── Score summary (compact mode only) ── */}
      {compact && totalPoints > 0 && (
        <div className="p-4 bg-gradient-to-r from-purple-50 to-violet-50 rounded-xl mb-4 border border-purple-100">
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <p className="text-2xl font-bold text-purple-700">{totalPoints.toLocaleString()}</p>
              <p className="text-xs text-purple-500 font-medium">Total Points</p>
            </div>
            {rankInfo && (
              <>
                <div className="w-px h-8 bg-purple-200" />
                <div>
                  <p className="text-lg font-bold text-purple-700">
                    #{rankInfo.rank}
                    <span className="text-sm font-normal text-purple-400"> / {rankInfo.total}</span>
                  </p>
                  <p className="text-xs text-purple-500 font-medium">Rank</p>
                </div>
                {percentile && (
                  <>
                    <div className="w-px h-8 bg-purple-200" />
                    <div>
                      <p className={`text-lg font-bold ${PERCENTILE_COLORS[percentile.tone]}`}>
                        {percentile.label}
                      </p>
                      <p className="text-xs text-purple-500 font-medium">Percentile</p>
                    </div>
                  </>
                )}
              </>
            )}
            <div className="w-px h-8 bg-purple-200" />
            <div>
              <span className={`text-xs px-2 py-0.5 rounded-full font-semibold border ${LEVEL_BADGE_COLORS[level.tone]}`}>
                {level.label}
              </span>
              <p className="text-xs text-purple-500 font-medium mt-1">Level</p>
            </div>
          </div>
          {/* Level progress bar */}
          {level.nextAt && (
            <div className="mt-3">
              <div className="flex justify-between text-xs text-purple-400 mb-1">
                <span>{level.label}</span>
                <span>{level.nextLabel} at {level.nextAt.toLocaleString()} pts</span>
              </div>
              <div className="h-1.5 bg-purple-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${LEVEL_BAR_COLORS[level.tone]}`}
                  style={{ width: `${levelPct}%` }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Score summary (full mode) ── */}
      {!compact && totalPoints > 0 && (
        <div className="flex flex-wrap items-center gap-4 p-4 bg-gradient-to-r from-purple-50 to-violet-50 rounded-xl mb-4 border border-purple-100">
          <div>
            <p className="text-3xl font-bold text-purple-700">{totalPoints.toLocaleString()}</p>
            <p className="text-xs text-purple-500 font-medium">Total Points</p>
          </div>
          {rankInfo && (
            <>
              <div className="w-px h-10 bg-purple-200" />
              <div>
                <p className="text-xl font-bold text-purple-700">
                  #{rankInfo.rank}
                  <span className="text-sm font-normal text-purple-400"> / {rankInfo.total}</span>
                </p>
                <p className="text-xs text-purple-500 font-medium">Rank</p>
              </div>
              {percentile && (
                <>
                  <div className="w-px h-10 bg-purple-200" />
                  <div>
                    <p className={`text-xl font-bold ${PERCENTILE_COLORS[percentile.tone]}`}>
                      {percentile.label}
                    </p>
                    <p className="text-xs text-purple-500 font-medium">Percentile</p>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      )}

      {/* ── Achievement list ── */}
      {achievements.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-400 text-sm mb-1">
            {isOwn ? 'No achievements yet — add your first one!' : 'No achievements added yet.'}
          </p>
          {isOwn && (
            <p className="text-xs text-gray-300">
              Technology & Global Impact score the most points
            </p>
          )}
        </div>
      ) : (
        <>
          <div className="space-y-2.5">
            {displayed.map((a) => {
              const meta          = getAchievementMeta(a.achievement_type)
              const showTypeLabel = a.title !== meta?.label
              const catStyle      = categoryStyle(a.category)

              return (
                <div
                  key={a.id}
                  className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors"
                >
                  <span className="text-2xl shrink-0 mt-0.5" aria-hidden>{meta?.icon ?? '🏅'}</span>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <p className="font-semibold text-gray-800 text-sm leading-tight">{a.title}</p>
                      <span className="text-sm font-bold text-purple-600 shrink-0 ml-1">
                        +{a.points.toLocaleString()} pts
                      </span>
                    </div>

                    {showTypeLabel && meta && (
                      <p className="text-xs text-gray-500 mb-1.5">{meta.label}</p>
                    )}

                    <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold border ${catStyle}`}>
                        {categoryLabel(a.category)}
                      </span>
                      {a.impact_level > 0 && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200 font-medium">
                          {impactLabel(a.impact_level)}
                        </span>
                      )}
                      {a.impact_level >= 4 && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200 font-semibold">
                          High Impact
                        </span>
                      )}
                    </div>

                    {a.description && (
                      <p className="text-xs text-gray-500 leading-relaxed mb-1">{a.description}</p>
                    )}

                    <span className="text-xs text-gray-400">
                      {new Date(a.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  {isOwn && (
                    <button
                      onClick={() => handleDelete(a.id)}
                      disabled={deletingId === a.id}
                      className="text-gray-300 hover:text-red-500 transition-colors shrink-0 text-xl leading-none mt-0.5 disabled:opacity-50"
                      aria-label="Remove achievement"
                      title="Remove"
                    >
                      {deletingId === a.id ? '…' : '×'}
                    </button>
                  )}
                </div>
              )
            })}
          </div>

          {/* View all link — show in compact when there are more than 2, or always in compact */}
          {compact && (
            <Link
              href={`/profile/${profileId}`}
              className="flex items-center justify-between mt-3 px-3 py-2.5 rounded-xl border border-dashed border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-colors group"
            >
              <span className="text-sm text-gray-500 group-hover:text-purple-700">
                {achievements.length > 2
                  ? `View all ${achievements.length} achievements`
                  : 'View achievements on profile'}
              </span>
              <span className="text-gray-300 group-hover:text-purple-500 text-sm">→</span>
            </Link>
          )}
        </>
      )}
    </div>
  )
}
