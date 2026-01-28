-- Builder OS Profile table
create table if not exists public.builder_os_profile (
  id uuid not null default gen_random_uuid (),
  user_id uuid not null references auth.users (id) on delete cascade,
  builder_mode text not null, -- e.g. 'Deep Focus Builder', 'Burst Builder'
  dominant_pattern text not null, -- e.g. 'Momentum Decay'
  execution_style text not null, -- e.g. 'Execution-Driven'
  friction_type text not null, -- e.g. 'Context Overload'
  summary_label text not null, -- Short summary e.g. 'High Velocity, Low Focus'
  updated_at timestamp with time zone not null default now(),
  constraint builder_os_profile_user_key unique (user_id)
);

-- RLS
alter table public.builder_os_profile enable row level security;

-- Policies
create policy "Users view own profile" on public.builder_os_profile for select using (auth.uid() = user_id);
create policy "Users insert/update own profile" on public.builder_os_profile for all using (auth.uid() = user_id);
