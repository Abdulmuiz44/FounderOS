-- Add ON UPDATE CASCADE to foreign keys referencing public.users(id)
-- This allows handle_new_user to update the user ID (reclaiming orphan records) without breaking FK constraints

-- Projects
ALTER TABLE public.projects DROP CONSTRAINT IF EXISTS projects_user_id_fkey;
ALTER TABLE public.projects ADD CONSTRAINT projects_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE ON UPDATE CASCADE;

-- Logs
ALTER TABLE public.logs DROP CONSTRAINT IF EXISTS logs_user_id_fkey;
ALTER TABLE public.logs ADD CONSTRAINT logs_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE ON UPDATE CASCADE;

-- Validation Module Tables removed as they do not exist


-- Builder OS Tables
ALTER TABLE public.builder_patterns DROP CONSTRAINT IF EXISTS builder_patterns_user_id_fkey;
ALTER TABLE public.builder_patterns ADD CONSTRAINT builder_patterns_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE public.builder_insights DROP CONSTRAINT IF EXISTS builder_insights_user_id_fkey;
ALTER TABLE public.builder_insights ADD CONSTRAINT builder_insights_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE public.builder_os_profile DROP CONSTRAINT IF EXISTS builder_os_profile_user_id_fkey;
ALTER TABLE public.builder_os_profile ADD CONSTRAINT builder_os_profile_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE public.builder_os_drift DROP CONSTRAINT IF EXISTS builder_os_drift_user_id_fkey;
ALTER TABLE public.builder_os_drift ADD CONSTRAINT builder_os_drift_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE public.builder_os_history DROP CONSTRAINT IF EXISTS builder_os_history_user_id_fkey;
ALTER TABLE public.builder_os_history ADD CONSTRAINT builder_os_history_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE public.chatter_metrics DROP CONSTRAINT IF EXISTS chatter_metrics_user_id_fkey;
ALTER TABLE public.chatter_metrics ADD CONSTRAINT chatter_metrics_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE ON UPDATE CASCADE;
