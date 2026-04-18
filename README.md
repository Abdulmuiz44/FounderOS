# FounderOS

Stop guessing. Build what customers already want.

FounderOS helps founders avoid dead-end builds by moving from idea hype to evidence to execution.

## Product Surfaces

1. Web app (`/`)
2. Local-first terminal CLI (`/cli`)

## Core Philosophy: Validate First

Most founders fail because they build something nobody wants. FounderOS forces you to:

1. Generate high-potential ideas based on your unique Founder DNA and unfair advantages.
2. Validate demand, competition, and monetization before writing a single line of code.
3. Execute with focus, tracking real code progress via GitHub integration.

## Key Features

### AI Idea Lab

- Founder DNA profiling: Deep-dive questionnaire to uncover your daily frustrations, unfair advantages, and market insights.
- Smart generation: AI generates tailored micro-SaaS and niche startup opportunities that fit you.
- Opportunity scoring: Automatic analysis of potential ideas based on demand, competition, and founder fit.

### Validation Workspace

- Opportunity analysis: Structured breakdown of problem, solution, and why now.
- Go-to-market plans: AI-generated roadmaps to get your first customers.

### Execution Dashboard

- GitHub integration: Link your repositories to track real commit activity.
- Project tracking: Move from idea to building to launched with clear milestones.

## Tech Stack

- Framework: Next.js 14 (App Router)
- Database: Supabase (PostgreSQL + Auth)
- Styling: Tailwind CSS + Lucide Icons
- Auth: NextAuth (Google + GitHub)
- AI: Mistral AI Integration

## Getting Started (Web)

1. Clone the repo:

```bash
git clone https://github.com/Abdulmuiz44/FounderOS.git
```

2. Install dependencies:

```bash
pnpm install
```

3. Set up environment variables in `.env.local`:

- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `GITHUB_ID`
- `GITHUB_SECRET`
- `MISTRAL_API_KEY`

4. Run the web app:

```bash
pnpm dev
```

## Getting Started (CLI)

From `FounderOS/cli`:

```bash
pnpm install
pnpm build
node dist/bin/founder.js help
```

Optional global link:

```bash
npm link
founder help
```

CLI commands:

- `founder`
- `founder help`
- `founder new`
- `founder validate`
- `founder roadmap`
- `founder list`
- `founder show <idea-id>`
- `founder delete <idea-id>`

## Deployment

Deploy web on Vercel. Set environment variables in the Vercel dashboard.

Built for builders who value their time.
