-- Create NextAuth tables
create table if not exists public.accounts (
  id uuid not null default gen_random_uuid() primary key,
  "userId" uuid not null references public.users(id) on delete cascade,
  type text not null,
  provider text not null,
  "providerAccountId" text not null,
  refresh_token text,
  access_token text,
  expires_at bigint,
  token_type text,
  scope text,
  id_token text,
  session_state text,
  
  constraint provider_unique unique(provider, "providerAccountId")
);

create table if not exists public.sessions (
  id uuid not null default gen_random_uuid() primary key,
  "sessionToken" text not null unique,
  "userId" uuid not null references public.users(id) on delete cascade,
  expires timestamptz not null
);

create table if not exists public.verification_tokens (
  identifier text not null,
  token text not null,
  expires timestamptz not null,
  
  constraint token_unique unique(identifier, token)
);

-- Modify public.users
-- Remove dependency on auth.users so we can create users directly
alter table public.users drop constraint if exists users_id_fkey;
alter table public.users alter column id set default gen_random_uuid();

-- Add password column for manual auth
alter table public.users add column if not exists password_hash text;

-- Add mappings for NextAuth (Auth.js expects 'name', 'image', 'emailVerified')
alter table public.users add column if not exists name text;
alter table public.users add column if not exists image text;
alter table public.users add column if not exists "emailVerified" timestamptz;

-- Sync existing data
update public.users set name = full_name where name is null;
update public.users set image = avatar_url where image is null;
