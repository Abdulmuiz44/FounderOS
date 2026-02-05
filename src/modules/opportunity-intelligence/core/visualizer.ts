import { aiClient } from '../ai/providers';
import { PROMPTS } from '../ai/prompts';
import { Opportunity, MonetizationMap } from '../types';

export const monetizer = {
    async mapStrategies(opportunity: Opportunity): Promise<Omit<MonetizationMap, 'id' | 'opportunity_id' | 'created_at'>> {
        const prompt = PROMPTS.MONETIZATION_MAP(opportunity);
        const result = await aiClient.generateJSON<any>(prompt, 'You are a Chief Revenue Officer.');

        return {
            revenue_model: result.revenueModel,
            pricing_strategy: result.pricingStrategy,
            estimated_arpu: result.estimatedArpu,
            time_to_revenue: result.timeToRevenue,
            secondary_streams: result.secondaryStreams || []
        };
    }
};
