-- ============================================================================
-- PROFIT TRAINING CLUB — PRODUCTION SUPABASE RELATIONAL DATABASE SCHEMA & RLS
-- ============================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. PROFILES TABLE (extends Supabase auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  role text not null check (role in ('member', 'trainer', 'admin')) default 'member',
  full_name text not null,
  avatar_url text,
  phone text,
  emergency_contact text,
  bio text,
  assigned_trainer_id uuid references public.profiles(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Index for role and lookup
create index if not exists idx_profiles_role on public.profiles(role);
create index if not exists idx_profiles_trainer on public.profiles(assigned_trainer_id);

-- 2. MEMBERSHIP PLANS
create table if not exists public.membership_plans (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text not null unique,
  price numeric(10, 2) not null,
  duration_days integer not null default 30,
  description text,
  features jsonb not null default '[]'::jsonb,
  is_popular boolean default false,
  is_active boolean default true,
  stripe_price_id text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. MEMBERSHIPS
create table if not exists public.memberships (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  plan_id uuid not null references public.membership_plans(id) on delete restrict,
  status text not null check (status in ('active', 'expiring_soon', 'expired', 'canceled')) default 'active',
  start_date date not null default current_date,
  expiry_date date not null,
  auto_renew boolean default true,
  stripe_subscription_id text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_memberships_user on public.memberships(user_id);
create index if not exists idx_memberships_status on public.memberships(status);

-- 4. ATTENDANCE (QR Based & Manual)
create table if not exists public.attendance (
  id uuid primary key default uuid_generate_v4(),
  member_id uuid not null references public.profiles(id) on delete cascade,
  check_in_time timestamp with time zone default timezone('utc'::text, now()) not null,
  check_out_time timestamp with time zone,
  gym_location text not null default 'NYC - NoHo Flagship',
  method text not null check (method in ('qr_scan', 'manual', 'nfc')) default 'qr_scan',
  date date not null default current_date,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_attendance_member on public.attendance(member_id);
create index if not exists idx_attendance_date on public.attendance(date);

-- 5. WORKOUT PLANS
create table if not exists public.workout_plans (
  id uuid primary key default uuid_generate_v4(),
  trainer_id uuid references public.profiles(id) on delete set null,
  member_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  category text not null check (category in ('Push', 'Pull', 'Legs', 'Chest', 'Back', 'Shoulders', 'Arms', 'Full Body', 'Cardio & Core')),
  notes text,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_workout_plans_member on public.workout_plans(member_id);
create index if not exists idx_workout_plans_trainer on public.workout_plans(trainer_id);

-- 6. WORKOUT EXERCISES
create table if not exists public.workout_exercises (
  id uuid primary key default uuid_generate_v4(),
  plan_id uuid not null references public.workout_plans(id) on delete cascade,
  exercise_name text not null,
  sets integer not null default 3,
  reps integer not null default 10,
  target_weight_kg numeric(6, 2) default 0,
  rest_seconds integer default 90,
  order_index integer not null default 0,
  instructions text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_exercises_plan on public.workout_exercises(plan_id);

-- 7. WORKOUT LOGS
create table if not exists public.workout_logs (
  id uuid primary key default uuid_generate_v4(),
  member_id uuid not null references public.profiles(id) on delete cascade,
  exercise_id uuid references public.workout_exercises(id) on delete set null,
  plan_id uuid references public.workout_plans(id) on delete set null,
  completed_at timestamp with time zone default timezone('utc'::text, now()) not null,
  actual_sets integer not null,
  actual_reps integer not null,
  actual_weight_kg numeric(6, 2) not null,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_workout_logs_member on public.workout_logs(member_id);

-- 8. MEMBER PROGRESS (Weight, 1RM, Body Composition)
create table if not exists public.member_progress (
  id uuid primary key default uuid_generate_v4(),
  member_id uuid not null references public.profiles(id) on delete cascade,
  recorded_date date not null default current_date,
  body_weight_kg numeric(5, 2) not null,
  bench_press_1rm numeric(6, 2),
  squat_1rm numeric(6, 2),
  deadlift_1rm numeric(6, 2),
  body_fat_percentage numeric(4, 1),
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_progress_member on public.member_progress(member_id);
create index if not exists idx_progress_date on public.member_progress(recorded_date);

-- 9. PAYMENTS
create table if not exists public.payments (
  id uuid primary key default uuid_generate_v4(),
  member_id uuid not null references public.profiles(id) on delete cascade,
  plan_id uuid references public.membership_plans(id) on delete set null,
  amount numeric(10, 2) not null,
  currency text not null default 'USD',
  status text not null check (status in ('paid', 'pending', 'failed', 'refunded')) default 'paid',
  stripe_payment_intent_id text,
  stripe_invoice_id text,
  receipt_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_payments_member on public.payments(member_id);

-- 10. NOTIFICATIONS
create table if not exists public.notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  message text not null,
  type text not null check (type in ('membership', 'workout', 'attendance', 'payment', 'system')) default 'system',
  is_read boolean default false,
  link text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_notifications_user on public.notifications(user_id);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

alter table public.profiles enable row level security;
alter table public.membership_plans enable row level security;
alter table public.memberships enable row level security;
alter table public.attendance enable row level security;
alter table public.workout_plans enable row level security;
alter table public.workout_exercises enable row level security;
alter table public.workout_logs enable row level security;
alter table public.member_progress enable row level security;
alter table public.payments enable row level security;
alter table public.notifications enable row level security;

-- Helper function to check if current user is admin
create or replace function public.is_admin()
returns boolean as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$ language sql security definer;

-- Helper function to check if current user is trainer
create or replace function public.is_trainer()
returns boolean as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'trainer'
  );
$$ language sql security definer;

-- PROFILES POLICIES
create policy "Public profiles are viewable by authenticated users"
  on public.profiles for select
  to authenticated
  using (true);

create policy "Users can update own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id or public.is_admin());

create policy "Admins can insert profiles"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = id or public.is_admin());

-- MEMBERSHIP PLANS POLICIES
create policy "Plans are viewable by everyone"
  on public.membership_plans for select
  to anon, authenticated
  using (true);

create policy "Admins can manage plans"
  on public.membership_plans for all
  to authenticated
  using (public.is_admin());

-- MEMBERSHIPS POLICIES
create policy "Members can view own membership"
  on public.memberships for select
  to authenticated
  using (auth.uid() = user_id or public.is_admin() or public.is_trainer());

create policy "Admins can manage memberships"
  on public.memberships for all
  to authenticated
  using (public.is_admin());

-- ATTENDANCE POLICIES
create policy "Members can view own attendance"
  on public.attendance for select
  to authenticated
  using (auth.uid() = member_id or public.is_admin() or public.is_trainer());

create policy "Members can insert own attendance"
  on public.attendance for insert
  to authenticated
  with check (auth.uid() = member_id or public.is_admin());

create policy "Admins can manage attendance"
  on public.attendance for all
  to authenticated
  using (public.is_admin());

-- WORKOUT PLANS POLICIES
create policy "Members can view their own workout plans"
  on public.workout_plans for select
  to authenticated
  using (auth.uid() = member_id or auth.uid() = trainer_id or public.is_admin());

create policy "Trainers and Admins can create workout plans"
  on public.workout_plans for insert
  to authenticated
  with check (public.is_trainer() or public.is_admin());

create policy "Trainers and Admins can update workout plans"
  on public.workout_plans for update
  to authenticated
  using (auth.uid() = trainer_id or public.is_admin());

-- WORKOUT EXERCISES POLICIES
create policy "Viewable if plan viewable"
  on public.workout_exercises for select
  to authenticated
  using (
    exists (
      select 1 from public.workout_plans p
      where p.id = workout_exercises.plan_id
      and (p.member_id = auth.uid() or p.trainer_id = auth.uid() or public.is_admin())
    )
  );

create policy "Trainers and Admins manage exercises"
  on public.workout_exercises for all
  to authenticated
  using (public.is_trainer() or public.is_admin());

-- WORKOUT LOGS POLICIES
create policy "Members manage own logs"
  on public.workout_logs for all
  to authenticated
  using (auth.uid() = member_id or public.is_admin() or public.is_trainer());

-- PROGRESS POLICIES
create policy "Members view and add own progress"
  on public.member_progress for all
  to authenticated
  using (auth.uid() = member_id or public.is_admin() or public.is_trainer());

-- PAYMENTS POLICIES
create policy "Members can view own payments"
  on public.payments for select
  to authenticated
  using (auth.uid() = member_id or public.is_admin());

create policy "Admins can manage payments"
  on public.payments for all
  to authenticated
  using (public.is_admin());

-- NOTIFICATIONS POLICIES
create policy "Users manage own notifications"
  on public.notifications for all
  to authenticated
  using (auth.uid() = user_id or public.is_admin());

-- ============================================================================
-- SEED DATA (Default Membership Plans)
-- ============================================================================
insert into public.membership_plans (name, slug, price, duration_days, description, features, is_popular)
values
(
  'Starter',
  'starter',
  149.00,
  30,
  'Foundational strength access for dedicated athletes starting their journey.',
  '["Full gym floor access", "Locker room & rainfall sauna", "Initial biomechanics assessment", "PROFIT mobile app access", "Basic workout template"]'::jsonb,
  false
),
(
  'Performance',
  'performance',
  249.00,
  30,
  'The complete high-performance standard. Designed for serious progression.',
  '["All Starter benefits", "Unlimited 24/7 keycard & QR access", "Bi-weekly 1-on-1 coach check-ins", "Custom periodized programming", "Recovery suite (Cold plunge + Sauna)", "InBody monthly body composition scan"]'::jsonb,
  true
),
(
  'Elite',
  'elite',
  399.00,
  30,
  'The pinnacle of bespoke physical preparation with unrestricted VIP access.',
  '["All Performance benefits", "Dedicated Senior Master Coach", "Weekly 1-on-1 private lifting sessions", "Personal nutrition & macros blueprint", "Permanent private executive locker", "Complimentary guest pass monthly", "Quarterly bloodwork & VO2 Max consult"]'::jsonb,
  false
)
on conflict (slug) do nothing;
