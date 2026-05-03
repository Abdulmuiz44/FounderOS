export interface BuilderDatabaseTable {
    table: string;
    purpose: string;
    columns: {
        name: string;
        type: string;
        required: boolean;
        notes?: string;
    }[];
}

export interface BuilderPage {
    route: string;
    purpose: string;
    components: string[];
}

export interface BuilderApiRoute {
    route: string;
    method: 'GET' | 'POST' | 'PATCH' | 'DELETE';
    purpose: string;
}

export interface BuilderGithubIssue {
    title: string;
    body: string;
    labels: string[];
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface BuilderAgentPlan {
    id?: string;
    user_id?: string;
    opportunity_id: string;
    execution_plan_id?: string | null;
    product_summary: string;
    user_flows: string[];
    database_schema: BuilderDatabaseTable[];
    pages: BuilderPage[];
    api_routes: BuilderApiRoute[];
    env_vars: string[];
    github_issues: BuilderGithubIssue[];
    master_plan_markdown: string;
    codex_prompt: string;
    gemini_cli_prompt: string;
    opencode_prompt: string;
    claude_code_prompt: string;
    cursor_prompt: string;
    created_at?: string;
    updated_at?: string;
}

export interface BuilderInput {
    opportunity: {
        id: string;
        title: string;
        problem_statement: string;
        target_niche: string;
        market_gap: string;
        why_now: string;
        buyer_persona: string;
    };
    scores?: {
        demand_score: number;
        competition_score: number;
        monetization_score: number;
        complexity_score: number;
        founder_fit_score: number;
        verdict?: string;
        confidence?: number;
    };
    executionPlan?: {
        mvp_features: { feature: string; priority: string; complexity: string }[];
        tech_stack: { name: string; reason: string; category: string }[];
        go_to_market: { step: string; channel: string; timeline: string }[];
    };
    monetization?: {
        revenue_model: string;
        pricing_strategy: string;
        estimated_arpu: number;
        time_to_revenue: string;
    };
}