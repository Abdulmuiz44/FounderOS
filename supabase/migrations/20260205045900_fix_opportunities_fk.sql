
-- Fix FK constraint for opportunities to reference public.users instead of auth.users
-- This is needed because NextAuth might be managing users in public.users solely or IDs might mismatch.

ALTER TABLE public.opportunities
DROP CONSTRAINT IF EXISTS opportunities_founder_id_fkey;

ALTER TABLE public.opportunities
ADD CONSTRAINT opportunities_founder_id_fkey
FOREIGN KEY (founder_id)
REFERENCES public.users(id)
ON DELETE CASCADE;
