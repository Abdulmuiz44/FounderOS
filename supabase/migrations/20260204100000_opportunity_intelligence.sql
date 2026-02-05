-- Create Opportunity Intelligence Tables

-- 1. Opportunities Table
CREATE TABLE IF NOT EXISTS public.opportunities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    founder_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    problem_statement TEXT NOT NULL,
    target_niche TEXT NOT NULL,
    market_gap TEXT NOT NULL,
    why_now TEXT NOT NULL,
    buyer_persona TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'DRAFT', -- DRAFT, VALIDATED, ARCHIVED, CONVERTED
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for querying by founder
CREATE INDEX IF NOT EXISTS opportunities_founder_id_idx ON public.opportunities(founder_id);

-- 2. Opportunity Scores Table
CREATE TABLE IF NOT EXISTS public.opportunity_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    opportunity_id UUID NOT NULL UNIQUE REFERENCES public.opportunities(id) ON DELETE CASCADE,
    demand_score INTEGER NOT NULL,
    competition_score INTEGER NOT NULL,
    monetization_score INTEGER NOT NULL,
    complexity_score INTEGER NOT NULL,
    founder_fit_score INTEGER NOT NULL,
    weighted_average INTEGER NOT NULL,
    analysis JSONB NOT NULL, -- Detailed breakdown
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Monetization Maps Table
CREATE TABLE IF NOT EXISTS public.monetization_maps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    opportunity_id UUID NOT NULL UNIQUE REFERENCES public.opportunities(id) ON DELETE CASCADE,
    revenue_model TEXT NOT NULL,
    pricing_strategy TEXT NOT NULL,
    estimated_arpu NUMERIC NOT NULL,
    time_to_revenue TEXT NOT NULL,
    secondary_streams TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Execution Plans Table
CREATE TABLE IF NOT EXISTS public.execution_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    opportunity_id UUID NOT NULL UNIQUE REFERENCES public.opportunities(id) ON DELETE CASCADE,
    converted_project_id UUID, -- Can reference projects table if exists, or just be a loose reference
    mvp_features JSONB[] NOT NULL DEFAULT '{}',
    tech_stack JSONB[] NOT NULL DEFAULT '{}',
    go_to_market JSONB[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS Policies

-- Enable RLS
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunity_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monetization_maps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.execution_plans ENABLE ROW LEVEL SECURITY;

-- Policies for Opportunities
CREATE POLICY "Users can view their own opportunities"
    ON public.opportunities FOR SELECT
    USING (auth.uid() = founder_id);

CREATE POLICY "Users can create their own opportunities"
    ON public.opportunities FOR INSERT
    WITH CHECK (auth.uid() = founder_id);

CREATE POLICY "Users can update their own opportunities"
    ON public.opportunities FOR UPDATE
    USING (auth.uid() = founder_id)
    WITH CHECK (auth.uid() = founder_id);

CREATE POLICY "Users can delete their own opportunities"
    ON public.opportunities FOR DELETE
    USING (auth.uid() = founder_id);

-- Policies for related tables (cascade/ownership check via opportunity)
-- Since we don't always have simple joins in policies, a common pattern is to just check if the user can access the parent
-- But for simplicity and performance in Supabase, we often replicate the direct owner check or assume server-side service role for complex logic.
-- Here I will assume the server-side code (which uses service role or acts on behalf of user) writes these.
-- But for client-side reads, we need policies.

CREATE POLICY "Users can view scores of their opportunities"
    ON public.opportunity_scores FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.opportunities
        WHERE public.opportunities.id = public.opportunity_scores.opportunity_id
        AND public.opportunities.founder_id = auth.uid()
    ));

CREATE POLICY "Users can view monetization maps of their opportunities"
    ON public.monetization_maps FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.opportunities
        WHERE public.opportunities.id = public.monetization_maps.opportunity_id
        AND public.opportunities.founder_id = auth.uid()
    ));

CREATE POLICY "Users can view execution plans of their opportunities"
    ON public.execution_plans FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.opportunities
        WHERE public.opportunities.id = public.execution_plans.opportunity_id
        AND public.opportunities.founder_id = auth.uid()
    ));

-- Grant access to authenticated users
GRANT ALL ON public.opportunities TO authenticated;
GRANT ALL ON public.opportunity_scores TO authenticated;
GRANT ALL ON public.monetization_maps TO authenticated;
GRANT ALL ON public.execution_plans TO authenticated;

GRANT ALL ON public.opportunities TO service_role;
GRANT ALL ON public.opportunity_scores TO service_role;
GRANT ALL ON public.monetization_maps TO service_role;
GRANT ALL ON public.execution_plans TO service_role;
