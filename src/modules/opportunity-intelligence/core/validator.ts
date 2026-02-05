import { aiClient } from '../ai/providers';
import { PROMPTS } from '../ai/prompts';
import { Opportunity, OpportunityScore } from '../types';

export const validator = {
    async validate(opportunity: Opportunity): Promise<Omit<OpportunityScore, 'id' | 'opportunity_id' | 'created_at'>> {
        const prompt = PROMPTS.VALIDATE_OPPORTUNITY(opportunity);
        const result = await aiClient.generateJSON<any>(prompt, 'You are a venture capital analyst validator.');

        // Calculate weighted average in code to be sure, or trust LLM. Let's trust LLM for individual scores but calc average here if needed.
        // The prompt asks for weightedAverage.
        // Let's ensure types match.

        return {
            demand_score: result.demandScore,
            competition_score: result.competitionScore,
            monetization_score: result.monetizationScore,
            complexity_score: result.complexityScore,
            founder_fit_score: result.founderFitScore,
            weighted_average: Math.round(
                (result.demandScore * 0.3) +
                (result.competitionScore * 0.2) +
                (result.monetizationScore * 0.2) +
                (result.complexityScore * 0.1) +
                (result.founderFitScore * 0.2)
            ), // Custom weighting override or use result.weightedAverage if robust
            analysis: result.analysis
        };
    }
};
