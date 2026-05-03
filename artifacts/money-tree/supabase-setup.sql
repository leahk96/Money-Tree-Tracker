-- ============================================================
-- Money Tree — Supabase Setup
-- Run this entire file in your Supabase dashboard:
--   SQL Editor → New Query → Paste → Run
-- ============================================================

-- ── TABLES ──────────────────────────────────────────────────

create table if not exists public.profiles (
  user_id             uuid        primary key references auth.users(id) on delete cascade,
  goal_name           text,
  goal_photo_url      text,
  goal_target_total   numeric,
  yearly_target       numeric,
  default_monthly_goal numeric     not null default 500,
  best_streak         integer     not null default 0,
  created_at          timestamptz not null default now()
);

create table if not exists public.months (
  id           uuid        primary key default gen_random_uuid(),
  user_id      uuid        not null references auth.users(id) on delete cascade,
  year         integer     not null,
  month        integer     not null,
  savings_goal numeric     not null default 500,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique(user_id, year, month)
);

create table if not exists public.line_items (
  id             uuid        primary key default gen_random_uuid(),
  month_id       uuid        not null references public.months(id) on delete cascade,
  section        text        not null check (section in ('income','savings','bills','needs','wants','debt')),
  name           text        not null,
  amount         numeric     not null default 0,
  actual_amount  numeric,
  sort_order     integer     not null default 0,
  is_custom      boolean     not null default false,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- ── ROW LEVEL SECURITY ──────────────────────────────────────

alter table public.profiles  enable row level security;
alter table public.months     enable row level security;
alter table public.line_items enable row level security;

-- Profiles
create policy "profiles: select own"  on public.profiles for select using (auth.uid() = user_id);
create policy "profiles: insert own"  on public.profiles for insert with check (auth.uid() = user_id);
create policy "profiles: update own"  on public.profiles for update using (auth.uid() = user_id);
create policy "profiles: delete own"  on public.profiles for delete using (auth.uid() = user_id);

-- Months
create policy "months: select own"    on public.months for select using (auth.uid() = user_id);
create policy "months: insert own"    on public.months for insert with check (auth.uid() = user_id);
create policy "months: update own"    on public.months for update using (auth.uid() = user_id);
create policy "months: delete own"    on public.months for delete using (auth.uid() = user_id);

-- Line items (access via month ownership)
create policy "line_items: select own" on public.line_items for select using (
  exists (select 1 from public.months where months.id = line_items.month_id and months.user_id = auth.uid())
);
create policy "line_items: insert own" on public.line_items for insert with check (
  exists (select 1 from public.months where months.id = line_items.month_id and months.user_id = auth.uid())
);
create policy "line_items: update own" on public.line_items for update using (
  exists (select 1 from public.months where months.id = line_items.month_id and months.user_id = auth.uid())
);
create policy "line_items: delete own" on public.line_items for delete using (
  exists (select 1 from public.months where months.id = line_items.month_id and months.user_id = auth.uid())
);

-- ── AUTO-CREATE PROFILE ON SIGNUP ───────────────────────────

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (user_id, default_monthly_goal, best_streak)
  values (new.id, 500, 0)
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
