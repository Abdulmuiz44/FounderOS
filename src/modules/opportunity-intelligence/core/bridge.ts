import { aiClient } from '../ai/providers';
import { PROMPTS } from '../ai/prompts';
import { Opportunity, ExecutionPlan } from '../types';

function buildFallbackExecutionPlan(opportunity: Opportunity): Omit<ExecutionPlan, 'id' | 'opportunity_id' | 'created_at'> {
    const problem = opportunity.problem_statement || opportunity.title;
    const audience = opportunity.target_niche || 'target users';

    return {
        mvp_features: [
            {
                feature: `Capture and confirm the core problem for ${audience}`,
                priority: 'HIGH',
                complexity: 'EASY'
            },
            {
                feature: 'Validate demand with a short interview flow',
                priority: 'HIGH',
                complexity: 'MEDIUM'
            },
            {
                feature: `Turn ${problem.toLowerCase()} into a tracked execution plan`,
                priority: 'MEDIUM',
                complexity: 'MEDIUM'
            }
        ],
        tech_stack: [
            { name: 'Next.js', category: 'FRONTEND', reason: 'Fast iteration and full-stack routing' },
            { name: 'Supabase', category: 'DATABASE', reason: 'Auth, database, and storage in one place' },
            { name: 'GitHub API', category: 'INFRA', reason: 'Sync validated plans into repositories' }
        ],
        go_to_market: [
            { step: 'Interview early adopters', channel: 'Direct outreach', timeline: 'Week 1' },
            { step: 'Launch a waitlist', channel: 'Landing page', timeline: 'Week 1-2' },
            { step: 'Share progress updates', channel: 'Founder communities', timeline: 'Weekly' }
        ]
    };
}

export const bridge = {
    async createPlan(opportunity: Opportunity): Promise<Omit<ExecutionPlan, 'id' | 'opportunity_id' | 'created_at'>> {
        try {
            const prompt = PROMPTS.EXECUTION_PLAN(opportunity);
            const result = await aiClient.generateJSON<any>(prompt, {
                systemInstruction: 'You are a CTO and Product Manager.',
                temperature: 0.4
            });

            return {
                mvp_features: result.mvpFeatures,
                tech_stack: result.techStack,
                go_to_market: result.goToMarket
            };
        } catch {
            return buildFallbackExecutionPlan(opportunity);
        }
    }
};
