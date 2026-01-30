-- Projects table
create table if not exists public.projects (
  id uuid not null default gen_random_uuid (),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  description text,
  audience text,
  current_blockers text,
  uncertainties text,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint projects_pkey primary key (id)
);

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
alter table public.projects enable row level security;
alter table public.project_logs enable row level security;

-- Policies
create policy "Users can view own projects" on public.projects for select using (auth.uid() = user_id);
create policy "Users can insert own projects" on public.projects for insert with check (auth.uid() = user_id);
create policy "Users can update own projects" on public.projects for update using (auth.uid() = user_id);
create policy "Users can delete own projects" on public.projects for delete using (auth.uid() = user_id);

create policy "Users can view own logs" on public.project_logs for select using (auth.uid() = user_id);
create policy "Users can insert own logs" on public.project_logs for insert with check (auth.uid() = user_id);
create policy "Users can update own logs" on public.project_logs for update using (auth.uid() = user_id);
create policy "Users can delete own logs" on public.project_logs for delete using (auth.uid() = user_id);
