-- Update handle_new_user to use upsert instead of insert
-- This allows existing users in public.users to be "claimed" by new auth.users entries
-- or simply updated if they re-signup.

create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.users (id, email, full_name, avatar_url)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url')
  on conflict (email) do update set
    id = excluded.id, -- Update the ID to match the new auth.users ID
    full_name = coalesce(excluded.full_name, public.users.full_name),
    avatar_url = coalesce(excluded.avatar_url, public.users.avatar_url);
  return new;
end;
$$ language plpgsql security definer;
