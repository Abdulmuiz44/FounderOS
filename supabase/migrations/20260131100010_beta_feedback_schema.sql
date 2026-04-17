-- Add tracking columns to approved_users
alter table public.approved_users 
add column if not exists user_id uuid references auth.users(id), -- Link to auth user for easier joins
add column if not exists first_brief_at timestamp with time zone,
add column if not exists total_briefs int default 0,
add column if not exists onboarding_completed boolean default false;

-- Create feedback table
create table if not exists public.user_feedback (
  id uuid not null default gen_random_uuid (),
  user_id uuid not null references auth.users (id) on delete cascade,
  feedback_text text not null,
  created_at timestamp with time zone not null default now(),
  constraint user_feedback_pkey primary key (id)
);

-- RLS for feedback
alter table public.user_feedback enable row level security;

-- Policies
drop policy if exists "Users can insert their own feedback" on public.user_feedback;
create policy "Users can insert their own feedback" on public.user_feedback
  for insert
  with check (auth.uid() = user_id);

-- Update RLS for approved_users to allow updates (for onboarding stats)
drop policy if exists "Users can update their own stats" on public.approved_users;
create policy "Users can update their own stats" on public.approved_users
  for update
  using (email = (select email from auth.users where id = auth.uid()));
