-- Builder Patterns table
create table if not exists public.builder_patterns (
  id uuid not null default gen_random_uuid (),
  user_id uuid not null references auth.users (id) on delete cascade,
  pattern_type text not null, -- 'momentum', 'focus', 'execution', 'friction'
  pattern_label text not null, -- e.g. 'Momentum Decay', 'Context Switching'
  explanation text,
  confidence_score float not null default 0.0,
  updated_at timestamp with time zone not null default now(),
  constraint builder_patterns_user_type_key unique (user_id, pattern_type)
);

-- RLS
alter table public.builder_patterns enable row level security;

-- Policies
create policy "Users view own patterns" on public.builder_patterns for select using (auth.uid() = user_id);
create policy "Users insert/update own patterns" on public.builder_patterns for all using (auth.uid() = user_id);
