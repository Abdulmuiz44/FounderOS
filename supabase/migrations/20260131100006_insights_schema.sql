-- Builder Insights table
create table if not exists public.builder_insights (
  id uuid not null default gen_random_uuid (),
  user_id uuid not null references auth.users (id) on delete cascade,
  insight_text text not null,
  generated_from_patterns jsonb, -- Stores the patterns used to generate this insight
  updated_at timestamp with time zone not null default now(),
  constraint builder_insights_user_key unique (user_id)
);

-- RLS
alter table public.builder_insights enable row level security;

-- Policies
create policy "Users view own insights" on public.builder_insights for select using (auth.uid() = user_id);
create policy "Users insert/update own insights" on public.builder_insights for all using (auth.uid() = user_id);
