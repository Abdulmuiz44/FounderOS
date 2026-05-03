-- Builder Agent Lite Tables and Fixes

-- Create builder_agent_plans table
CREATE TABLE IF NOT EXISTS public.builder_agent_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    opportunity_id UUID NOT NULL REFERENCES public.opportunities(id) ON DELETE CASCADE,
    execution_plan_id UUID,
    product_summary TEXT NOT NULL,
    user_flows JSONB NOT NULL DEFAULT '[]',
    database_schema JSONB NOT NULL DEFAULT '[]',
    pages JSONB NOT NULL DEFAULT '[]',
    api_routes JSONB NOT NULL DEFAULT '[]',
    env_vars JSONB NOT NULL DEFAULT '[]',
    github_issues JSONB NOT NULL DEFAULT '[]',
    master_plan_markdown TEXT NOT NULL,
    codex_prompt TEXT NOT NULL,
    gemini_cli_prompt TEXT NOT NULL,
    opencode_prompt TEXT NOT NULL,
    claude_code_prompt TEXT NOT NULL,
    cursor_prompt TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS builder_agent_plans_user_id_idx ON public.builder_agent_plans(user_id);
CREATE INDEX IF NOT EXISTS builder_agent_plans_opportunity_id_idx ON public.builder_agent_plans(opportunity_id);

-- RLS Policies
ALTER TABLE public.builder_agent_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their builder plans" ON public.builder_agent_plans FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their builder plans" ON public.builder_agent_plans FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their builder plans" ON public.builder_agent_plans FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their builder plans" ON public.builder_agent_plans FOR DELETE USING (auth.uid() = user_id);

GRANT ALL ON public.builder_agent_plans TO authenticated;
GRANT ALL ON public.builder_agent_plans TO service_role;

-- Deduplicate and add unique constraint
DELETE FROM public.builder_agent_plans
WHERE id NOT IN (
    SELECT DISTINCT ON (user_id, opportunity_id) id
    FROM public.builder_agent_plans
    ORDER BY user_id, opportunity_id, created_at DESC, id DESC
);

CREATE UNIQUE INDEX IF NOT EXISTS builder_agent_plans_user_opportunity_unique_idx ON public.builder_agent_plans(user_id, opportunity_id);