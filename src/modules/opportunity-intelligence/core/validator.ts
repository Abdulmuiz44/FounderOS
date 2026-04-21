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
        demandSignals: buildDemandSignals(opportunity),
        marketResearch: buildMarketResearch(opportunity),
        competitors: buildCompetitors(opportunity),
        customerSegments: opportunity.target_niche ? [opportunity.target_niche] : [],
        monetizationInsights: buildMonetizationInsights(opportunity),
        launchChannels: buildLaunchChannels(opportunity),
        risks: buildRisks(opportunity),
        validationExperiments: buildValidationExperiments(opportunity),
        searchQueries: buildSearchQueries(opportunity),
        sources: buildSources(opportunity)
    };
}

function buildDemandSignals(opportunity: Opportunity) {
    return [
        {
            signal: 'Pain point is specific and repeated',
            strength: 'HIGH' as const,
            evidence: opportunity.problem_statement || opportunity.market_gap || 'The problem statement describes a concrete workflow pain.'
        },
        {
            signal: 'Buyer has a clear reason to pay',
            strength: 'MEDIUM' as const,
            evidence: opportunity.buyer_persona || 'The buyer persona implies a user with purchasing authority.'
        }
    ];
}

function buildMarketResearch(opportunity: Opportunity) {
    return [
        `Search demand for ${opportunity.title}`,
        `Review communities where ${opportunity.target_niche} discuss the problem`,
        `Compare pricing and positioning for tools adjacent to ${opportunity.market_gap}`
    ];
}

function buildCompetitors(opportunity: Opportunity) {
    return [
        {
            name: 'Spreadsheets / Manual Process',
            url: undefined,
            positioning: 'The incumbent fallback for early teams and budget-conscious buyers.',
            targetAudience: opportunity.target_niche,
            pricingHint: 'Free but time-expensive',
            strength: 'Always available and flexible',
            weakness: 'Breaks at scale and requires manual upkeep',
            differentiationOpportunity: 'Replace manual coordination with a single workflow and automatic tracking.'
        },
        {
            name: 'Point Solution Competitor',
            url: undefined,
            positioning: 'A narrow product that solves one slice of the workflow.',
            targetAudience: opportunity.target_niche,
            pricingHint: '$19-$99/mo',
            strength: 'Focused feature set',
            weakness: 'Missing the broader execution loop',
            differentiationOpportunity: 'Win by bundling validation, execution, and progress visibility in one flow.'
        }
    ];
}

function buildMonetizationInsights(opportunity: Opportunity) {
    return [
        `Lead with a subscription priced for ${opportunity.buyer_persona || 'the buyer'}`,
        'Offer a clear upgrade path from validation to execution',
        'Anchor pricing to time saved or revenue unlocked'
    ];
}

function buildLaunchChannels(opportunity: Opportunity) {
    return [
        'Founder communities and operator groups',
        `Direct outreach to ${opportunity.target_niche || 'target users'}`,
        'Content-led acquisition through validation and execution playbooks',
        'Referral loops from early adopters'
    ];
}

function buildRisks(opportunity: Opportunity) {
    return [
        {
            risk: 'Problem is real but not frequent enough',
            severity: 'MEDIUM' as const,
            mitigation: 'Test with customer interviews before building beyond the MVP.'
        },
        {
            risk: 'Market already has strong incumbents',
            severity: 'HIGH' as const,
            mitigation: `Focus on the wedge created by ${opportunity.market_gap || 'the documented gap'}.`
        }
    ];
}

function buildValidationExperiments(opportunity: Opportunity) {
    return [
        {
            experiment: 'Run five customer interviews',
            goal: 'Confirm that the pain is painful enough to motivate action',
            execution: `Interview ${opportunity.target_niche || 'target users'} about their current workaround and what it costs them.`,
            successMetric: 'At least 3 of 5 users describe a recent, costly workaround'
        },
        {
            experiment: 'Landing page smoke test',
            goal: 'Measure whether the positioning converts',
            execution: 'Publish a simple waitlist page and track signups from target users.',
            successMetric: 'Waitlist signup rate above 5% from qualified traffic'
        }
    ];
}

function buildSearchQueries(opportunity: Opportunity) {
    return [
        `${opportunity.title} competitors`,
        `${opportunity.target_niche} pain points`,
        `${opportunity.market_gap} pricing`
    ];
}

function buildSources(opportunity: Opportunity) {
    const encodedTitle = encodeURIComponent(opportunity.title);
    const encodedNiche = encodeURIComponent(opportunity.target_niche || 'startup validation');

    return [
        {
            title: `${opportunity.title} market search`,
            url: `https://www.google.com/search?q=${encodedTitle}`,
            publisher: 'Google Search',
            evidence: 'Useful starting point for manual market research and competitor discovery.'
        },
        {
            title: `${opportunity.target_niche || 'Target niche'} research search`,
            url: `https://www.google.com/search?q=${encodedNiche}`,
            publisher: 'Google Search',
            evidence: 'Useful for finding forums, articles, and adjacent tools in the niche.'
        }
    ];
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
        return buildFallbackMomTestScript(opportunity);
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
        return buildFallbackCompetitorAnalysis(opportunity);
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
        return buildFallbackWaitlistContent(opportunity);
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
        return buildFallbackMarketingCopy(opportunity);
    }
}

function buildFallbackMomTestScript(opportunity: Opportunity): MomTestScript {
    return {
        screenerQuestions: [
            `Walk me through the last time you dealt with ${opportunity.problem_statement.toLowerCase()}.`,
            `What did you try first, and what happened?`
        ],
        deepDiveQuestions: [
            {
                question: 'What was the cost of the workaround?',
                goal: 'Measure urgency and willingness to pay'
            },
            {
                question: 'Who else feels this pain inside your team?',
                goal: 'Identify the real buyer and internal champions'
            },
            {
                question: 'What happens if you do nothing?',
                goal: 'Understand consequence and priority'
            }
        ],
        redFlags: [
            'They cannot describe a recent workaround',
            'They say the issue is rare or not important',
            'They already have a perfect solution'
        ]
    };
}

function buildFallbackCompetitorAnalysis(opportunity: Opportunity): CompetitorAnalysis {
    return {
        competitors: buildCompetitors(opportunity),
        marketGapSummary: `The market appears fragmented, with manual tools and point solutions leaving room for a better workflow around ${opportunity.market_gap || 'the core wedge'}.`
    };
}

function buildFallbackWaitlistContent(opportunity: Opportunity): WaitlistContent {
    return {
        headline: `Stop losing time to ${opportunity.problem_statement.toLowerCase()}`,
        subheadline: `FounderOS is testing a simpler way for ${opportunity.target_niche || 'your audience'} to solve the problem faster and with less manual work.`,
        ctaText: 'Join the Early Access List',
        benefits: [
            {
                title: 'Faster workflow',
                description: 'Remove manual steps and get to value sooner.'
            },
            {
                title: 'Clearer execution',
                description: 'See what to build next without guessing.'
            }
        ],
        viralMechanic: 'Invite two peers to move up the queue'
    };
}

function buildFallbackMarketingCopy(opportunity: Opportunity): MarketingCopy {
    return {
        homepage: {
            hero: {
                headline: `Build the right thing for ${opportunity.target_niche || 'your audience'}`,
                subheadline: `Validate demand, study competitors, and create a plan that reduces wasted builds around ${opportunity.problem_statement.toLowerCase()}.`,
                cta: 'Start Validating Now'
            },
            problem: {
                title: 'The problem',
                description: opportunity.problem_statement
            },
            solution: {
                title: 'The better way',
                description: 'A structured validation and execution system that turns research into a build plan.'
            },
            features: [
                {
                    title: 'Validation Engine',
                    description: 'Score the idea before you spend time building.',
                    benefit: 'Know whether to continue, pivot, or simplify.'
                },
                {
                    title: 'Execution Plan',
                    description: 'Turn validated insights into a build roadmap.',
                    benefit: 'Move from idea to action with clarity.'
                }
            ],
            testimonials_simulated: [
                {
                    quote: 'This would have saved me months of building the wrong thing.',
                    author: 'Early Founder',
                    role: 'Bootstrap SaaS Builder'
                }
            ],
            faq: [
                {
                    question: 'Do I need a big team?',
                    answer: 'No, the workflow is designed for solo founders and small teams.'
                }
            ]
        },
        about: {
            mission: 'Help founders build what customers already want.',
            story: 'Built to reduce dead-end work and bring evidence into the product process.',
            values: ['Clarity', 'Speed', 'Evidence']
        },
        pricing: {
            strategy: 'Price around the value of avoiding wasted build time.',
            tiers: [
                {
                    name: 'Starter',
                    price: '$12/mo',
                    features: ['Idea validation', 'Basic execution plan'],
                    recommended: false
                },
                {
                    name: 'Builder',
                    price: '$29/mo',
                    features: ['Everything in Starter', 'GitHub tracking', 'Execution roadmap'],
                    recommended: true
                }
            ]
        },
        dashboard_onboarding: {
            welcome_message: "Welcome - let's validate the idea and turn it into a plan.",
            setup_steps: [
                {
                    step: 'Add your idea',
                    description: 'Describe the problem, audience, and why it matters.'
                },
                {
                    step: 'Run validation',
                    description: 'Generate demand, competitor, and monetization analysis.'
                }
            ]
        }
    };
}

export const validator = {
    validate,
    generateMomTestScript,
    analyzeCompetitors,
    generateWaitlist,
    generateMarketingCopy
};

export default validator;
