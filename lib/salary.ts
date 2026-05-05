// ─── Field / profession ───────────────────────────────────────────────────────

export const SALARY_FIELDS = [
  { value: 'software_engineering', label: 'Software Engineering' },
  { value: 'cybersecurity',        label: 'Cybersecurity'        },
  { value: 'it_support',           label: 'IT Support'           },
  { value: 'data_ai',              label: 'Data / AI'            },
  { value: 'finance',              label: 'Finance'              },
  { value: 'business',             label: 'Business'             },
  { value: 'marketing',            label: 'Marketing'            },
  { value: 'other',                label: 'Other'                },
] as const

export type SalaryField = typeof SALARY_FIELDS[number]['value']

// ─── Experience levels ────────────────────────────────────────────────────────

export const EXPERIENCE_LEVELS = [
  { value: '0_1',    label: '0–1 years' },
  { value: '1_2',    label: '1–2 years' },
  { value: '2_5',    label: '2–5 years' },
  { value: '5_plus', label: '5+ years'  },
] as const

export type ExperienceLevel = typeof EXPERIENCE_LEVELS[number]['value']

// ─── Countries (validated list — no free-text entry) ─────────────────────────
// Values are the country names themselves (no slug mapping needed).

export const COUNTRY_LIST: string[] = [
  'Afghanistan', 'Albania', 'Algeria', 'Angola', 'Argentina',
  'Armenia', 'Australia', 'Austria', 'Azerbaijan', 'Bangladesh',
  'Belarus', 'Belgium', 'Bolivia', 'Bosnia and Herzegovina', 'Brazil',
  'Bulgaria', 'Cambodia', 'Cameroon', 'Canada', 'Chile',
  'China', 'Colombia', 'Costa Rica', 'Croatia', 'Czech Republic',
  'Denmark', 'Dominican Republic', 'Ecuador', 'Egypt', 'El Salvador',
  'Estonia', 'Ethiopia', 'Finland', 'France', 'Georgia',
  'Germany', 'Ghana', 'Greece', 'Guatemala', 'Honduras',
  'Hungary', 'India', 'Indonesia', 'Iran', 'Iraq',
  'Ireland', 'Israel', 'Italy', 'Japan', 'Jordan',
  'Kazakhstan', 'Kenya', 'Kuwait', 'Latvia', 'Lebanon',
  'Lithuania', 'Malaysia', 'Mexico', 'Morocco', 'Netherlands',
  'New Zealand', 'Nigeria', 'North Macedonia', 'Norway', 'Oman',
  'Pakistan', 'Panama', 'Paraguay', 'Peru', 'Philippines',
  'Poland', 'Portugal', 'Qatar', 'Romania', 'Russia',
  'Saudi Arabia', 'Senegal', 'Serbia', 'Singapore', 'Slovakia',
  'Slovenia', 'Somalia', 'South Africa', 'South Korea', 'Spain',
  'Sri Lanka', 'Sudan', 'Sweden', 'Switzerland', 'Syria',
  'Taiwan', 'Tanzania', 'Thailand', 'Tunisia', 'Turkey',
  'Uganda', 'Ukraine', 'United Arab Emirates', 'United Kingdom',
  'United States', 'Uruguay', 'Uzbekistan', 'Venezuela', 'Vietnam',
  'Yemen', 'Zimbabwe',
]

// ─── Employment types ─────────────────────────────────────────────────────────

export const EMPLOYMENT_TYPES = [
  { value: 'student_job',   label: 'Student job'   },
  { value: 'full_time',     label: 'Full-time'     },
  { value: 'part_time',     label: 'Part-time'     },
  { value: 'freelance',     label: 'Freelance'     },
  { value: 'self_employed', label: 'Self-employed' },
] as const

export type EmploymentType = typeof EMPLOYMENT_TYPES[number]['value']

// ─── Currencies ───────────────────────────────────────────────────────────────

export const CURRENCIES = [
  { value: 'ILS', label: '₪ ILS' },
  { value: 'USD', label: '$ USD' },
  { value: 'EUR', label: '€ EUR' },
] as const

export const CURRENCY_SYMBOLS: Record<string, string> = {
  ILS: '₪',
  USD: '$',
  EUR: '€',
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function getFieldLabel(value: string): string {
  return SALARY_FIELDS.find(f => f.value === value)?.label ?? value
}

export function getExperienceLabel(value: string): string {
  return EXPERIENCE_LEVELS.find(e => e.value === value)?.label ?? value
}

export function getCountryLabel(value: string): string {
  // Country values are the display names themselves
  return value
}

export function getEmploymentLabel(value: string): string {
  return EMPLOYMENT_TYPES.find(e => e.value === value)?.label ?? value
}

export function formatSalary(amount: number, currency: string): string {
  const sym = CURRENCY_SYMBOLS[currency] ?? currency
  return `${sym}${Math.round(amount).toLocaleString()}`
}

export function getScopeLabel(
  scope: string,
  field?: string | null,
  experienceLevel?: string | null,
  country?: string | null,
): string {
  if (scope === 'exact')             return 'Same field, experience, country & employment type'
  if (scope === 'field_exp_country') return 'Same field, experience & country'
  if (scope === 'field_exp')         return 'Same field & experience level'
  if (scope === 'field')             return field ? `All ${getFieldLabel(field)} professionals` : 'Same field'
  if (scope === 'all')               return 'All users'
  return 'Similar users'
}

// ─── Salary recommendations ───────────────────────────────────────────────────

export function generateRecommendations(params: {
  myMidpoint:    number
  avgMidpoint:   number | null
  p90Midpoint:   number | null
  field:         string
  achievementPoints: number
  currency:      string
}): string[] {
  const { myMidpoint, avgMidpoint, p90Midpoint, field, achievementPoints, currency } = params
  const sym  = CURRENCY_SYMBOLS[currency] ?? currency
  const recs: string[] = []

  if (avgMidpoint) {
    const ratio = myMidpoint / avgMidpoint
    if (ratio < 0.85) {
      const gap = Math.round(avgMidpoint - myMidpoint)
      recs.push(
        `Your salary is ${formatSalary(gap, currency)} below the average for your group. Consider negotiating your next raise or exploring higher-paying roles.`
      )
    } else if (ratio >= 0.85 && ratio < 1.05) {
      recs.push(`You are close to the average salary for your comparison group — solid market positioning.`)
    } else {
      recs.push(`You are earning above average for your comparison group. Keep building on your strengths.`)
    }
  }

  if (field === 'cybersecurity' && achievementPoints < 800) {
    recs.push(`Cybersecurity certifications (e.g. CompTIA Security+, CISSP) typically add significant market value.`)
  }
  if ((field === 'software_engineering' || field === 'data_ai') && achievementPoints < 800) {
    recs.push(`Adding Technology achievements to your profile may strengthen your positioning for higher-paying roles.`)
  }
  if (field === 'finance' && achievementPoints < 500) {
    recs.push(`Finance certifications and business achievements can improve your benchmark standing.`)
  }

  if (p90Midpoint && myMidpoint < p90Midpoint * 0.65) {
    const gap = Math.round(p90Midpoint - myMidpoint)
    recs.push(
      `Top 10% earners make ${formatSalary(gap, currency)} more than you. Specialising in high-demand skills or seniority roles could close that gap.`
    )
  }

  if (recs.length < 2) {
    recs.push(`Keep adding verified achievements to build a stronger overall profile across salary and social benchmarks.`)
  }

  return recs.slice(0, 4)
}
