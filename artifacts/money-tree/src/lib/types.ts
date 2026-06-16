export type Section = "savings" | "income" | "bills" | "needs" | "wants" | "debt";

export interface Profile {
  user_id: string;
  currency: string;
  goal_name: string | null;
  goal_photo_url: string | null;
  goal_target_total: number | null;
  yearly_target: number | null;
  default_monthly_goal: number;
  best_streak: number;
  onboarding_completed: boolean;
  is_premium: boolean;
  stripe_customer_id: string | null;
  created_at: string;
}

export interface Month {
  id: string;
  user_id: string;
  year: number;
  month: number;
  savings_goal: number;
  created_at: string;
  updated_at: string;
}

export interface LineItem {
  id: string;
  month_id: string;
  section: Section;
  name: string;
  amount: number;
  actual_amount: number | null;
  sort_order: number;
  is_custom: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserDefaultRow {
  id: string;
  user_id: string;
  section: Section;
  name: string;
  sort_order: number;
}
