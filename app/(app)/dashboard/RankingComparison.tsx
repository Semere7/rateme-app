'use client'

import { useState, useEffect, useRef } from 'react'
import { ACHIEVEMENT_CATEGORIES, CATEGORY_STYLES, formatPercentile, PERCENTILE_COLORS } from '@/lib/achievements'
import type { AchievementCategory } from '@/lib/achievements'
import Avatar from '@/components/Avatar'

type RankStat = { rank: number; total: number; topPct: number; myPoints: number } | null

type ComparisonData = {
  profile:  { id: string; username: string; full_name: string; avatar_url: string }
  overall:  { mine: number; theirs: number; diff: number }
  selected: { mine: number; theirs: number; diff: number }
  rows: Array<{ category: string; label: string; mine: number; theirs: number; diff: number }>
}

type RankingsData = {
  selected: RankStat
  breakdown: Record<string, RankStat>
  comparison: ComparisonData | null
  poolAverage: number
}

type Context  = 'all' | 'users' | 'figures' | 'friends' | 'person'
type Category = 'overall' | AchievementCategory

type SearchResult = {
  id: string
  username: string
  full_name: string
  avatar_url: string
  profile_type: 'user' | 'public_figure'
}

const CONTEXT_OPTIONS: { value: Context; label: string }[] = [
  { value: 'all',     label: 'Everyone' },
  { value: 'users',   label: 'Users' },
  { value: 'figures', label: 'Public Figures' },
  { value: 'friends', label: 'Friends' },
  { value: 'person',  label: 'Specific Person' },
]

const CATEGORY_OPTIONS: { value: Category; label: string }[] = [
  { value: 'overall',       label: 'Overall' },
  { value: 'global_impact', label: 'Global Impact' },
  { value: 'technology',    label: 'Technology' },
  { value: 'human_rights',  label: 'Human Rights' },
  { value: 'sports',        label: 'Sports' },
  { value: 'business',      label: 'Business' },
  { value: 'education',     label: 'Education' },
]

export default function RankingComparison({ userId }: { userId: string }) {
  const [context, setContext]             = useState<Context>('all')
  const [category, setCategory]           = useState<Category>('overall')
  const [personId, setPersonId]           = useState<string | null>(null)
  const [personProfile, setPersonProfile] = useState<SearchResult | null>(null)
  const [search, setSearch]               = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [showDropdown, setShowDropdown]   = useState(false)
  const [data, setData]                   = useState<RankingsData | null>(null)
  const [loading, setLoading]             = useState(false)

  const searchRef   = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setShowDropdown(false)
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [])

  useEffect(() => {
    if (context !== 'person') return
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!search.trim()) { setSearchResults([]); setShowDropdown(false); return }
    debounceRef.current = setTimeout(async () => {
      setSearchLoading(true)
      try {
        const res = await fetch(`/api/profiles/search?q=${encodeURIComponent(search)}`)
        const json = await res.json()
        const results = (json.profiles ?? []) as SearchResult[]
        setSearchResults(results)
        setShowDropdown(results.length > 0)
      } finally { setSearchLoading(false) }
    }, 300)
  }, [search, context])

  useEffect(() => {
    if (context === 'person' && !personId) { setData(null); return }
    const params = new URLSearchParams({ context, category })
    if (personId) params.set('personId', personId)
    setLoading(true)
    fetch(`/api/rankings?${params}`)
      .then((r) => r.json())
      .then((json: RankingsData) => setData(json))
      .catch(() => setData(null))
      .finally(() => setLoading(false))
  }, [context, category, personId])

  function selectPerson(p: SearchResult) {
    setPersonId(p.id); setPersonProfile(p)
    setSearch(p.full_name || p.username); setShowDropdown(false)
  }
  function clearPerson() { setPersonId(null); setPersonProfile(null); setSearch(''); setData(null) }
  function switchContext(ctx: Context) {
    setContext(ctx)
    if (ctx !== 'person') { setPersonId(null); setPersonProfile(null); setSearch('') }
  }

  const rankStat   = data?.selected ?? null
  const breakdown  = data?.breakdown ?? {}
  const comparison = data?.comparison ?? null

  // Derive insights from breakdown
  const breakdownEntries = Object.entries(breakdown).filter(([, s]) => s !== null) as [string, NonNullable<RankStat>][]
  const bestCat   = breakdownEntries.length > 0 ? [...breakdownEntries].sort(([, a], [, b]) => a.topPct - b.topPct)[0] : null
  const weakestCat = breakdownEntries.length > 0 ? [...breakdownEntries].sort(([, a], [, b]) => b.topPct - a.topPct)[0] : null

  const poolAverage = data?.poolAverage ?? 0
  const myPoints    = rankStat?.myPoints ?? 0
  const aboveAvgDiff = myPoints - poolAverage

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-gray-800">Compare & Rank</h2>
      </div>

      {/* ── Context tabs ── */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {CONTEXT_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => switchContext(opt.value)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
              context === opt.value
                ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                : 'bg-white text-gray-500 border-gray-200 hover:border-blue-300'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* ── Person search ── */}
      {context === 'person' && (
        <div ref={searchRef} className="relative mb-4">
          {personProfile ? (
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl border border-blue-100">
              <Avatar src={personProfile.avatar_url} name={personProfile.full_name || personProfile.username} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800">{personProfile.full_name || personProfile.username}</p>
                <p className="text-xs text-gray-500">@{personProfile.username}</p>
              </div>
              <button onClick={clearPerson} className="text-gray-400 hover:text-red-500 text-sm leading-none">✕</button>
            </div>
          ) : (
            <>
              <input
                className="input"
                placeholder="Search by name or username…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onFocus={() => searchResults.length > 0 && setShowDropdown(true)}
              />
              {searchLoading && <p className="text-xs text-gray-400 mt-1.5 ml-1">Searching…</p>}
              {showDropdown && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-20 overflow-hidden">
                  {searchResults.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                      onClick={() => selectPerson(p)}
                    >
                      <Avatar src={p.avatar_url} name={p.full_name || p.username} size="sm" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">{p.full_name || p.username}</p>
                        <p className="text-xs text-gray-500">@{p.username}</p>
                      </div>
                      {p.profile_type === 'public_figure' && (
                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full shrink-0">Public Figure</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ── Category tabs ── */}
      <div className="flex flex-wrap gap-1.5 mb-5">
        {CATEGORY_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setCategory(opt.value)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
              category === opt.value
                ? opt.value === 'overall'
                  ? 'bg-gray-800 text-white border-gray-800 shadow-sm'
                  : `${CATEGORY_STYLES[opt.value as AchievementCategory]} border-current shadow-sm`
                : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* ── Loading ── */}
      {loading && (
        <div className="space-y-3">
          <div className="h-20 bg-gray-100 rounded-xl animate-pulse" />
          <div className="h-44 bg-gray-100 rounded-xl animate-pulse" />
        </div>
      )}

      {/* ── Empty: person not selected ── */}
      {!loading && context === 'person' && !personId && (
        <p className="text-center text-gray-400 text-sm py-8">Search for someone above to compare your achievements</p>
      )}

      {/* ── Results ── */}
      {!loading && data && (
        <div className="space-y-4">

          {/* Person mode: You vs Them summary (no misleading "#1 of 2" rank) */}
          {context === 'person' && comparison ? (
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
              <div className="grid grid-cols-3 gap-2 text-center mb-2.5">
                <div>
                  <p className="text-2xl font-bold text-blue-700">{comparison.selected.mine.toLocaleString()}</p>
                  <p className="text-xs text-gray-500 mt-0.5">You</p>
                </div>
                <div>
                  <p className={`text-xl font-bold ${
                    comparison.selected.diff > 0 ? 'text-emerald-600'
                    : comparison.selected.diff < 0 ? 'text-red-500'
                    : 'text-gray-400'
                  }`}>
                    {comparison.selected.diff > 0 ? '+' : ''}
                    {comparison.selected.diff !== 0 ? comparison.selected.diff.toLocaleString() : '—'}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {category === 'overall' ? 'overall' : ACHIEVEMENT_CATEGORIES[category as AchievementCategory]?.label}
                  </p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-700">{comparison.selected.theirs.toLocaleString()}</p>
                  <p className="text-xs text-gray-500 mt-0.5 truncate">
                    {(comparison.profile.full_name || comparison.profile.username).split(' ')[0]}
                  </p>
                </div>
              </div>
              <p className="text-xs text-gray-500 text-center border-t border-gray-100 pt-2.5">
                {(() => {
                  const { mine, theirs, diff } = comparison.selected
                  const name  = comparison.profile.full_name || comparison.profile.username
                  const scope = category === 'overall'
                    ? 'overall'
                    : `in ${ACHIEVEMENT_CATEGORIES[category as AchievementCategory]?.label}`
                  if (mine === 0 && theirs === 0) return `Both have no achievements ${scope} yet`
                  if (diff > 0) return `You're ahead by ${diff.toLocaleString()} pts ${scope}`
                  if (diff < 0) return `You're ${Math.abs(diff).toLocaleString()} pts behind ${name} ${scope}`
                  return `Tied ${scope}`
                })()}
              </p>
            </div>
          ) : context !== 'person' && (
            // Non-person mode: standard rank card
            rankStat ? (
              <div className="flex flex-wrap items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                <div>
                  <p className="text-3xl font-bold text-blue-700">#{rankStat.rank}</p>
                  <p className="text-xs text-blue-500 font-medium">
                    {CATEGORY_OPTIONS.find((c) => c.value === category)?.label} Rank
                  </p>
                </div>
                <div className="w-px h-10 bg-blue-200" />
                <div>
                  <p className="text-xl font-bold text-blue-700">
                    {rankStat.total}<span className="text-sm font-normal text-blue-400"> in pool</span>
                  </p>
                  <p className="text-xs text-blue-500 font-medium">Pool Size</p>
                </div>
                {(() => {
                  const pct = formatPercentile(rankStat.topPct)
                  if (!pct) return null
                  return (
                    <>
                      <div className="w-px h-10 bg-blue-200" />
                      <div>
                        <p className={`text-xl font-bold ${PERCENTILE_COLORS[pct.tone]}`}>{pct.label}</p>
                        <p className="text-xs text-blue-500 font-medium">Percentile</p>
                      </div>
                    </>
                  )
                })()}
                <div className="w-px h-10 bg-blue-200" />
                <div>
                  <p className="text-xl font-bold text-blue-700">{rankStat.myPoints.toLocaleString()}</p>
                  <p className="text-xs text-blue-500 font-medium">Points</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-5 bg-gray-50 rounded-xl">
                <p className="text-gray-400 text-sm">
                  {category === 'overall'
                    ? 'No achievement points yet in this group'
                    : `No ${ACHIEVEMENT_CATEGORIES[category as AchievementCategory]?.label ?? category.replace('_', ' ')} achievements yet`}
                </p>
                <p className="text-xs text-gray-300 mt-1">Add achievements to appear in rankings</p>
              </div>
            )
          )}

          {/* Pool average insight — non-person only (pool of 2 makes this meaningless) */}
          {context !== 'person' && rankStat && poolAverage > 0 && (
            <p className={`text-sm px-1 ${aboveAvgDiff >= 0 ? 'text-emerald-600' : 'text-gray-500'}`}>
              {aboveAvgDiff >= 0
                ? `You're ahead — +${aboveAvgDiff.toLocaleString()} pts above average in this group`
                : Math.abs(aboveAvgDiff) <= 150
                ? `You're close — just +${Math.abs(aboveAvgDiff).toLocaleString()} pts to reach average`
                : `You're building up — +${Math.abs(aboveAvgDiff).toLocaleString()} pts to reach average`}
            </p>
          )}

          {/* Category breakdown — non-person only */}
          {context !== 'person' && breakdownEntries.length > 0 && (
            <div className="rounded-xl border border-gray-100 overflow-hidden">
              <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">My Rank by Category</p>
                {bestCat && weakestCat && bestCat[0] !== weakestCat[0] && (
                  <p className="text-xs text-gray-400">
                    Best: <span className="text-emerald-600 font-medium">{ACHIEVEMENT_CATEGORIES[bestCat[0] as AchievementCategory]?.label}</span>
                    {' · '}
                    Weakest: <span className="text-amber-600 font-medium">{ACHIEVEMENT_CATEGORIES[weakestCat[0] as AchievementCategory]?.label}</span>
                  </p>
                )}
              </div>
              <div className="divide-y divide-gray-50">
                {(Object.entries(ACHIEVEMENT_CATEGORIES) as [AchievementCategory, { label: string; weight: number }][]).map(([key, meta]) => {
                  const stat      = breakdown[key] as RankStat
                  const isBest    = bestCat?.[0] === key
                  const isWeakest = weakestCat?.[0] === key
                  return (
                    <div key={key} className={`flex items-center justify-between px-4 py-2.5 ${isBest ? 'bg-emerald-50/40' : isWeakest ? 'bg-amber-50/40' : ''}`}>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold border ${CATEGORY_STYLES[key]}`}>
                        {meta.label}
                      </span>
                      {stat ? (
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-gray-400">{stat.myPoints.toLocaleString()} pts</span>
                          <span className="text-sm font-bold text-gray-700">#{stat.rank}</span>
                          {(() => {
                            const pct = formatPercentile(stat.topPct)
                            return pct ? (
                              <span className={`text-xs font-semibold w-16 text-right ${PERCENTILE_COLORS[pct.tone]}`}>
                                {pct.label}
                              </span>
                            ) : null
                          })()}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-300 italic">Add a {meta.label} achievement to rank</span>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Head-to-head breakdown table */}
          {comparison && (
            <div className="rounded-xl border border-gray-100 overflow-hidden">
              <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 border-b border-gray-100">
                <Avatar src={comparison.profile.avatar_url} name={comparison.profile.full_name || comparison.profile.username} size="sm" />
                <p className="text-sm font-semibold text-gray-700 flex-1 min-w-0 truncate">
                  vs {comparison.profile.full_name || comparison.profile.username}
                </p>
                {/* Header diff reflects the selected category, not always overall */}
                <div className="text-right shrink-0">
                  <p className={`text-sm font-bold ${comparison.selected.diff >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                    {comparison.selected.diff >= 0 ? '+' : ''}{comparison.selected.diff.toLocaleString()} pts
                  </p>
                  <p className="text-xs text-gray-400">
                    {category === 'overall' ? 'overall' : ACHIEVEMENT_CATEGORIES[category as AchievementCategory]?.label}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-4 px-4 py-2 border-b border-gray-50 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                <span>Category</span>
                <span className="text-center">You</span>
                <span className="text-center">Them</span>
                <span className="text-right">Diff</span>
              </div>
              <div className="divide-y divide-gray-50">
                {comparison.rows.map((row) => {
                  const isSelected = category !== 'overall' && row.category === category
                  return (
                    <div key={row.category} className={`grid grid-cols-4 items-center px-4 py-2.5 ${isSelected ? 'bg-blue-50/60' : ''}`}>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold border w-fit ${CATEGORY_STYLES[row.category as AchievementCategory]}`}>
                        {row.label}
                      </span>
                      <span className="text-sm font-semibold text-gray-700 text-center">{row.mine.toLocaleString()}</span>
                      <span className="text-sm text-gray-500 text-center">{row.theirs.toLocaleString()}</span>
                      <span className={`text-sm font-semibold text-right ${row.diff > 0 ? 'text-emerald-600' : row.diff < 0 ? 'text-red-500' : 'text-gray-300'}`}>
                        {row.diff > 0 ? '+' : ''}{row.diff !== 0 ? row.diff.toLocaleString() : '—'}
                      </span>
                    </div>
                  )
                })}
                <div className="grid grid-cols-4 items-center px-4 py-3 bg-gray-50">
                  <span className="text-xs font-bold text-gray-600 uppercase tracking-wide">Total</span>
                  <span className="text-sm font-bold text-gray-800 text-center">{comparison.overall.mine.toLocaleString()}</span>
                  <span className="text-sm font-semibold text-gray-600 text-center">{comparison.overall.theirs.toLocaleString()}</span>
                  <span className={`text-sm font-bold text-right ${comparison.overall.diff > 0 ? 'text-emerald-600' : comparison.overall.diff < 0 ? 'text-red-500' : 'text-gray-300'}`}>
                    {comparison.overall.diff > 0 ? '+' : ''}{comparison.overall.diff !== 0 ? comparison.overall.diff.toLocaleString() : '—'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
