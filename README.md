# FounderOS

The operating system for AI builders to track, analyze, and optimize every project. Stop building in chaos.

## Vercel Deployment Instructions

If your deployment fails with "No Output Directory named 'public' found", it means Vercel didn't automatically detect this as a Next.js project.

**To Fix:**
1. Go to your **Vercel Project Settings**.
2. Under **Build & Development Settings**:
3. Change **Framework Preset** to **Next.js**.
4. Save and **Redeploy**.

## Environment Variables
Ensure these are set in Vercel:
- `GA_PROPERTY_ID`
- `HUBSPOT_ACCESS_TOKEN`
- `GITHUB_TOKEN`, `GITHUB_OWNER`, `GITHUB_REPO`
- `FOUNDER_EMAIL`
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`
