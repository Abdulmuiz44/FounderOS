-- Comprehensive fix: Update ALL remaining tables to reference public.users with CASCADE
-- This ensures the handle_new_user trigger can update user IDs without constraint violations

-- Chatter Metrics (found via grep - still references auth.users)
ALTER TABLE public.chatter_metrics DROP CONSTRAINT IF EXISTS chatter_metrics_user_id_fkey;
ALTER TABLE public.chatter_metrics ADD CONSTRAINT chatter_metrics_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE ON UPDATE CASCADE;

-- Subscriptions table (likely also needs fixing)
ALTER TABLE public.subscriptions DROP CONSTRAINT IF EXISTS subscriptions_user_id_fkey;
ALTER TABLE public.subscriptions ADD CONSTRAINT subscriptions_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE ON UPDATE CASCADE;
