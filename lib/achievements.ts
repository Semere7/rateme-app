// ─── Categories (the "domain") ────────────────────────────────────────────────

export const ACHIEVEMENT_CATEGORIES = {
  global_impact: { label: 'Global Impact', weight: 110 },
  technology:    { label: 'Technology',     weight: 110 },
  human_rights:  { label: 'Human Rights',   weight: 90  },
  sports:        { label: 'Sports',         weight: 90  },
  business:      { label: 'Business',       weight: 75  },
  education:     { label: 'Education',      weight: 50  },
} as const

export type AchievementCategory = keyof typeof ACHIEVEMENT_CATEGORIES

export const VALID_CATEGORIES = Object.keys(ACHIEVEMENT_CATEGORIES) as AchievementCategory[]

// ─── Impact levels (display only) ────────────────────────────────────────────

export const IMPACT_LEVELS = [
  { level: 1, label: 'Minor'          },
  { level: 2, label: 'Moderate'       },
  { level: 3, label: 'Significant'    },
  { level: 4, label: 'Major'          },
  { level: 5, label: 'Transformative' },
] as const

// ─── Achievement types (fixed category + impact per type) ─────────────────────
// points = category.weight × impactLevel — users cannot change these values

export const ACHIEVEMENT_TYPES = [
  { type: 'high_school',     label: 'High School Graduate',      icon: '🎓', category: 'education'    as AchievementCategory, impactLevel: 1 },
  { type: 'bachelor',        label: "Bachelor's Degree",          icon: '🏛️', category: 'education'    as AchievementCategory, impactLevel: 3 },
  { type: 'master',          label: "Master's Degree",            icon: '📜', category: 'education'    as AchievementCategory, impactLevel: 4 },
  { type: 'course',          label: 'Completed Course',           icon: '📚', category: 'education'    as AchievementCategory, impactLevel: 1 },
  { type: 'certification',   label: 'Professional Certification', icon: '🏆', category: 'education'    as AchievementCategory, impactLevel: 2 },
  { type: 'work_experience', label: 'Work Experience',            icon: '💼', category: 'business'     as AchievementCategory, impactLevel: 2 },
  { type: 'military',        label: 'Military Service',           icon: '🎖️', category: 'human_rights' as AchievementCategory, impactLevel: 3 },
  { type: 'volunteering',    label: 'Volunteering',               icon: '🤝', category: 'global_impact' as AchievementCategory, impactLevel: 2 },
  { type: 'business',        label: 'Started a Business',         icon: '🚀', category: 'business'     as AchievementCategory, impactLevel: 3 },
] as const

export type AchievementTypeKey = typeof ACHIEVEMENT_TYPES[number]['type']

export const VALID_TYPES = ACHIEVEMENT_TYPES.map((a) => a.type) as string[]

export function getAchievementMeta(type: string) {
  return ACHIEVEMENT_TYPES.find((a) => a.type === type) ?? null
}

// ─── Points formula ───────────────────────────────────────────────────────────

export function computePoints(category: AchievementCategory, impactLevel: number): number {
  return ACHIEVEMENT_CATEGORIES[category].weight * impactLevel
}

// Returns the fixed {category, impactLevel, points} for a given achievement type.
// These values are authoritative — the client and API both use this, not user input.
export function getAchievementDefaults(type: string): { category: AchievementCategory; impactLevel: number; points: number } | null {
  const meta = getAchievementMeta(type)
  if (!meta) return null
  return {
    category:    meta.category,
    impactLevel: meta.impactLevel,
    points:      computePoints(meta.category, meta.impactLevel),
  }
}

// ─── Achievement level system ─────────────────────────────────────────────────

export type AchievementLevel = {
  label:  string
  prevAt: number
  nextAt: number | null
  nextLabel: string | null
  tone:   'gray' | 'blue' | 'indigo' | 'purple' | 'emerald'
}

const LEVELS: AchievementLevel[] = [
  { label: 'Beginner',     prevAt: 0,    nextAt: 300,  nextLabel: 'Rising',       tone: 'gray'    },
  { label: 'Rising',       prevAt: 300,  nextAt: 800,  nextLabel: 'Intermediate', tone: 'blue'    },
  { label: 'Intermediate', prevAt: 800,  nextAt: 1500, nextLabel: 'Advanced',     tone: 'indigo'  },
  { label: 'Advanced',     prevAt: 1500, nextAt: 3000, nextLabel: 'Expert',       tone: 'purple'  },
  { label: 'Expert',       prevAt: 3000, nextAt: null, nextLabel: null,           tone: 'emerald' },
]

export function getAchievementLevel(points: number): AchievementLevel {
  return LEVELS.slice().reverse().find(l => points >= l.prevAt) ?? LEVELS[0]
}

export function getLevelProgress(points: number, level: AchievementLevel): number {
  if (!level.nextAt) return 100
  return Math.min(100, Math.round(((points - level.prevAt) / (level.nextAt - level.prevAt)) * 100))
}

export const LEVEL_COLORS: Record<AchievementLevel['tone'], string> = {
  gray:    'text-gray-600',
  blue:    'text-blue-600',
  indigo:  'text-indigo-700',
  purple:  'text-purple-700',
  emerald: 'text-emerald-600',
}

export const LEVEL_BADGE_COLORS: Record<AchievementLevel['tone'], string> = {
  gray:    'bg-gray-100   text-gray-600    border-gray-200',
  blue:    'bg-blue-100   text-blue-700    border-blue-200',
  indigo:  'bg-indigo-100 text-indigo-700  border-indigo-200',
  purple:  'bg-purple-100 text-purple-700  border-purple-200',
  emerald: 'bg-emerald-100 text-emerald-700 border-emerald-200',
}

export const LEVEL_BAR_COLORS: Record<AchievementLevel['tone'], string> = {
  gray:    'bg-gray-400',
  blue:    'bg-blue-500',
  indigo:  'bg-indigo-500',
  purple:  'bg-purple-500',
  emerald: 'bg-emerald-500',
}

// ─── Percentile display ───────────────────────────────────────────────────────
// "Top X%" for good positions; "Bottom X%" (how many you beat) for bad ones.
// Returns null for topPct >= 100 — never render "Top 100%".

export type PercentileInfo = { label: string; tone: 'great' | 'good' | 'neutral' | 'low' }

export function formatPercentile(topPct: number): PercentileInfo | null {
  if (topPct >= 100) return null
  if (topPct <= 10)  return { label: `Top ${topPct}%`,       tone: 'great'    }
  if (topPct <= 25)  return { label: `Top ${topPct}%`,       tone: 'good'     }
  if (topPct <= 50)  return { label: `Top ${topPct}%`,       tone: 'neutral'  }
  // Bottom half: show how many you beat instead of the confusing "Top 84%"
  const beaten = 100 - topPct
  return { label: `Bottom ${Math.max(1, beaten)}%`, tone: 'low' }
}

export const PERCENTILE_COLORS: Record<PercentileInfo['tone'], string> = {
  great:   'text-emerald-600',
  good:    'text-blue-600',
  neutral: 'text-gray-600',
  low:     'text-gray-400',
}

// ─── Ranking ──────────────────────────────────────────────────────────────────

export function computeAchievementRank(
  allScores: { user_id: string; total_points: number }[],
  myPoints: number,
) {
  // Need at least 2 users to produce a meaningful rank (prevents "Top 100%")
  if (allScores.length < 2 || myPoints <= 0) return null
  const rank   = allScores.filter((s) => s.total_points > myPoints).length + 1
  const total  = allScores.length
  const topPct = Math.ceil((rank / total) * 100)
  return { rank, total, topPct }
}

// ─── Category UI styles ───────────────────────────────────────────────────────

export const CATEGORY_STYLES: Record<AchievementCategory, string> = {
  global_impact: 'bg-purple-100 text-purple-700 border-purple-200',
  technology:    'bg-blue-100 text-blue-700 border-blue-200',
  human_rights:  'bg-rose-100 text-rose-700 border-rose-200',
  sports:        'bg-green-100 text-green-700 border-green-200',
  business:      'bg-amber-100 text-amber-700 border-amber-200',
  education:     'bg-sky-100 text-sky-700 border-sky-200',
}
