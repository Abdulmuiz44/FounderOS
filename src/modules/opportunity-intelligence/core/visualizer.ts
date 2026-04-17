import { aiClient } from '../ai/providers';
import { PROMPTS } from '../ai/prompts';
import { Opportunity, MonetizationMap } from '../types';

function buildFallbackMonetizationMap(opportunity: Opportunity): Omit<MonetizationMap, 'id' | 'opportunity_id' | 'created_at'> {
    const audience = opportunity.target_niche || 'target users';

    return {
        revenue_model: 'Subscription',
        pricing_strategy: `Start with a low-friction subscription for ${audience} and raise pricing as the workflow becomes indispensable.`,
        estimated_arpu: 29,
        time_to_revenue: '1-3 months',
        secondary_streams: ['Done-with-you onboarding', 'Premium implementation support']
    };
}

export const monetizer = {
    async mapStrategies(opportunity: Opportunity): Promise<Omit<MonetizationMap, 'id' | 'opportunity_id' | 'created_at'>> {
        try {
            const prompt = PROMPTS.MONETIZATION_MAP(opportunity);
            const result = await aiClient.generateJSON<any>(prompt, {
                systemInstruction: 'You are a Chief Revenue Officer.',
                temperature: 0.4
            });

            return {
                revenue_model: result.revenueModel,
                pricing_strategy: result.pricingStrategy,
                estimated_arpu: result.estimatedArpu,
                time_to_revenue: result.timeToRevenue,
                secondary_streams: result.secondaryStreams || []
            };
        } catch {
            return buildFallbackMonetizationMap(opportunity);
        }
    }
};
