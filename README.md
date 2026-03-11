# FounderOS 🚀

**Stop guessing. Build what customers already want.**

FounderOS helps founders avoid dead-end builds by moving from **Idea Hype → Evidence → Execution**.

## Why FounderOS
Most projects fail because founders build before proving demand. FounderOS gives you a conversion-first workflow:
1. **Generate** ideas tied to real buyer pain and your unfair advantage.
2. **Validate** demand, competitors, pricing, and execution risk before coding.
3. **Execute** with a full implementation plan you can copy into coding agents.

## Core Product Experience

### 🧠 Idea Lab
- Founder-context idea generation (skills, interests, unfair advantages)
- Problem-first opportunity framing
- Early-stage fit scoring to prioritize highest-upside ideas

### ✅ Validation Workspace
- AI market validation with competitor + demand signals
- Buy-signal scoring (demand, competition, monetization, complexity, founder fit)
- Structured experiments and risk visibility before you commit build time

### 🛠 Execution Dashboard
- **Full implementation plan** from validated idea to shipped MVP
- Copy/export ready build guide for Cursor/Claude/other coding agents
- GitHub-linked execution tracking and daily momentum logs

## Tech Stack
- **Framework:** Next.js (App Router)
- **Database:** Supabase (PostgreSQL + Auth)
- **Styling:** Tailwind CSS + Lucide Icons
- **Auth:** Supabase Auth + NextAuth
- **AI:** Gemini + OpenAI compatible workflows

## Getting Started
1. Install dependencies:
   ```bash
   pnpm install
   ```
2. Configure `.env.local` with:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `GEMINI_API_KEY` (and/or `OPENAI_API_KEY` depending on flows)
3. Run dev server:
   ```bash
   pnpm dev
   ```

## Deployment
Deploy on Vercel and set environment variables in project settings.

---

*FounderOS: validate once, build with conviction.*
