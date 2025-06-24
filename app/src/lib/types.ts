export interface User {
  id: string
  email: string
  phone?: string
  full_name: string
  avatar_url?: string
  referral_code: string
  referred_by?: string
  is_activated: boolean
  activation_date?: string
  balance: number
  total_earned: number
  is_admin: boolean
  created_at: string
  updated_at: string
}

export interface Task {
  id: string
  title: string
  description: string
  reward_amount: number
  task_type: "daily" | "social" | "survey" | "referral"
  requirements: any
  questions?: Question[]
  is_active: boolean
  created_at: string
}

export interface Question {
  id: string
  question: string
  type: "multiple_choice" | "text" | "boolean"
  options?: string[]
  correct_answer?: string | boolean
  required: boolean
}

export interface UserTask {
  id: string
  user_id: string
  task_id: string
  status: "pending" | "completed" | "verified" | "rejected"
  answers?: any
  proof_url?: string
  completed_at?: string
  verified_at?: string
  reward_paid: number
  created_at: string
  task?: Task
}

export interface Transaction {
  id: string
  user_id: string
  type: "activation" | "task_reward" | "referral_bonus" | "withdrawal"
  amount: number
  status: "pending" | "completed" | "failed"
  reference?: string
  description: string
  created_at: string
}

export interface Referral {
  id: string
  referrer_id: string
  referred_id: string
  bonus_paid: number
  created_at: string
  referred_user?: User
}

export interface Withdrawal {
  id: string
  user_id: string
  amount: number
  bank_name: string
  account_number: string
  account_name: string
  status: "pending" | "processing" | "completed" | "failed"
  reference?: string
  processed_at?: string
  created_at: string
}
