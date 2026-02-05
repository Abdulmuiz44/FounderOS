export interface Opportunity {
    id: string;
    founder_id: string;
    title: string;
    problem_statement: string;
    target_niche: string;
    market_gap: string;
    why_now: string;
    buyer_persona: string;
    status: 'DRAFT' | 'VALIDATED' | 'ARCHIVED' | 'CONVERTED';
    created_at: string;
    updated_at: string;
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
