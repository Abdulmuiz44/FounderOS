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

function scoreFromSignals(text: string, signals: string[], baseScore: number) {
    const matches = signals.reduce((count, signal) => count + (text.includes(signal) ? 1 : 0), 0);
    return Math.max(0, Math.min(100, baseScore + (matches * 5) - (text.length < 80 ? 8 : 0)));
}

function buildFallbackValidationReport(opportunity: Opportunity): ValidationReport {
    const combinedText = [
        opportunity.title,
        opportunity.problem_statement,
        opportunity.target_niche,
        opportunity.market_gap,
        opportunity.why_now,
        opportunity.buyer_persona,
    ].join(' ').toLowerCase();

    const demandScore = scoreFromSignals(combinedText, [
        'pain', 'urgent', 'time', 'manual', 'revenue', 'compliance', 'expensive', 'repeat', 'workflow', 'automate'
    ], 62);
    const competitionScore = scoreFromSignals(combinedText, [
        'niche', 'specific', 'underserved', 'gap', 'differentiated', 'unique'
    ], 58);
    const monetizationScore = scoreFromSignals(combinedText, [
        'budget', 'pay', 'revenue', 'pricing', 'b2b', 'subscription', 'savings', 'roi'
    ], 64);
    const complexityScore = scoreFromSignals(combinedText, [
        'simple', 'focused', 'workflow', 'narrow', 'mvp', 'one', 'single'
    ], 60);
    const founderFitScore = scoreFromSignals(combinedText, [
        'experience', 'skills', 'expertise', 'familiar', 'interest', 'background'
    ], 55);

    const weightedAverage = Math.round(
        (demandScore * 0.3) +
        (competitionScore * 0.2) +
        (monetizationScore * 0.2) +
        (complexityScore * 0.1) +
        (founderFitScore * 0.2)
    );

    const verdict: ValidationReport['verdict'] = weightedAverage >= 75
        ? 'STRONG'
        : weightedAverage >= 60
            ? 'PROMISING'
            : weightedAverage >= 45
                ? 'WEAK'
                : 'DO_NOT_BUILD_YET';

    return {
        verdict,
        confidence: 62,
        executiveSummary: `Fallback validation for ${opportunity.title} based on structured heuristic scoring.`,
        demandScore,
        competitionScore,
        monetizationScore,
        complexityScore,
        founderFitScore,
        demandAnalysis: 'Heuristic demand analysis used because the AI validation provider was unavailable.',
        competitionAnalysis: 'Heuristic competition analysis used because the AI validation provider was unavailable.',
        monetizationAnalysis: 'Heuristic monetization analysis used because the AI validation provider was unavailable.',
        complexityAnalysis: 'Heuristic complexity analysis used because the AI validation provider was unavailable.',
        founderFitAnalysis: 'Heuristic founder fit analysis used because the AI validation provider was unavailable.',
        marketSizeSummary: 'Fallback mode does not estimate market size directly.',
        demandSignals: [],
        marketResearch: [],
        competitors: [],
        customerSegments: opportunity.target_niche ? [opportunity.target_niche] : [],
        monetizationInsights: [],
        launchChannels: [],
        risks: [],
        validationExperiments: [],
        searchQueries: [],
        sources: []
    };
}

type ValidationMode = 'ai' | 'fallback';

type ValidationResult = Omit<OpportunityScore, 'id' | 'opportunity_id' | 'created_at'> & {
    validationMode: ValidationMode;
    validationMessage: string;
};

export async function validate(opportunity: Opportunity): Promise<ValidationResult> {
    try {
        const prompt = PROMPTS.VALIDATE_OPPORTUNITY(opportunity);
        const result = normalizeValidationReport(await aiClient.generateJSON<ValidationReport>(prompt, {
            systemInstruction: 'You are a startup validation intelligence engine. Research aggressively, stay skeptical, and return strict JSON only.',
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
            },
            validationMode: 'ai',
            validationMessage: 'Validation completed with live AI analysis.'
        };
    } catch (error: any) {
        const fallback = buildFallbackValidationReport(opportunity);

        return {
            demand_score: fallback.demandScore,
            competition_score: fallback.competitionScore,
            monetization_score: fallback.monetizationScore,
            complexity_score: fallback.complexityScore,
            founder_fit_score: fallback.founderFitScore,
            weighted_average: Math.round(
                (fallback.demandScore * 0.3) +
                (fallback.competitionScore * 0.2) +
                (fallback.monetizationScore * 0.2) +
                (fallback.complexityScore * 0.1) +
                (fallback.founderFitScore * 0.2)
            ),
            analysis: {
                demand: fallback.demandAnalysis,
                competition: fallback.competitionAnalysis,
                monetization: fallback.monetizationAnalysis,
                complexity: fallback.complexityAnalysis,
                founderFit: fallback.founderFitAnalysis,
                validationReport: fallback
            },
            validationMode: 'fallback',
            validationMessage: 'Validation completed with a local heuristic fallback because the AI provider was unavailable.'
        };
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
