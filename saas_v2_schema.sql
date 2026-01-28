-- Users table is handled by auth.users in Supabase

-- Subscriptions table
create table if not exists public.subscriptions (
  id uuid not null default gen_random_uuid (),
  user_id uuid not null references auth.users (id) on delete cascade,
  lemon_squeezy_id text unique,
  order_id text,
  plan text not null, -- 'starter' or 'pro'
  status text not null, -- 'active', 'cancelled', 'expired', 'on_trial'
  renews_at timestamp with time zone,
  created_at timestamp with time zone not null default now(),
  constraint subscriptions_user_key unique (user_id)
);

-- Projects table
create table if not exists public.projects (
  id uuid not null default gen_random_uuid (),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  description text,
  audience text,
  current_goal text,
  open_questions text,
  notes text,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint projects_pkey primary key (id)
);

-- Logs table (Core feature)
create table if not exists public.logs (
  id uuid not null default gen_random_uuid (),
  project_id uuid not null references public.projects (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  content text not null, -- formatted text or JSON depending on editor
  log_type text default 'update', -- 'update', 'learning', 'blocker'
  created_at timestamp with time zone not null default now(),
  constraint logs_pkey primary key (id)
);

-- AI Summaries table
create table if not exists public.ai_summaries (
  id uuid not null default gen_random_uuid (),
  log_id uuid references public.logs (id) on delete cascade,
  project_id uuid references public.projects (id) on delete cascade, -- optional, for project-level summaries
  summary_text text not null,
  created_at timestamp with time zone not null default now(),
  constraint ai_summaries_pkey primary key (id)
);

-- RLS
alter table public.subscriptions enable row level security;
alter table public.projects enable row level security;
alter table public.logs enable row level security;
alter table public.ai_summaries enable row level security;

-- Policies
create policy "Users view own subscription" on public.subscriptions for select using (auth.uid() = user_id);
create policy "Users view own projects" on public.projects for select using (auth.uid() = user_id);
create policy "Users insert own projects" on public.projects for insert with check (auth.uid() = user_id);
create policy "Users update own projects" on public.projects for update using (auth.uid() = user_id);
create policy "Users delete own projects" on public.projects for delete using (auth.uid() = user_id);

create policy "Users view own logs" on public.logs for select using (auth.uid() = user_id);
create policy "Users insert own logs" on public.logs for insert with check (auth.uid() = user_id);
create policy "Users delete own logs" on public.logs for delete using (auth.uid() = user_id);

create policy "Users view own summaries" on public.ai_summaries for select using (
  exists (select 1 from public.logs where id = ai_summaries.log_id and user_id = auth.uid()) 
  or 
  exists (select 1 from public.projects where id = ai_summaries.project_id and user_id = auth.uid())
);
