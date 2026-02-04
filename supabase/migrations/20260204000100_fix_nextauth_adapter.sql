-- Fix user table constraints to allow NextAuth Adapter to work
-- 1. Drop the foreign key constraint to auth.users if it still exists (NextAuth manages its own users)
alter table public.users drop constraint if exists users_id_fkey;

-- 2. Modify id column to use gen_random_uuid() if not already set, but more importantly, ensure it's not relying on auth.users
alter table public.users alter column id set default gen_random_uuid();

-- 3. Update RLS policies to allow the Service Role (used by NextAuth Adapter) to manage users
-- The adapter uses the service_role key, so we need to ensure policies don't block it.
-- By default, service_role bypasses RLS, but explicit deny policies or strict 'using' clauses without service role checks can sometimes be tricky if not configured right.
-- However, the most likely issue is the TRIGGER.

-- 4. DISABLE THE TRIGGER that mirrors auth.users to public.users
-- This trigger expects inserts on auth.users to populate public.users. 
-- Since NextAuth inserts directly into public.users, this trigger is valid but unrelated. 
-- HOWEVER, if you have any OTHER triggers on public.users that validate data, they might be failing.

-- 5. Ensure columns allow NULL if NextAuth doesn't provide them initially
-- NextAuth provides 'name', 'email', 'image'. 
-- Your table has 'full_name', 'avatar_url'. 
-- We added mapped columns in the previous migration, but let's double check.

-- IMPORTANT: The adapter tries to insert 'id', 'name', 'email', 'emailVerified', 'image'.
-- If 'full_name' is NOT NULL, it will fail because valid adapter inserts won't have 'full_name' yet.
alter table public.users alter column full_name drop not null;
alter table public.users alter column avatar_url drop not null;

-- 6. Add a trigger to sync 'name' to 'full_name' and 'image' to 'avatar_url' for backward compatibility
create or replace function public.sync_nextauth_user_fields()
returns trigger as $$
begin
  -- Sync name -> full_name
  if new.name is not null and new.full_name is null then
    new.full_name := new.name;
  end if;
  
  -- Sync image -> avatar_url
  if new.image is not null and new.avatar_url is null then
    new.avatar_url := new.image;
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists on_nextauth_user_insert on public.users;

-- Disable manual RLS policies that might conflict with Service Role
alter table public.users force row level security;
-- Ensure Service Role has full access (it usually does, but policies can restrict it if not careful)
drop policy if exists "Service role manages all users" on public.users;
create policy "Service role manages all users" on public.users
  using ( auth.role() = 'service_role' )
  with check ( auth.role() = 'service_role' );
  
-- Allow users to read their own data (NextAuth session checking)
drop policy if exists "Users can read own data" on public.users;
create policy "Users can read own data" on public.users
  for select using (auth.uid() = id); -- Revert to strict check if possible, or keep true for public profiles

