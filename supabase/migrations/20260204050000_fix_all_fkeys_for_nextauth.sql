-- Fix all foreign keys and RLS policies to work with NextAuth (public.users) instead of Supabase Auth (auth.users)

-- =====================
-- builder_patterns table
-- =====================
ALTER TABLE public.builder_patterns DROP CONSTRAINT IF EXISTS builder_patterns_user_id_fkey;
ALTER TABLE public.builder_patterns ADD CONSTRAINT builder_patterns_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

DROP POLICY IF EXISTS "Users view own patterns" ON public.builder_patterns;
DROP POLICY IF EXISTS "Users insert/update own patterns" ON public.builder_patterns;
CREATE POLICY "Allow all patterns" ON public.builder_patterns FOR ALL USING (true) WITH CHECK (true);

-- =====================
-- builder_insights table
-- =====================
ALTER TABLE public.builder_insights DROP CONSTRAINT IF EXISTS builder_insights_user_id_fkey;
ALTER TABLE public.builder_insights ADD CONSTRAINT builder_insights_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

DROP POLICY IF EXISTS "Users view own insights" ON public.builder_insights;
DROP POLICY IF EXISTS "Users insert/update own insights" ON public.builder_insights;
CREATE POLICY "Allow all insights" ON public.builder_insights FOR ALL USING (true) WITH CHECK (true);

-- =====================
-- builder_os_profile table
-- =====================
ALTER TABLE public.builder_os_profile DROP CONSTRAINT IF EXISTS builder_os_profile_user_id_fkey;
ALTER TABLE public.builder_os_profile ADD CONSTRAINT builder_os_profile_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

DROP POLICY IF EXISTS "Users view own profile" ON public.builder_os_profile;
DROP POLICY IF EXISTS "Users insert/update own profile" ON public.builder_os_profile;
CREATE POLICY "Allow all profiles" ON public.builder_os_profile FOR ALL USING (true) WITH CHECK (true);

-- =====================
-- builder_os_drift table
-- =====================
ALTER TABLE public.builder_os_drift DROP CONSTRAINT IF EXISTS builder_os_drift_user_id_fkey;
ALTER TABLE public.builder_os_drift ADD CONSTRAINT builder_os_drift_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

DROP POLICY IF EXISTS "Users view own drift" ON public.builder_os_drift;
DROP POLICY IF EXISTS "Users insert/update own drift" ON public.builder_os_drift;
CREATE POLICY "Allow all drift" ON public.builder_os_drift FOR ALL USING (true) WITH CHECK (true);

-- =====================
-- builder_os_history table
-- =====================
ALTER TABLE public.builder_os_history DROP CONSTRAINT IF EXISTS builder_os_history_user_id_fkey;
ALTER TABLE public.builder_os_history ADD CONSTRAINT builder_os_history_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

DROP POLICY IF EXISTS "Users view own history" ON public.builder_os_history;
DROP POLICY IF EXISTS "Users insert/update own history" ON public.builder_os_history;
CREATE POLICY "Allow all history" ON public.builder_os_history FOR ALL USING (true) WITH CHECK (true);

-- =====================
-- chatter_metrics table
-- =====================
ALTER TABLE public.chatter_metrics DROP CONSTRAINT IF EXISTS chatter_metrics_user_id_fkey;
ALTER TABLE public.chatter_metrics ADD CONSTRAINT chatter_metrics_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

DROP POLICY IF EXISTS "Users view own chatter" ON public.chatter_metrics;
DROP POLICY IF EXISTS "Users insert/update own chatter" ON public.chatter_metrics;
CREATE POLICY "Allow all chatter" ON public.chatter_metrics FOR ALL USING (true) WITH CHECK (true);

-- =====================
-- ai_summaries table
-- =====================
ALTER TABLE public.ai_summaries DROP CONSTRAINT IF EXISTS ai_summaries_log_id_fkey;
-- Keep project reference if it exists

DROP POLICY IF EXISTS "Users view own summaries" ON public.ai_summaries;
CREATE POLICY "Allow all summaries" ON public.ai_summaries FOR ALL USING (true) WITH CHECK (true);
