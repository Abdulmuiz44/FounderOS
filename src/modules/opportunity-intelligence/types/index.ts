export interface Opportunity {
    id: string;
    founder_id: string;
    title: string;
    problem_statement: string;
    target_niche: string;
    market_gap: string;
    why_now: string;
    buyer_persona: string;
    status: 'DRAFT' | 'VALIDATING' | 'VALIDATED' | 'VALIDATION_FAILED' | 'ARCHIVED' | 'CONVERTED';
    created_at: string;
    updated_at: string;
}

export interface ValidationSource {
    title: string;
    url: string;
    publisher: string;
    evidence: string;
}

export interface ValidationCompetitor {
    name: string;
    url?: string;
    positioning: string;
    targetAudience: string;
    pricingHint: string;
    strength: string;
    weakness: string;
    differentiationOpportunity: string;
}

export interface ValidationDemandSignal {
    signal: string;
    strength: 'HIGH' | 'MEDIUM' | 'LOW';
    evidence: string;
}

export interface ValidationRisk {
    risk: string;
    severity: 'HIGH' | 'MEDIUM' | 'LOW';
    mitigation: string;
}

export interface ValidationExperiment {
    experiment: string;
    goal: string;
    execution: string;
    successMetric: string;
}

export interface ValidationReport {
    verdict: 'STRONG' | 'PROMISING' | 'WEAK' | 'DO_NOT_BUILD_YET';
    confidence: number;
    executiveSummary: string;
    demandScore: number;
    competitionScore: number;
    monetizationScore: number;
    complexityScore: number;
    founderFitScore: number;
    demandAnalysis: string;
    competitionAnalysis: string;
    monetizationAnalysis: string;
    complexityAnalysis: string;
    founderFitAnalysis: string;
    marketSizeSummary: string;
    demandSignals: ValidationDemandSignal[];
    marketResearch: string[];
    competitors: ValidationCompetitor[];
    customerSegments: string[];
    monetizationInsights: string[];
    launchChannels: string[];
    risks: ValidationRisk[];
    validationExperiments: ValidationExperiment[];
    searchQueries: string[];
    sources: ValidationSource[];
}

export interface OpportunityScore {
    id: string;
    opportunity_id: string;
    demand_score: number;
    competition_score: number;
    monetization_score: number;
    complexity_score: number;
    founder_fit_score: number;
    weighted_average: number;
    analysis: {
        demand: string;
        competition: string;
        monetization: string;
        complexity: string;
        founderFit: string;
        validationReport?: ValidationReport;
    };
    created_at: string;
}

export interface MonetizationMap {
    id: string;
    opportunity_id: string;
    revenue_model: string;
    pricing_strategy: string;
    estimated_arpu: number;
    time_to_revenue: string;
    secondary_streams: string[];
    created_at: string;
}

export interface ExecutionPlan {
    id: string;
    opportunity_id: string;
    converted_project_id?: string;
    mvp_features: {
        feature: string;
        priority: 'HIGH' | 'MEDIUM' | 'LOW';
        complexity: 'EASY' | 'MEDIUM' | 'HARD';
    }[];
    tech_stack: {
        name: string;
        reason: string;
        category: 'FRONTEND' | 'BACKEND' | 'DATABASE' | 'INFRA' | 'AI';
    }[];
    go_to_market: {
        step: string;
        channel: string;
        timeline: string;
    }[];
    created_at: string;
}

// Input Types for Generators
export interface FounderProfile {
    interests: string[];
    skills: string[];
    budget: string;
    hoursPerWeek: number;
    location: string;
    preference: 'B2B' | 'B2C' | 'BOTH';
    unfairAdvantage?: string;
    problemSpace?: string;
    revenueGoal?: string;
    businessModelPreference?: string;
    dailyFrustrations?: string;
    recentExcitement?: string;
}

export interface MomTestScript {
    screenerQuestions: string[];
    deepDiveQuestions: {
        question: string;
        goal: string;
    }[];
    redFlags: string[];
}

export interface CompetitorAnalysis {
    competitors: ValidationCompetitor[];
    marketGapSummary: string;
}

export interface WaitlistContent {
    headline: string;
    subheadline: string;
    ctaText: string;
    benefits: {
        title: string;
        description: string;
    }[];
    viralMechanic: string; // e.g. "Invite friends for early access"
}

export interface MarketingCopy {
    homepage: {
        hero: { headline: string; subheadline: string; cta: string };
        problem: { title: string; description: string };
        solution: { title: string; description: string };
        features: { title: string; description: string; benefit: string }[];
        testimonials_simulated: { quote: string; author: string; role: string }[];
        faq: { question: string; answer: string }[];
    };
    about: {
        mission: string;
        story: string;
        values: string[];
    };
    pricing: {
        strategy: string;
        tiers: {
            name: string;
            price: string;
            features: string[];
            recommended: boolean;
        }[];
    };
    dashboard_onboarding: {
        welcome_message: string;
        setup_steps: { step: string; description: string }[];
    };
}
