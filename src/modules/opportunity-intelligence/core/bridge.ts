import { aiClient } from '../ai/providers';
import { PROMPTS } from '../ai/prompts';
import { Opportunity, ExecutionPlan } from '../types';

export const bridge = {
    async createPlan(opportunity: Opportunity): Promise<Omit<ExecutionPlan, 'id' | 'opportunity_id' | 'created_at'>> {
        const prompt = PROMPTS.EXECUTION_PLAN(opportunity);
        const result = await aiClient.generateJSON<any>(prompt, 'You are a CTO and Product Manager.');

        return {
            mvp_features: result.mvpFeatures,
            tech_stack: result.techStack,
            go_to_market: result.goToMarket
        };
    }
};
