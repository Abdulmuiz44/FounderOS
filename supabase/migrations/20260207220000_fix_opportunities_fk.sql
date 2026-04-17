-- Fix opportunities table to reference public.users instead of auth.users
-- This is critical for the handle_new_user trigger to work correctly

ALTER TABLE public.opportunities DROP CONSTRAINT IF EXISTS opportunities_founder_id_fkey;
ALTER TABLE public.opportunities ADD CONSTRAINT opportunities_founder_id_fkey 
FOREIGN KEY (founder_id) REFERENCES public.users(id) ON DELETE CASCADE ON UPDATE CASCADE;
