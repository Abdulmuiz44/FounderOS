-- Fix builder_agent_plans uniqueness
-- Add unique constraint to prevent duplicate plans per user + opportunity

-- First, deduplicate existing rows if any exist
DELETE FROM public.builder_agent_plans
WHERE id NOT IN (
    SELECT DISTINCT ON (user_id, opportunity_id) id
    FROM public.builder_agent_plans
    ORDER BY user_id, opportunity_id, created_at DESC, id DESC
);

-- Add unique constraint/index
CREATE UNIQUE INDEX IF NOT EXISTS builder_agent_plans_user_opportunity_unique_idx 
ON public.builder_agent_plans(user_id, opportunity_id);