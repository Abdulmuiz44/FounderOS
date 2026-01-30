-- Create waitlist table
create table public.waitlist (
  id uuid not null default gen_random_uuid (),
  email text not null unique,
  source text default 'landing',
  created_at timestamp with time zone not null default now(),
  constraint waitlist_pkey primary key (id)
);

-- Create approved users table
create table public.approved_users (
  email text not null primary key,
  created_at timestamp with time zone not null default now()
);

-- Enable RLS
alter table public.waitlist enable row level security;
alter table public.approved_users enable row level security;

-- Policies
-- Allow anyone to insert into waitlist (public access for signup)
create policy "Anyone can join waitlist" on public.waitlist
  for insert
  with check (true);

-- Allow authenticated users to read approved_users (to check their own status)
create policy "Users can check approval status" on public.approved_users
  for select
  using (true);

-- Allow service role full access
