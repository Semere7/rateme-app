export type Profile = {
  id: string
  username: string
  full_name: string
  bio: string
  avatar_url: string
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
