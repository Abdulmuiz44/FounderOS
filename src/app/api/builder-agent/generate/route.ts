import { NextRequest, NextResponse } from 'next/server';
import { getServerUser } from '@/utils/supabase/auth';
import { generateBuilderPlan, builderService } from '@/modules/builder-agent';
import { BuilderInput } from '@/modules/builder-agent/types';
import { opportunityService } from '@/modules/opportunity-intelligence/services/opportunityService';
import { createServiceClient } from '@/utils/supabase/service';

export async function POST(req: NextRequest) {
    let user: any = null;

    try {
        if (!process.env.OPENROUTER_API_KEY) {
            return NextResponse.json({ error: 'OPENROUTER_API_KEY is not configured' }, { status: 503 });
        }

        user = await getServerUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { opportunityId, executionPlanId, regenerate = false } = body;

        if (!opportunityId) {
            return NextResponse.json({ error: 'opportunityId is required' }, { status: 400 });
        }

        const opportunity = await opportunityService.getOpportunityById(opportunityId);
        if (!opportunity || opportunity.founder_id !== user.id) {
            return NextResponse.json({ error: 'Opportunity not found' }, { status: 404 });
        }

        if (!regenerate) {
            const existingPlan = await builderService.getPlanByOpportunity(opportunityId, user.id);
            if (existingPlan) {
                return NextResponse.json(existingPlan);
            }
        }

        const client = createServiceClient();
        const { data: scores } = await client
            .from('opportunity_scores')
            .select('*')
            .eq('opportunity_id', opportunityId)
            .maybeSingle();

        const { data: monetization } = await client
            .from('monetization_maps')
            .select('*')
            .eq('opportunity_id', opportunityId)
            .maybeSingle();

        const { data: executionPlan } = await client
            .from('execution_plans')
            .select('*')
            .eq('opportunity_id', opportunityId)
            .maybeSingle();

        const input: BuilderInput = {
            opportunity: {
                id: opportunity.id,
                title: opportunity.title || 'Untitled',
                problem_statement: opportunity.problem_statement || '',
                target_niche: opportunity.target_niche || '',
                market_gap: opportunity.market_gap || '',
                why_now: opportunity.why_now || '',
                buyer_persona: opportunity.buyer_persona || ''
            },
            scores: scores ? {
                demand_score: scores.demand_score || 0,
                competition_score: scores.competition_score || 0,
                monetization_score: scores.monetization_score || 0,
                complexity_score: scores.complexity_score || 0,
                founder_fit_score: scores.founder_fit_score || 0,
                verdict: scores.analysis?.validationReport?.verdict,
                confidence: scores.analysis?.validationReport?.confidence
            } : undefined,
            executionPlan: executionPlan ? {
                mvp_features: executionPlan.mvp_features || [],
                tech_stack: executionPlan.tech_stack || [],
                go_to_market: executionPlan.go_to_market || []
            } : undefined,
            monetization: monetization ? {
                revenue_model: monetization.revenue_model || 'Subscription',
                pricing_strategy: monetization.pricing_strategy || '',
                estimated_arpu: monetization.estimated_arpu || 0,
                time_to_revenue: monetization.time_to_revenue || ''
            } : undefined
        };

        const plan = await generateBuilderPlan(input);

        const savedPlan = await builderService.savePlan({
            user_id: user.id,
            opportunity_id: opportunityId,
            execution_plan_id: executionPlanId || null,
            product_summary: plan.product_summary,
            user_flows: plan.user_flows,
            database_schema: plan.database_schema,
            pages: plan.pages,
            api_routes: plan.api_routes,
            env_vars: plan.env_vars,
            github_issues: plan.github_issues,
            master_plan_markdown: plan.master_plan_markdown,
            codex_prompt: plan.codex_prompt,
            gemini_cli_prompt: plan.gemini_cli_prompt,
            opencode_prompt: plan.opencode_prompt,
            claude_code_prompt: plan.claude_code_prompt,
            cursor_prompt: plan.cursor_prompt
        });

        return NextResponse.json(savedPlan);
    } catch (error) {
        console.error('Builder agent error:', error);
        return NextResponse.json({
            error: error instanceof Error ? error.message : 'Failed to generate builder plan'
        }, { status: 500 });
    }
}