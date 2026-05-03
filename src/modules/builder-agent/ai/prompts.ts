import { BuilderInput } from '../types';

export const PROMPTS = {
    BUILD_PLAN: (input: BuilderInput) => `
Act as a Senior Product Manager and Lead Engineer. Create a practical MVP build plan for this startup opportunity.

# Opportunity
- Title: ${input.opportunity.title}
- Problem: ${input.opportunity.problem_statement}
- Target: ${input.opportunity.target_niche}
- Gap: ${input.opportunity.market_gap}
- Why Now: ${input.opportunity.why_now}
- Buyer: ${input.opportunity.buyer_persona}
${input.scores ? `
- Demand Score: ${input.scores.demand_score}/100
- Competition Score: ${input.scores.competition_score}/100
- Monetization Score: ${input.scores.monetization_score}/100
- Complexity Score: ${input.scores.complexity_score}/100
- Founder Fit Score: ${input.scores.founder_fit_score}/100
- Verdict: ${input.scores.verdict || 'N/A'}
` : ''}
${input.monetization ? `
- Revenue Model: ${input.monetization.revenue_model}
- Pricing: ${input.monetization.pricing_strategy}
- Time to Revenue: ${input.monetization.time_to_revenue}
` : ''}
${input.executionPlan ? `
- MVP Features: ${input.executionPlan.mvp_features.map(f => f.feature).join(', ')}
- Tech Stack: ${input.executionPlan.tech_stack.map(t => t.name).join(', ')}
` : ''}

# Requirements
1. Default stack: Next.js 14 (App Router), TypeScript, Tailwind CSS, Supabase, Netlify
2. Use OpenRouter with DeepSeek V4 Pro for AI features
3. Keep MVP scope tight - 5-7 core features max
4. Design for fast iteration with Supabase Auth, Edge Functions, and Postgres
5. Include essential env vars

# Output Format (strict JSON)
{
  "product_summary": "50-100 word product pitch",
  "user_flows": ["flow 1", "flow 2", "flow 3"],
  "database_schema": [
    {
      "table": "table_name",
      "purpose": "what this stores",
      "columns": [{"name": "col", "type": "text|uuid|timestamp|jsonb|boolean", "required": true, "notes": "optional"}]
    }
  ],
  "pages": [
    {"route": "/", "purpose": "landing page", "components": ["Hero", "Features", "CTA"]}
  ],
  "api_routes": [
    {"route": "/api/auth", "method": "POST", "purpose": "sign up"}
  ],
  "env_vars": ["SUPABASE_URL", "SUPABASE_ANON_KEY", "OPENROUTER_API_KEY"],
  "github_issues": [
    {"title": "Set up Next.js project", "body": "Initialize with Tailwind", "labels": ["setup"], "priority": "HIGH"}
  ],
  "master_plan_markdown": "# MASTER_PLAN.md content with sections: Overview, Tech Stack, Database, MVP Features, User Flows, Risks",
  "codex_prompt": "Specific prompt for Codex to build MVP",
  "gemini_cli_prompt": "Specific prompt for Gemini CLI to build MVP",
  "opencode_prompt": "Specific prompt for OpenCode to build MVP",
  "claude_code_prompt": "Specific prompt for Claude Code to build MVP",
  "cursor_prompt": "Specific prompt for Cursor to build MVP"
}

Respond with valid JSON only.
`
};