-- Run this in your Supabase SQL Editor
-- Go to: https://app.supabase.com → Your Project → SQL Editor → New query

-- 1. Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  goal_name TEXT,
  goal_photo_url TEXT,
  goal_target_total NUMERIC,
  yearly_target NUMERIC,
  default_monthly_goal NUMERIC NOT NULL DEFAULT 500,
  best_streak INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Months table
CREATE TABLE IF NOT EXISTS months (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  year INT NOT NULL,
  month INT NOT NULL CHECK (month BETWEEN 1 AND 12),
  savings_goal NUMERIC NOT NULL DEFAULT 500,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, year, month)
);

-- 3. Line items table
CREATE TABLE IF NOT EXISTS line_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  month_id UUID NOT NULL REFERENCES months(id) ON DELETE CASCADE,
  section TEXT NOT NULL CHECK (section IN ('income','bills','needs','wants','savings','debt')),
  name TEXT NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  sort_order INT NOT NULL DEFAULT 0,
  is_custom BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. User default rows table
CREATE TABLE IF NOT EXISTS user_default_rows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  section TEXT NOT NULL CHECK (section IN ('income','bills','needs','wants','savings','debt')),
  name TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0
);

-- 5. Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE months ENABLE ROW LEVEL SECURITY;
ALTER TABLE line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_default_rows ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Months policies
CREATE POLICY "Users can view own months" ON months
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own months" ON months
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own months" ON months
  FOR UPDATE USING (auth.uid() = user_id);

-- Line items policies (via month ownership)
CREATE POLICY "Users can view own line items" ON line_items
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM months WHERE months.id = line_items.month_id AND months.user_id = auth.uid())
  );
CREATE POLICY "Users can insert own line items" ON line_items
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM months WHERE months.id = line_items.month_id AND months.user_id = auth.uid())
  );
CREATE POLICY "Users can update own line items" ON line_items
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM months WHERE months.id = line_items.month_id AND months.user_id = auth.uid())
  );
CREATE POLICY "Users can delete own line items" ON line_items
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM months WHERE months.id = line_items.month_id AND months.user_id = auth.uid())
  );

-- User default rows policies
CREATE POLICY "Users can manage own default rows" ON user_default_rows
  FOR ALL USING (auth.uid() = user_id);

-- 6. Storage bucket for goal photos (run separately if needed)
-- In Supabase Dashboard → Storage → New bucket → name: "goal-photos" → Public: ON
