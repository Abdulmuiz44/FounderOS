
-- Force Fix FK Constraint: Point opportunities.founder_id to public.users.id
-- Run this in the Supabase Dashboard SQL Editor (https://supabase.com/dashboard/project/_/sql)

BEGIN;

-- 1. Drop the existing constraint (if it exists)
ALTER TABLE public.opportunities
DROP CONSTRAINT IF EXISTS opportunities_founder_id_fkey;

-- 2. Validate that all current founder_ids exist in public.users
-- (Optional cleanup: Delete orphans if any, to avoid constraint violation)
DELETE FROM public.opportunities
WHERE founder_id NOT IN (SELECT id FROM public.users);

-- 3. Add the new constraint referencing PUBLIC.users
ALTER TABLE public.opportunities
ADD CONSTRAINT opportunities_founder_id_fkey
FOREIGN KEY (founder_id)
REFERENCES public.users(id)
ON DELETE CASCADE;

COMMIT;
