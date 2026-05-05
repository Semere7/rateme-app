'use client'

import { useState, useEffect, useCallback } from 'react'
import { SalaryProfile } from '@/types'
import {
  CURRENCY_SYMBOLS,
  formatSalary, getScopeLabel, generateRecommendations,
  getFieldLabel, getExperienceLabel, getCountryLabel, getEmploymentLabel,
} from '@/lib/salary'
import SalaryProfileForm from './SalaryProfileForm'

// ─── API response types ───────────────────────────────────────────────────────

type BenchmarkResult = {
  hidden:       boolean
  scope?:       string
  count?:       number
  avg_midpoint?: number
  p10_midpoint?: number
  p50_midpoint?: number
  p90_midpoint?: number
  my_midpoint?:  number
  my_rank?:      number
  my_top_pct?:   number
}

type AchBenchmark = {
  hidden:       boolean
  count?:       number
  avg_midpoint?: number
}

// ─── Compare mode ─────────────────────────────────────────────────────────────

type CompareMode = 'exact' | 'field' | 'experience' | 'country' | 'all'

const COMPARE_MODES: { value: CompareMode; label: string }[] = [
  { value: 'exact',      label: 'My group'       },
  { value: 'field',      label: 'Same field'     },
  { value: 'experience', label: 'Same experience'},
  { value: 'country',    label: 'Same country'   },
  { value: 'all',        label: 'All users'      },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function PercentileBar({ topPct }: { topPct: number }) {
  const pct    = Math.max(0, Math.min(100, topPct))
  const beaten = 100 - pct
  const color  = pct <= 25 ? 'bg-emerald-500' : pct <= 50 ? 'bg-blue-500' : pct <= 75 ? 'bg-amber-400' : 'bg-gray-300'
  return (
    <div>
      <div className="flex justify-between text-xs text-gray-400 mb-1">
        <span>Bottom</span>
        <span>Top</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${beaten}%` }} />
      </div>
      <p className="text-xs text-gray-500 mt-1 text-center">
        You earn more than <span className="font-semibold text-gray-700">{beaten}%</span> of this group
      </p>
    </div>
  )
}

function StatPill({
  label, value, highlight,
}: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded-xl p-3 text-center ${highlight ? 'bg-blue-50 border border-blue-100' : 'bg-gray-50 border border-gray-100'}`}>
      <p className={`text-lg font-bold ${highlight ? 'text-blue-700' : 'text-gray-800'}`}>{value}</p>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function SalaryClient({
  initialProfile,
  achievementPoints,
}: {
  initialProfile:   SalaryProfile | null
  achievementPoints: number
}) {
  const [profile, setProfile]       = useState<SalaryProfile | null>(initialProfile)
  const [editing, setEditing]       = useState(!initialProfile)
  const [mode, setMode]             = useState<CompareMode>('exact')
  const [benchmark, setBenchmark]   = useState<BenchmarkResult | null>(null)
  const [achBench, setAchBench]     = useState<AchBenchmark | null>(null)
  const [loading, setLoading]       = useState(false)

  const sym = CURRENCY_SYMBOLS[profile?.currency ?? 'ILS'] ?? '₪'

  // Build benchmark query params based on compare mode
  function buildParams(p: SalaryProfile, m: CompareMode): URLSearchParams {
    const params = new URLSearchParams({ currency: p.currency })
    if (m === 'exact') {
      params.set('field',            p.field)
      params.set('experience_level', p.experience_level)
      params.set('country',          p.country)
      params.set('employment_type',  p.employment_type)
    } else if (m === 'field') {
      params.set('field', p.field)
    } else if (m === 'experience') {
      params.set('experience_level', p.experience_level)
    } else if (m === 'country') {
      params.set('country', p.country)
    }
    // 'all' → no filters
    return params
  }

  const fetchBenchmarks = useCallback(async (p: SalaryProfile, m: CompareMode) => {
    setLoading(true)
    try {
      const [bRes, aRes] = await Promise.all([
        fetch(`/api/salary/benchmark?${buildParams(p, m)}`),
        fetch(`/api/salary/achievement-benchmark?points=${achievementPoints}&currency=${p.currency}`),
      ])
      const [bData, aData] = await Promise.all([bRes.json(), aRes.json()])

      // If the API returned an error object, treat as hidden rather than crashing
      setBenchmark(bData?.error ? { hidden: true, count: 0 } : bData)
      setAchBench(aData?.error  ? { hidden: true, count: 0 } : aData)
    } catch (err) {
      console.error('[SalaryClient] fetch error:', err)
      setBenchmark({ hidden: true, count: 0 })
      setAchBench({ hidden: true, count: 0 })
    } finally {
      setLoading(false)
    }
  }, [achievementPoints])  // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (profile && !editing) fetchBenchmarks(profile, mode)
  }, [profile, editing, mode, fetchBenchmarks])

  function handleSaved(saved: SalaryProfile) {
    setProfile(saved)
    setEditing(false)
  }

  const myMidpoint = profile ? (profile.salary_min + profile.salary_max) / 2 : null
  const recs = (profile && benchmark && !benchmark.hidden && myMidpoint != null)
    ? generateRecommendations({
        myMidpoint,
        avgMidpoint:   benchmark.avg_midpoint ?? null,
        p90Midpoint:   benchmark.p90_midpoint ?? null,
        field:         profile.field,
        achievementPoints,
        currency:      profile.currency,
      })
    : []

  // ── Diff helper ──────────────────────────────────────────────────────────
  function diffText(myVal: number, avg: number): string {
    const diff = Math.round(myVal - avg)
    if (Math.abs(diff) < 100) return 'You are at the average'
    const abs = Math.abs(diff)
    return diff > 0
      ? `${formatSalary(abs, profile?.currency ?? 'ILS')} above average`
      : `${formatSalary(abs, profile?.currency ?? 'ILS')} below average`
  }

  return (
    <div className="space-y-4">

      {/* ── Header ── */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">Salary Insights</h1>
        <p className="text-sm text-gray-500 mt-0.5">Understand your market value privately</p>
      </div>

      {/* ── Privacy banner ── */}
      <div className="flex items-start gap-3 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
        <svg className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
        </svg>
        <div>
          <p className="text-xs font-semibold text-emerald-800">Your salary is private</p>
          <p className="text-xs text-emerald-700 mt-0.5">
            We never show your salary to other users. Only anonymous aggregated benchmarks are displayed.
            Results are hidden when fewer than 5 people share a group.
          </p>
        </div>
      </div>

      {/* ── Salary profile card ── */}
      <section className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-800">Your Salary Profile</h2>
          {profile && !editing && (
            <button
              onClick={() => setEditing(true)}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
            >
              Edit
            </button>
          )}
        </div>

        {editing ? (
          <SalaryProfileForm
            profile={profile}
            onSaved={handleSaved}
            onCancel={profile ? () => setEditing(false) : undefined}
          />
        ) : profile ? (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-400 mb-0.5">Monthly range</p>
                <p className="text-base font-bold text-gray-800">
                  {sym}{profile.salary_min.toLocaleString()} – {sym}{profile.salary_max.toLocaleString()}
                </p>
                <p className="text-xs text-gray-400">{profile.currency}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-400 mb-0.5">Midpoint</p>
                <p className="text-base font-bold text-blue-700">{formatSalary(myMidpoint!, profile.currency)}</p>
                <p className="text-xs text-gray-400">estimated</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                getFieldLabel(profile.field),
                getExperienceLabel(profile.experience_level),
                getCountryLabel(profile.country),
                getEmploymentLabel(profile.employment_type),
              ].map(tag => (
                <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full border border-gray-200">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-sm text-gray-400 mb-4">Add your salary range to see private benchmarks.</p>
            <SalaryProfileForm profile={null} onSaved={handleSaved} />
          </div>
        )}
      </section>

      {/* ── Content shown only when profile exists ── */}
      {profile && !editing && (
        <>
          {/* ── Compare mode selector ── */}
          <div className="flex gap-1.5 flex-wrap">
            {COMPARE_MODES.map(m => (
              <button
                key={m.value}
                onClick={() => setMode(m.value)}
                className={[
                  'text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors',
                  mode === m.value
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-700',
                ].join(' ')}
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* ── Benchmark card ── */}
          <section className="card p-5">
            <h2 className="text-base font-semibold text-gray-800 mb-4">Salary Benchmark</h2>

            {loading ? (
              <div className="space-y-3 animate-pulse">
                <div className="h-20 bg-gray-100 rounded-xl" />
                <div className="h-10 bg-gray-100 rounded-xl" />
              </div>
            ) : benchmark?.hidden ? (
              <div className="text-center py-6">
                <p className="text-sm text-gray-400 font-medium">Not enough anonymous data yet to protect privacy.</p>
                <p className="text-xs text-gray-400 mt-1">
                  {benchmark.count != null && benchmark.count > 0
                    ? `Only ${benchmark.count} user${benchmark.count === 1 ? '' : 's'} in this group. Try a broader comparison.`
                    : 'Invite more users or broaden your comparison filters.'}
                </p>
              </div>
            ) : benchmark && !benchmark.hidden ? (
              <div className="space-y-4">
                {/* Scope label */}
                {benchmark.scope && (
                  <p className="text-xs text-gray-400">
                    Comparing against: <span className="font-medium text-gray-600">
                      {getScopeLabel(benchmark.scope, profile.field, profile.experience_level, profile.country)}
                    </span>
                    {benchmark.count != null && (
                      <span className="text-gray-400"> · {benchmark.count} users</span>
                    )}
                  </p>
                )}

                {/* Stat grid */}
                <div className="grid grid-cols-3 gap-2">
                  <StatPill
                    label="Your midpoint"
                    value={formatSalary(myMidpoint!, profile.currency)}
                    highlight
                  />
                  <StatPill
                    label="Group average"
                    value={benchmark.avg_midpoint != null ? formatSalary(benchmark.avg_midpoint, profile.currency) : '—'}
                  />
                  <StatPill
                    label="Top 10%"
                    value={benchmark.p90_midpoint != null ? formatSalary(benchmark.p90_midpoint, profile.currency) : '—'}
                  />
                </div>

                {/* Diff */}
                {benchmark.avg_midpoint != null && (
                  <p className={`text-sm font-semibold text-center ${
                    myMidpoint! >= benchmark.avg_midpoint ? 'text-emerald-600' : 'text-amber-600'
                  }`}>
                    {diffText(myMidpoint!, benchmark.avg_midpoint)}
                  </p>
                )}

                {/* Percentile bar */}
                {benchmark.my_top_pct != null && (
                  <PercentileBar topPct={benchmark.my_top_pct} />
                )}
              </div>
            ) : null}
          </section>

          {/* ── Salary ranking card ── */}
          {benchmark && !benchmark.hidden && benchmark.my_rank != null && (
            <section className="card p-5">
              <h2 className="text-base font-semibold text-gray-800 mb-3">Salary Ranking</h2>
              <div className="flex items-center gap-6">
                <div>
                  <p className="text-3xl font-bold text-blue-700">
                    #{benchmark.my_rank}
                    <span className="text-base font-normal text-gray-400">/{benchmark.count}</span>
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {benchmark.my_top_pct != null && benchmark.my_top_pct <= 50
                      ? `Top ${benchmark.my_top_pct}%`
                      : benchmark.my_top_pct != null
                      ? `Bottom ${100 - benchmark.my_top_pct}%`
                      : ''}
                  </p>
                </div>
                <div className="flex-1">
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${Math.max(2, 100 - (benchmark.my_top_pct ?? 50))}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    You earn more than <span className="font-semibold text-gray-700">
                      {100 - (benchmark.my_top_pct ?? 50)}%
                    </span> of this group
                  </p>
                </div>
              </div>
            </section>
          )}

          {/* ── Achievement-based salary insight ── */}
          {achievementPoints > 0 && (
            <section className="card p-5">
              <h2 className="text-base font-semibold text-gray-800 mb-1">Achievement Salary Insight</h2>
              <p className="text-xs text-gray-400 mb-4">
                Based on users with a similar achievement score (±30% of yours)
              </p>

              {loading ? (
                <div className="h-16 bg-gray-100 rounded-xl animate-pulse" />
              ) : achBench?.hidden ? (
                <p className="text-sm text-gray-400">
                  Not enough salary data from users with similar achievements yet.
                </p>
              ) : achBench && !achBench.hidden && achBench.avg_midpoint != null ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-purple-50 border border-purple-100 rounded-xl p-3 text-center">
                      <p className="text-lg font-bold text-purple-700">{achievementPoints.toLocaleString()} pts</p>
                      <p className="text-xs text-gray-500 mt-0.5">Your achievement score</p>
                    </div>
                    <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 text-center">
                      <p className="text-lg font-bold text-gray-800">
                        {formatSalary(achBench.avg_midpoint, profile.currency)}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">Peers avg salary</p>
                    </div>
                  </div>
                  {myMidpoint != null && (() => {
                    const diff = Math.round(myMidpoint - achBench.avg_midpoint!)
                    if (Math.abs(diff) < 100) return (
                      <p className="text-xs text-gray-500 text-center">Your salary is aligned with peers of similar achievement level.</p>
                    )
                    return (
                      <p className={`text-sm font-semibold text-center ${diff > 0 ? 'text-emerald-600' : 'text-amber-600'}`}>
                        {diff > 0
                          ? `You may be earning ${formatSalary(Math.abs(diff), profile.currency)} more than similar achievers`
                          : `You may be underpaid by ${formatSalary(Math.abs(diff), profile.currency)} vs similar achievers`}
                      </p>
                    )
                  })()}
                  {achBench.count != null && (
                    <p className="text-xs text-gray-400 text-center">Based on {achBench.count} users</p>
                  )}
                </div>
              ) : null}
            </section>
          )}

          {/* ── Progress card ── */}
          {benchmark && !benchmark.hidden && myMidpoint != null && (
            <section className="card p-5">
              <h2 className="text-base font-semibold text-gray-800 mb-4">Salary Goals</h2>
              <div className="space-y-4">

                {/* Goal 1: reach average */}
                {benchmark.avg_midpoint != null && (
                  <div>
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span className="font-medium">Reach group average</span>
                      <span>
                        {formatSalary(Math.min(myMidpoint, benchmark.avg_midpoint), profile.currency)}
                        {' / '}{formatSalary(benchmark.avg_midpoint, profile.currency)}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${Math.min(100, Math.round((myMidpoint / benchmark.avg_midpoint) * 100))}%` }}
                      />
                    </div>
                    {myMidpoint < benchmark.avg_midpoint ? (
                      <p className="text-xs text-gray-400 mt-1">
                        {formatSalary(benchmark.avg_midpoint - myMidpoint, profile.currency)} to go
                      </p>
                    ) : (
                      <p className="text-xs text-emerald-600 mt-1 font-semibold">Goal reached</p>
                    )}
                  </div>
                )}

                {/* Goal 2: reach top 10% */}
                {benchmark.p90_midpoint != null && (
                  <div>
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span className="font-medium">Reach Top 10%</span>
                      <span>
                        {formatSalary(Math.min(myMidpoint, benchmark.p90_midpoint), profile.currency)}
                        {' / '}{formatSalary(benchmark.p90_midpoint, profile.currency)}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-purple-500 rounded-full"
                        style={{ width: `${Math.min(100, Math.round((myMidpoint / benchmark.p90_midpoint) * 100))}%` }}
                      />
                    </div>
                    {myMidpoint < benchmark.p90_midpoint ? (
                      <p className="text-xs text-gray-400 mt-1">
                        {formatSalary(benchmark.p90_midpoint - myMidpoint, profile.currency)} to go
                      </p>
                    ) : (
                      <p className="text-xs text-emerald-600 mt-1 font-semibold">Top 10% reached</p>
                    )}
                  </div>
                )}
              </div>
            </section>
          )}

          {/* ── Recommendations ── */}
          {recs.length > 0 && (
            <section className="card p-5">
              <h2 className="text-base font-semibold text-gray-800 mb-3">Recommendations</h2>
              <ul className="space-y-2">
                {recs.map((rec, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="mt-1 shrink-0 w-1.5 h-1.5 rounded-full bg-blue-400" />
                    <p className="text-sm text-gray-600">{rec}</p>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* ── Trust section ── */}
          <section className="card p-5 bg-gray-50">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Privacy & Trust</h2>
            <ul className="space-y-2">
              {[
                'Your salary is private and never shown to other users.',
                'We only display anonymous, aggregated comparisons.',
                'Groups with fewer than 5 users are hidden to protect privacy.',
                'You can update or delete your salary profile at any time.',
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-xs text-gray-500">
                  <svg className="w-3.5 h-3.5 text-emerald-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
          </section>
        </>
      )}
    </div>
  )
}
