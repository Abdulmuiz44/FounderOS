import { aiClient } from '../ai/providers';
import { PROMPTS } from '../ai/prompts';
import { Opportunity, MonetizationMap } from '../types';

function normalizeSecondaryStreams(value: unknown): string[] {
    if (!Array.isArray(value)) {
        return [];
    }

    return value
        .map((item) => String(item || '').trim())
        .filter((item) => item.length > 0);
}

function normalizeArpu(value: unknown): number {
    const parsed = Number(value);
    if (Number.isNaN(parsed) || parsed <= 0) {
        return 29;
    }
    return Math.round(parsed);
}

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

            const normalized = {
                revenue_model: String(result.revenueModel || '').trim(),
                pricing_strategy: String(result.pricingStrategy || '').trim(),
                estimated_arpu: normalizeArpu(result.estimatedArpu),
                time_to_revenue: String(result.timeToRevenue || '').trim(),
                secondary_streams: normalizeSecondaryStreams(result.secondaryStreams)
            };

            if (!normalized.revenue_model || !normalized.pricing_strategy || !normalized.time_to_revenue) {
                return buildFallbackMonetizationMap(opportunity);
            }

            return normalized;
        } catch {
            return buildFallbackMonetizationMap(opportunity);
        }
    }
};
