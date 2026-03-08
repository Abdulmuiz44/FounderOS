import { aiClient } from '../ai/providers';
import { PROMPTS } from '../ai/prompts';
import {
    Opportunity,
    OpportunityScore,
    MomTestScript,
    CompetitorAnalysis,
    WaitlistContent,
    MarketingCopy,
    ValidationReport
} from '../types';

function clampScore(value: unknown): number {
    const score = Number(value);
    if (Number.isNaN(score)) {
        return 0;
    }

    return Math.max(0, Math.min(100, Math.round(score)));
}

function normalizeValidationReport(result: Partial<ValidationReport>): ValidationReport {
    return {
        verdict: result.verdict || 'WEAK',
        confidence: clampScore(result.confidence),
        executiveSummary: result.executiveSummary || '',
        demandScore: clampScore(result.demandScore),
        competitionScore: clampScore(result.competitionScore),
        monetizationScore: clampScore(result.monetizationScore),
        complexityScore: clampScore(result.complexityScore),
        founderFitScore: clampScore(result.founderFitScore),
        demandAnalysis: result.demandAnalysis || '',
        competitionAnalysis: result.competitionAnalysis || '',
        monetizationAnalysis: result.monetizationAnalysis || '',
        complexityAnalysis: result.complexityAnalysis || '',
        founderFitAnalysis: result.founderFitAnalysis || '',
        marketSizeSummary: result.marketSizeSummary || '',
        demandSignals: result.demandSignals || [],
        marketResearch: result.marketResearch || [],
        competitors: result.competitors || [],
        customerSegments: result.customerSegments || [],
        monetizationInsights: result.monetizationInsights || [],
        launchChannels: result.launchChannels || [],
        risks: result.risks || [],
        validationExperiments: result.validationExperiments || [],
        searchQueries: result.searchQueries || [],
        sources: result.sources || []
    };
}

export async function validate(opportunity: Opportunity): Promise<Omit<OpportunityScore, 'id' | 'opportunity_id' | 'created_at'>> {
    try {
        const prompt = PROMPTS.VALIDATE_OPPORTUNITY(opportunity);
        const result = normalizeValidationReport(await aiClient.generateJSON<ValidationReport>(prompt, {
            systemInstruction: 'You are a startup validation intelligence engine. Research aggressively, stay skeptical, and return strict JSON only.',
            useGoogleSearch: true,
            temperature: 0.2
        }));

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
            ),
            analysis: {
                demand: result.demandAnalysis,
                competition: result.competitionAnalysis,
                monetization: result.monetizationAnalysis,
                complexity: result.complexityAnalysis,
                founderFit: result.founderFitAnalysis,
                validationReport: result
            }
        };
    } catch (error: any) {
        throw new Error(`Opportunity validation failed: ${error.message}`);
    }
}

export async function generateMomTestScript(opportunity: Opportunity): Promise<MomTestScript> {
    try {
        const prompt = PROMPTS.MOM_TEST_SCRIPT(opportunity);
        const result = await aiClient.generateJSON<MomTestScript>(prompt, {
            systemInstruction: 'You are an expert user researcher.',
            temperature: 0.5
        });
        return result;
    } catch (error: any) {
        throw new Error(`Mom Test script generation failed: ${error.message}`);
    }
}

export async function analyzeCompetitors(opportunity: Opportunity): Promise<CompetitorAnalysis> {
    try {
        const score = await validate(opportunity);
        const report = score.analysis.validationReport;

        return {
            competitors: report?.competitors || [],
            marketGapSummary: report?.competitionAnalysis || report?.marketSizeSummary || ''
        };
    } catch (error: any) {
        throw new Error(`Competitor analysis failed: ${error.message}`);
    }
}

export async function generateWaitlist(opportunity: Opportunity): Promise<WaitlistContent> {
    try {
        const prompt = PROMPTS.WAITLIST_PAGE(opportunity);
        const result = await aiClient.generateJSON<WaitlistContent>(prompt, {
            systemInstruction: 'You are a conversion copywriting expert.',
            temperature: 0.6
        });
        return result;
    } catch (error: any) {
        throw new Error(`Waitlist generation failed: ${error.message}`);
    }
}

export async function generateMarketingCopy(opportunity: Opportunity): Promise<MarketingCopy> {
    try {
        const prompt = PROMPTS.MARKETING_COPY(opportunity);
        const result = await aiClient.generateJSON<MarketingCopy>(prompt, {
            systemInstruction: 'You are a world-class marketing psychologist and direct response copywriter.',
            temperature: 0.7
        });
        return result;
    } catch (error: any) {
        throw new Error(`Marketing copy generation failed: ${error.message}`);
    }
}

export const validator = {
    validate,
    generateMomTestScript,
    analyzeCompetitors,
    generateWaitlist,
    generateMarketingCopy
};

export default validator;
