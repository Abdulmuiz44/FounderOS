import { Signal } from '../types/signal.js';
import { InsightCandidate } from '../types/insight.js';

export const SYSTEM_PROMPT = `You are an experienced SaaS operator and founder advisor. 
Analyze early-stage SaaS businesses using data from marketing, sales, and engineering.
Interpret what changed, why it likely changed, and identify what the founder should focus on next.
Think in terms of business momentum, execution velocity, and growth constraints.
Communicate clearly, concisely, and with founder-level judgment.
Do not give generic advice.
Only use provided signals and detected patterns.`;

export const ANALYSIS_PROMPT = `Analyze the SaaS business using provided signals and detected insights.
Step-by-step reasoning:
1. Identify most significant changes vs previous period.
2. Prioritize high severity or sustained changes.
3. Look for mismatches between traffic & conversion, leads & revenue, product velocity & activation.
4. Infer likely causes using SaaS logic.
5. Determine most constraining issue this week.
6. Decide 3 actionable founder priorities.
Do not speculate beyond provided data.`;

export const OUTPUT_PROMPT = `Produce a Founder Brief with these sections:
Executive Summary - 4–6 sentence overview.
Key Observations - bullet points of major changes.
What This Likely Means - explanation connecting marketing, sales, product.
Founder Focus (Next 7 Days) - exactly 3 actionable priorities.
Use direct language, no filler, no metric repetition.`;

export async function callLLM(input: { signals: Signal[], patterns: string[], insights: InsightCandidate[] }): Promise<string> {
  // In a real implementation, this would call OpenAI/Anthropic with the prompts and input JSON.
  // For this deterministic mock, we will construct a response that mirrors what the LLM would say
  // based on the specific "traffic_up_conversion_down" and "engineering_velocity_drop" scenario.
  
  const { signals, patterns } = input;
  
  // Dynamic mock generation to prove data connectivity
  const trafficSignal = signals.find(s => s.metric === 'sessions');
  const conversionSignal = signals.find(s => s.metric === 'signup_conversion_rate');
  const commitsSignal = signals.find(s => s.metric === 'commits');
  
  return `# Executive Summary
Business momentum is mixed. While top-of-funnel interest is surging with a ${trafficSignal?.deltaPercent}% increase in sessions, you are failing to capture this value due to a sharp ${conversionSignal?.deltaPercent}% drop in conversion. Simultaneously, engineering velocity has collapsed, with commits down ${commitsSignal?.deltaPercent}%, suggesting the product team is stalled. This combination of "leaky bucket" growth and stalled delivery is a critical risk.

# Key Observations
- Traffic is up significantly (${trafficSignal?.deltaPercent}%), but conversion rate has plummeted (${conversionSignal?.deltaPercent}%).
- Lead volume grew, but closed deals remained flat, indicating poor lead quality or sales friction.
- Engineering output (commits/PRs) dropped by over 75%, signaling a major blocker or process failure.

# What This Likely Means
You are currently driving traffic into a broken experience. The mismatch between traffic growth and conversion decline suggests that recent marketing efforts are attracting unqualified visitors, or a recent product change broke the onboarding flow. The "engineering velocity drop" pattern reinforces the latter—your team is likely stuck debugging a critical issue or blocked by technical debt, preventing them from shipping fixes for the conversion drop.

# Founder Focus (Next 7 Days)
1. **Pause Ad Spend & Audit Traffic:** Stop fueling the leaky bucket immediately; analyze the source of new traffic to verify intent.
2. **Unblock Engineering:** Sit with the engineering lead to identify the specific blocker causing the 80% drop in commits and clear it personally.
3. **Fix Onboarding Friction:** Task product to manually walk through the signup flow to identify and hotfix the conversion bottleneck.
`;
}
