import { aiClient } from '../ai/providers';
import { PROMPTS } from '../ai/prompts';
import { FounderProfile, Opportunity } from '../types';

export const generator = {
    async generate(profile: FounderProfile): Promise<Omit<Opportunity, 'id' | 'founder_id' | 'status' | 'created_at' | 'updated_at'>[]> {
        const prompt = PROMPTS.GENERATE_OPPORTUNITIES(profile);
        const result = await aiClient.generateJSON<any[]>(prompt, 'You are a startup idea generator engine.');

        // Validate shape loosely or mapped
        return result.map(item => ({
            title: item.title,
            problem_statement: item.problemStatement,
            target_niche: item.targetNiche,
            market_gap: item.marketGap,
            why_now: item.whyNow,
            buyer_persona: item.buyerPersona
        }));
    }
};
