-- Builder OS History (Snapshots)
create table if not exists public.builder_os_history (
  id uuid not null default gen_random_uuid (),
  user_id uuid not null references auth.users (id) on delete cascade,
  builder_mode text not null,
  execution_style text not null,
  dominant_pattern text not null,
  friction_type text not null,
  recorded_at timestamp with time zone not null default now()
);

-- Builder OS Drift (Analysis of change)
create table if not exists public.builder_os_drift (
  id uuid not null default gen_random_uuid (),
  user_id uuid not null references auth.users (id) on delete cascade,
  summary text not null,
  severity text not null, -- 'stable', 'minor shift', 'major shift'
  created_at timestamp with time zone not null default now(),
  constraint builder_os_drift_user_key unique (user_id) -- Keep latest drift per user easily accessible? Or log history? Prompt implies showing latest. Let's enforce unique for MVP simplicity or just query latest. unique is safer for 1:1 mapping in dashboard.
);

-- RLS
alter table public.builder_os_history enable row level security;
alter table public.builder_os_drift enable row level security;

-- Policies
create policy "Users view own history" on public.builder_os_history for select using (auth.uid() = user_id);
create policy "Users insert own history" on public.builder_os_history for insert with check (auth.uid() = user_id);

create policy "Users view own drift" on public.builder_os_drift for select using (auth.uid() = user_id);
create policy "Users insert/update own drift" on public.builder_os_drift for all using (auth.uid() = user_id);
