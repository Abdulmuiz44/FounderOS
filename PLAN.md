# FounderOS Plan

## Vision
FounderOS helps founders stop guessing and start building only what has evidence.

The product moves a user through three stages:
1. **Idea discovery** - generate startup ideas based on founder strengths and market signals.
2. **Validation** - score the idea with demand, competition, risks, launch channels, and experiments.
3. **Execution** - convert the validated idea into a living implementation plan, project logs, and GitHub-tracked delivery.

## End Goal
Build a founder operating system that:
- turns personal context into strong startup ideas,
- validates those ideas with structured evidence,
- produces a clear implementation plan,
- keeps execution synced from GitHub activity,
- and stores the whole journey in one product.

## Product Architecture

### 1) App Shell
- `src/app/page.tsx` provides the landing experience.
- `src/app/login`, `src/app/signup`, and `src/app/auth/callback` handle auth flows.
- `src/app/dashboard` is the main authenticated area.

### 2) Authentication and Session Layer
- Supabase Auth is the primary session system.
- GitHub OAuth is used for repository access and commit sync.
- `src/lib/auth.ts`, `src/lib/auth.config.ts`, and `src/utils/supabase/*` coordinate session access.

### 3) Idea Lab
- The opportunity generator lives in `src/modules/opportunity-intelligence/core/*`.
- The app creates startup ideas, opportunity scores, and brief summaries from founder inputs.
- Validation output should include:
  - demand signals,
  - source-backed competitors,
  - launch channels,
  - primary risks,
  - next validation experiments,
  - research sources,
  - and a launch-ready recommendation.

### 4) Validation Engine
- `src/app/api/opportunities/validate` is the main validation endpoint.
- `src/modules/opportunity-intelligence/core/validator.ts` transforms idea-lab data into structured findings.
- `src/modules/opportunity-intelligence/core/bridge.ts` and `src/modules/opportunity-intelligence/core/visualizer.ts` format the results for the UI.
- Validation should be deterministic enough to work even when AI fails.

### 5) Execution Dashboard
- `src/app/dashboard/projects/page.tsx` is the core execution view.
- It shows implementation plans, project logs, GitHub status, and insights.
- `MASTER_PLAN.md` is the canonical handoff artifact for execution.

### 6) GitHub Automation
- `src/app/api/github/repos` lists repos available to the user.
- `src/app/api/github/master-plan` publishes a `MASTER_PLAN.md` file to GitHub.
- `src/app/api/github/sync-activity` imports commits and converts them into automated logs and insight updates.
- The execution dashboard should feel GitHub-native, not manually logged.

### 7) Insights and Pattern Tracking
- `src/app/api/logs`, `src/app/api/patterns`, `src/app/api/insights`, `src/app/api/profile`, and `src/app/api/drift` store the user's operating pattern.
- `src/lib/patterns/engine.ts` and `src/lib/insights/generator.ts` convert raw activity into recurring signals.
- The long-term goal is a self-improving system that predicts founder drift, focus, and momentum.

### 8) Payments and Access
- Lemon Squeezy routes in `src/app/api/checkout` and `src/app/api/webhook*` manage plan access.
- Subscription state should gate premium automation and publishing features.

## Data Flow
1. User signs in.
2. User fills in founder context.
3. Idea Lab generates opportunities.
4. Validation scores the idea and stores the evidence.
5. Execution tab turns the validated idea into a build plan.
6. GitHub connection syncs commits into logs.
7. Patterns and insights update automatically.
8. `MASTER_PLAN.md` can be published to GitHub as the source of truth.

## Near-Term Work
- Make every major Idea Lab output persist into the execution plan.
- Keep GitHub sync the default source for logs.
- Make insight generation automatic whenever fresh activity arrives.
- Remove remaining manual fallback paths where automation is available.
- Keep validation resilient when AI or network calls fail.

## Mid-Term Work
- Add richer repo linking, including existing repo selection and branch awareness.
- Expand the execution tab into milestone-based delivery tracking.
- Add clearer provenance for every recommendation and insight.
- Tighten auth and billing so connected GitHub and paid access are stable.

## Long-Term Work
- Turn FounderOS into a real founder control tower.
- Surface risks before they become blockers.
- Use historical activity to recommend next actions.
- Support multiple projects with reusable templates and planning artifacts.

## Success Criteria
- A founder can sign in, validate an idea, create an execution plan, connect GitHub, and publish `MASTER_PLAN.md` without confusion.
- The app should keep logs and insights fresh with minimal manual input.
- The product should fail gracefully instead of breaking when AI, GitHub, or payment services are unavailable.

## Current Priority Order
1. Stabilize GitHub auth and sync.
2. Keep validation complete and deterministic.
3. Make execution plans fully reflect Idea Lab output.
4. Automate logs and insights.
5. Polish billing, error states, and build reliability.

## Milestones

### Milestone 1: Core Product Reliability
- [ ] Keep auth session handling consistent across the app.
- [ ] Ensure validation endpoints return complete structured output.
- [ ] Keep the execution dashboard resilient when data is missing.
- [ ] Remove manual logging as the primary execution input.

### Milestone 2: GitHub-Native Execution
- [ ] Connect GitHub OAuth cleanly for each user.
- [ ] Sync commits into project logs automatically.
- [ ] Generate insights from GitHub activity without user prompts.
- [ ] Publish `MASTER_PLAN.md` to a selected repository.
- [ ] Support existing repository selection and re-sync.

### Milestone 3: Full Idea-to-Execution Continuity
- [ ] Carry all Idea Lab outputs into the execution plan.
- [ ] Keep demand signals, competitors, risks, launch channels, and experiments visible.
- [ ] Add provenance links for research-backed recommendations.
- [ ] Turn each validated idea into a reusable master plan artifact.

### Milestone 4: Founder Intelligence Loop
- [ ] Improve pattern detection from logs and commits.
- [ ] Surface drift, momentum, and focus changes early.
- [ ] Update insights automatically whenever new data arrives.
- [ ] Use history to recommend the next best action.

### Milestone 5: Product Hardening
- [ ] Make billing and access gating stable.
- [ ] Improve error states and fallback messaging.
- [ ] Reduce build and lint debt.
- [ ] Keep production builds free of external dependency failures.

## Definition of Done
FounderOS is done when a user can:
1. Sign in.
2. Generate and validate an idea.
3. See the full implementation plan in the execution tab.
4. Connect GitHub.
5. Auto-sync logs and insights from repository activity.
6. Publish `MASTER_PLAN.md` to GitHub.
7. Return later and still see consistent project history.

## Open Risks
- GitHub OAuth may vary depending on Supabase provider configuration.
- Automated sync depends on provider tokens and repo access.
- AI-backed features still need local fallback behavior.
- Build stability should not depend on remote font fetching or other network-only assets.
