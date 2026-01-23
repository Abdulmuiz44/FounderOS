# Supabase Setup for FounderOS

1. Create a new Supabase project.
2. Run the following SQL in the SQL Editor:

```sql
-- Create the table for briefs
create table public.founder_briefs (
  id uuid not null default gen_random_uuid (),
  user_id uuid not null references auth.users (id) on delete cascade,
  week_start_date date not null,
  executive_summary text not null,
  key_observations jsonb not null,
  meaning text not null,
  founder_focus jsonb not null,
  created_at timestamp with time zone not null default now(),
  constraint founder_briefs_pkey primary key (id),
  constraint founder_briefs_user_week_key unique (user_id, week_start_date)
);

-- Enable RLS
alter table public.founder_briefs enable row level security;

-- Create policies
create policy "Users can view their own briefs" on public.founder_briefs
  for select
  using (auth.uid() = user_id);

create policy "Users can insert/update their own briefs" on public.founder_briefs
  for all
  using (auth.uid() = user_id);
```

3. Update your `.env` (and Vercel Environment Variables) with:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
