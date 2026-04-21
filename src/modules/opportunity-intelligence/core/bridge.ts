import { aiClient } from '../ai/providers';
import { PROMPTS } from '../ai/prompts';
import { Opportunity, ExecutionPlan } from '../types';

type MvpPriority = ExecutionPlan['mvp_features'][number]['priority'];
type MvpComplexity = ExecutionPlan['mvp_features'][number]['complexity'];
type StackCategory = ExecutionPlan['tech_stack'][number]['category'];

function isMvpPriority(value: unknown): value is MvpPriority {
    return value === 'HIGH' || value === 'MEDIUM' || value === 'LOW';
}

function isMvpComplexity(value: unknown): value is MvpComplexity {
    return value === 'EASY' || value === 'MEDIUM' || value === 'HARD';
}

function isStackCategory(value: unknown): value is StackCategory {
    return value === 'FRONTEND' || value === 'BACKEND' || value === 'DATABASE' || value === 'INFRA' || value === 'AI';
}

function normalizeMvpFeatures(value: unknown): ExecutionPlan['mvp_features'] {
    if (!Array.isArray(value)) {
        return [];
    }

    return value
        .map((item) => {
            const record = (item || {}) as Record<string, unknown>;
            const priority: MvpPriority = isMvpPriority(record.priority) ? record.priority : 'MEDIUM';
            const complexity: MvpComplexity = isMvpComplexity(record.complexity) ? record.complexity : 'MEDIUM';

            return {
                feature: String(record.feature || '').trim(),
                priority,
                complexity
            };
        })
        .filter((item) => item.feature.length > 0);
}

function normalizeTechStack(value: unknown): ExecutionPlan['tech_stack'] {
    if (!Array.isArray(value)) {
        return [];
    }

    return value
        .map((item) => {
            const record = (item || {}) as Record<string, unknown>;
            const category: StackCategory = isStackCategory(record.category) ? record.category : 'INFRA';

            return {
                name: String(record.name || '').trim(),
                reason: String(record.reason || '').trim(),
                category
            };
        })
        .filter((item) => item.name.length > 0 && item.reason.length > 0);
}

function normalizeGoToMarket(value: unknown): ExecutionPlan['go_to_market'] {
    if (!Array.isArray(value)) {
        return [];
    }

    return value
        .map((item) => {
            const record = (item || {}) as Record<string, unknown>;
            return {
                step: String(record.step || '').trim(),
                channel: String(record.channel || '').trim(),
                timeline: String(record.timeline || '').trim()
            };
        })
        .filter((item) => item.step.length > 0 && item.channel.length > 0 && item.timeline.length > 0);
}

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

            const normalized = {
                mvp_features: normalizeMvpFeatures(result.mvpFeatures),
                tech_stack: normalizeTechStack(result.techStack),
                go_to_market: normalizeGoToMarket(result.goToMarket)
            };

            if (normalized.mvp_features.length === 0 || normalized.tech_stack.length === 0 || normalized.go_to_market.length === 0) {
                return buildFallbackExecutionPlan(opportunity);
            }

            return normalized;
        } catch {
            return buildFallbackExecutionPlan(opportunity);
        }
    }
};
