-- Fix projects and logs foreign keys to reference public.users (NextAuth) instead of auth.users (Supabase Auth)

-- 1. Drop old foreign key constraints
ALTER TABLE public.projects DROP CONSTRAINT IF EXISTS projects_user_id_fkey;
ALTER TABLE public.logs DROP CONSTRAINT IF EXISTS logs_user_id_fkey;

-- 2. Add new foreign key constraints referencing public.users
ALTER TABLE public.projects
ADD CONSTRAINT projects_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE public.logs
ADD CONSTRAINT logs_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- 3. Update RLS policies to be more permissive (since we're using service role for API calls)
-- Drop existing policies that use auth.uid()
DROP POLICY IF EXISTS "Users view own projects" ON public.projects;
DROP POLICY IF EXISTS "Users insert own projects" ON public.projects;
DROP POLICY IF EXISTS "Users update own projects" ON public.projects;
DROP POLICY IF EXISTS "Users delete own projects" ON public.projects;

DROP POLICY IF EXISTS "Users view own logs" ON public.logs;
DROP POLICY IF EXISTS "Users insert own logs" ON public.logs;
DROP POLICY IF EXISTS "Users delete own logs" ON public.logs;

-- Create new permissive policies (service role bypasses RLS anyway)
CREATE POLICY "Allow all for service role" ON public.projects FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for service role" ON public.logs FOR ALL USING (true) WITH CHECK (true);
