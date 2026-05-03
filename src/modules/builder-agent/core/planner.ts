import { openRouter } from '@/lib/openrouter';
import { BuilderInput, BuilderAgentPlan } from '../types';
import { PROMPTS } from '../ai/prompts';
import { createServiceClient } from '@/utils/supabase/service';

const SYSTEM_PROMPT = `You are FounderOS Builder Agent. You create practical MVP build plans.
Output valid JSON. Keep prompts specific and actionable. Do not include backticks around JSON.`;

interface PlanRow {
    id: string;
    user_id: string;
    opportunity_id: string;
    execution_plan_id: string | null;
    product_summary: string;
    user_flows: string[];
    database_schema: any[];
    pages: any[];
    api_routes: any[];
    env_vars: string[];
    github_issues: any[];
    master_plan_markdown: string;
    codex_prompt: string;
    gemini_cli_prompt: string;
    opencode_prompt: string;
    claude_code_prompt: string;
    cursor_prompt: string;
    created_at: string;
    updated_at: string;
}

export async function generateBuilderPlan(input: BuilderInput): Promise<BuilderAgentPlan> {
    const result = await openRouter.generateJSON<BuilderAgentPlan>(PROMPTS.BUILD_PLAN(input), {
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0.4,
        maxTokens: 6000
    });

    return result;
}

export const builderService = {
    async getPlanByOpportunity(opportunityId: string, userId: string) {
        const client = createServiceClient();
        const { data, error } = await client
            .from('builder_agent_plans')
            .select('*')
            .eq('opportunity_id', opportunityId)
            .eq('user_id', userId)
            .maybeSingle();

        if (error && error.code !== 'PGRST116') {
            console.error('Error fetching builder plan:', error);
            throw error;
        }
        return data as PlanRow | null;
    },

    async savePlan(plan: Omit<BuilderAgentPlan, 'id' | 'created_at' | 'updated_at'>) {
        const client = createServiceClient();
        const { data, error } = await client
            .from('builder_agent_plans')
            .upsert({
                ...plan,
                updated_at: new Date().toISOString()
            }, {
                onConflict: 'user_id,opportunity_id',
                ignoreDuplicates: false
            })
            .select()
            .single();

        if (error) {
            console.error('Error saving builder plan:', error);
            throw error;
        }
        return data as PlanRow;
    },

    async updatePlan(id: string, plan: Partial<BuilderAgentPlan>) {
        const client = createServiceClient();
        const { data, error } = await client
            .from('builder_agent_plans')
            .update({ ...plan, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data as PlanRow;
    },

    async deletePlan(id: string, userId: string) {
        const client = createServiceClient();
        const { error } = await client
            .from('builder_agent_plans')
            .delete()
            .eq('id', id)
            .eq('user_id', userId);

        if (error) throw error;
    }
};