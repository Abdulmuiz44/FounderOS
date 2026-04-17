
-- Create verdicts table
create table if not exists public.verdicts (
  id uuid not null default gen_random_uuid (),
  user_id uuid not null references auth.users (id) on delete cascade,
  week_start_date date not null,
  input_context jsonb not null, -- { building, audience, summary, blockers, uncertainties }
  verdict_type text not null, -- 'continue', 'pivot', 'simplify'
  explanation text not null,
  focus_for_next_week text not null,
  experiment_suggestion text not null,
  tags text[] default '{}', -- 'Momentum', 'Attention', 'Stable'
  created_at timestamp with time zone not null default now(),
  constraint verdicts_pkey primary key (id)
);

-- Subscriptions table definition removed in favor of 20260130_create_subscriptions.sql

-- Enable RLS
alter table public.verdicts enable row level security;
-- alter table public.subscriptions enable row level security; -- Removed

-- Policies for Verdicts
drop policy if exists "Users can view their own verdicts" on public.verdicts;
create policy "Users can view their own verdicts" on public.verdicts
  for select using (auth.uid() = user_id);

drop policy if exists "Users can insert their own verdicts" on public.verdicts;
create policy "Users can insert their own verdicts" on public.verdicts
  for insert with check (auth.uid() = user_id);

-- Policies for Subscriptions (Removed)

-- Service role policies (implicit usually, but good to be safe if strictly locked down)
-- We'll handle subscription updates via webhook (service role)
