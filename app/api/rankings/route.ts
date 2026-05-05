import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { ACHIEVEMENT_CATEGORIES } from '@/lib/achievements'
import type { AchievementCategory } from '@/lib/achievements'

type RankStat = { rank: number; total: number; topPct: number; myPoints: number } | null

function computeRank(scoreMap: Map<string, number>, myId: string): RankStat {
  const myPoints = scoreMap.get(myId) ?? 0
  const all = Array.from(scoreMap.values())
  if (all.length === 0 || myPoints <= 0) return null
  const rank   = all.filter((p) => p > myPoints).length + 1
  const total  = all.length
  const topPct = Math.ceil((rank / total) * 100)
  return { rank, total, topPct, myPoints }
}

export async function GET(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const url      = new URL(req.url)
  const context  = url.searchParams.get('context') ?? 'all'
  const category = url.searchParams.get('category') ?? 'overall'
  const personId = url.searchParams.get('personId') ?? null

  // ── Build pool IDs ─────────────────────────────────────────────────────────
  let poolIds: string[] = []

  if (context === 'person' && personId) {
    poolIds = [user.id, personId]
  } else if (context === 'friends') {
    const { data: friendships } = await supabase
      .from('friendships')
      .select('requester_id, addressee_id')
      .eq('status', 'accepted')
      .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
    const friendIds = (friendships ?? []).map((f) =>
      f.requester_id === user.id ? f.addressee_id : f.requester_id
    )
    poolIds = [user.id, ...friendIds]
  } else {
    let query = supabase.from('profiles').select('id')
    if (context === 'users')   query = query.eq('profile_type', 'user')
    if (context === 'figures') query = query.eq('profile_type', 'public_figure')
    const { data: profiles } = await query
    poolIds = Array.from(new Set([user.id, ...(profiles ?? []).map((p) => p.id)]))
  }

  // ── Fetch achievements ─────────────────────────────────────────────────────
  // Include personId even when not in pool (for cross-context comparison)
  const fetchIds = personId && !poolIds.includes(personId)
    ? [...poolIds, personId]
    : poolIds

  const { data: achievements } = await supabase
    .from('achievements')
    .select('user_id, category, points')
    .in('user_id', fetchIds)

  // ── Build score maps ───────────────────────────────────────────────────────
  const overallMap = new Map<string, number>()
  const categoryMaps = new Map<string, Map<string, number>>()

  for (const id of poolIds) {
    overallMap.set(id, 0)
    for (const cat of Object.keys(ACHIEVEMENT_CATEGORIES)) {
      if (!categoryMaps.has(cat)) categoryMaps.set(cat, new Map())
      categoryMaps.get(cat)!.set(id, 0)
    }
  }
  // Seed personId in category maps (even if outside pool) so comparison works
  if (personId && !poolIds.includes(personId)) {
    overallMap.set(personId, 0)
    for (const cat of Object.keys(ACHIEVEMENT_CATEGORIES)) {
      categoryMaps.get(cat)!.set(personId, 0)
    }
  }

  for (const ach of achievements ?? []) {
    if (!overallMap.has(ach.user_id)) continue
    overallMap.set(ach.user_id, (overallMap.get(ach.user_id) ?? 0) + ach.points)
    const catMap = categoryMaps.get(ach.category as AchievementCategory)
    if (catMap?.has(ach.user_id)) {
      catMap.set(ach.user_id, (catMap.get(ach.user_id) ?? 0) + ach.points)
    }
  }

  // ── Rank for selected category ─────────────────────────────────────────────
  function filterToPool(src: Map<string, number>): Map<string, number> {
    const out = new Map<string, number>()
    src.forEach((v, k) => { if (poolIds.includes(k)) out.set(k, v) })
    return out
  }

  const selectedSrc = category === 'overall'
    ? overallMap
    : (categoryMaps.get(category) ?? new Map<string, number>())
  const selected = computeRank(filterToPool(selectedSrc), user.id)

  // ── Category breakdown ─────────────────────────────────────────────────────
  const breakdown: Record<string, RankStat> = {}
  for (const cat of Object.keys(ACHIEVEMENT_CATEGORIES)) {
    const catMap = categoryMaps.get(cat) ?? new Map<string, number>()
    breakdown[cat] = computeRank(filterToPool(catMap), user.id)
  }

  // ── Comparison ────────────────────────────────────────────────────────────
  let comparison = null
  if (personId) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, username, full_name, avatar_url')
      .eq('id', personId)
      .single()

    if (profile) {
      const myOverall    = overallMap.get(user.id) ?? 0
      const theirOverall = overallMap.get(personId) ?? 0

      // selected: points for the chosen category (or overall if 'overall')
      const selectedMine   = category === 'overall'
        ? myOverall
        : (categoryMaps.get(category)?.get(user.id) ?? 0)
      const selectedTheirs = category === 'overall'
        ? theirOverall
        : (categoryMaps.get(category)?.get(personId) ?? 0)

      const rows = (Object.entries(ACHIEVEMENT_CATEGORIES) as [AchievementCategory, { label: string; weight: number }][]).map(([key, meta]) => {
        const mine   = categoryMaps.get(key)?.get(user.id) ?? 0
        const theirs = categoryMaps.get(key)?.get(personId) ?? 0
        return { category: key, label: meta.label, mine, theirs, diff: mine - theirs }
      })

      comparison = {
        profile,
        overall:  { mine: myOverall,    theirs: theirOverall,  diff: myOverall    - theirOverall  },
        selected: { mine: selectedMine, theirs: selectedTheirs, diff: selectedMine - selectedTheirs },
        rows,
      }

      if (process.env.NODE_ENV === 'development') {
        console.log('[rankings/comparison]', {
          category,
          selected: comparison.selected,
          overall:  comparison.overall,
          educationRow: rows.find(r => r.category === 'education'),
        })
      }
    }
  }

  // ── Pool average (for insight text) ──────────────────────────────────────
  const poolValues = Array.from(filterToPool(overallMap).values())
  const poolAverage = poolValues.length > 0
    ? Math.round(poolValues.reduce((a, b) => a + b, 0) / poolValues.length)
    : 0

  return NextResponse.json({ selected, breakdown, comparison, poolAverage })
}
