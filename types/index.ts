export type Profile = {
  id: string
  username: string
  full_name: string
  bio: string
  avatar_url: string
  profile_type: 'user' | 'public_figure'
  created_at: string
  updated_at: string
}

export type FriendshipStatus = 'pending' | 'accepted' | 'rejected'

export type Friendship = {
  id: string
  requester_id: string
  addressee_id: string
  status: FriendshipStatus
  created_at: string
  updated_at: string
  requester?: Profile
  addressee?: Profile
}

export type Rating = {
  id: string
  rater_id: string
  ratee_id: string
  trust: number
  communication: number
  helpfulness: number
  respect: number
  comment: string
  created_at: string
  updated_at: string
  rater?: Profile
}

export type UserScore = {
  user_id: string
  overall_score: number | null
  trust_avg: number | null
  communication_avg: number | null
  helpfulness_avg: number | null
  respect_avg: number | null
  rating_count: number
}

export type Report = {
  id: string
  reporter_id: string
  rating_id: string
  reason: string
  status: 'pending' | 'reviewed' | 'resolved'
  created_at: string
}

export type AchievementType =
  | 'high_school' | 'bachelor' | 'master' | 'course'
  | 'certification' | 'work_experience' | 'military'
  | 'volunteering' | 'business'

export type AchievementCategory =
  | 'global_impact' | 'technology' | 'human_rights'
  | 'sports' | 'business' | 'education'

export type Achievement = {
  id: string
  user_id: string
  achievement_type: AchievementType
  category: AchievementCategory
  impact_level: number   // 1–5
  title: string
  description: string
  points: number         // stored as category_weight × impact_level
  verification_status: 'pending' | 'verified' | 'rejected'
  created_at: string
}

export type AchievementScore = {
  user_id: string
  total_points: number
  verified_points: number
  achievement_count: number
  verified_count: number
}

export type SalaryProfile = {
  id: string
  user_id: string
  salary_min: number
  salary_max: number
  currency: string
  field: string
  experience_level: string
  country: string
  employment_type: string
  is_private: boolean
  include_in_benchmarks: boolean
  created_at: string
  updated_at: string
}
