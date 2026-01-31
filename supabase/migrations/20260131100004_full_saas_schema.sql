-- Projects table definition removed in favor of saas_v2_schema.sql

-- Project Logs (Workspace entries)
create table if not exists public.project_logs (
  id uuid not null default gen_random_uuid (),
  project_id uuid not null references public.projects (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  content text not null,
  type text not null default 'note', -- 'note', 'experiment', 'ai_output'
  tags text[] default '{}',
  created_at timestamp with time zone not null default now(),
  constraint project_logs_pkey primary key (id)
);

-- RLS
-- alter table public.projects enable row level security; -- Removed
alter table public.project_logs enable row level security;

-- Policies
-- Projects policies removed

drop policy if exists "Users can view own logs" on public.project_logs;
create policy "Users can view own logs" on public.project_logs for select using (auth.uid() = user_id);

drop policy if exists "Users can insert own logs" on public.project_logs;
create policy "Users can insert own logs" on public.project_logs for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update own logs" on public.project_logs;
create policy "Users can update own logs" on public.project_logs for update using (auth.uid() = user_id);

drop policy if exists "Users can delete own logs" on public.project_logs;
create policy "Users can delete own logs" on public.project_logs for delete using (auth.uid() = user_id);
