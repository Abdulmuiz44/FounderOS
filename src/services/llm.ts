import { Signal } from '../types/signal';
import { InsightCandidate } from '../types/insight';

export const SYSTEM_PROMPT = `You are FounderOS, the specialized operating system for AI builders. 
Your goal is to help builders eliminate "building in chaos" by providing a neutral, data-driven mirror of their process.
Analyze project logs, behavioral patterns, and system drift to provide clarity and focus.
You value deep focus, execution over planning, and consistent shipping.
Communicate with directness, neutrality, and structural integrity.
Do not give generic business advice. Focus on the builder's system and execution patterns.`;

export const ANALYSIS_PROMPT = `Analyze the builder's activity using provided logs, signals, and detected patterns.
Step-by-step reasoning:
1. Identify the current 'Builder Mode' (e.g., Deep Focus, Planning Loop, Momentum Decay).
2. Detect 'System Drift'—how the builder's approach is changing vs previous data.
3. Locate 'Friction Points' or blockers that lead to 'Building in Chaos'.
4. Infer what this behavior likely means for the project's long-term health.
5. Determine the 3 most critical focus areas for the next 7 days to restore order and shipping velocity.`;

export const OUTPUT_PROMPT = `Produce a Builder Brief with these sections:
Executive Summary - 4–6 sentence neutral reflection of the current state of building.
Key Observations - bullet points of specific behavioral patterns and system changes.
What This Likely Means - explanation of how current behavior impacts project trajectory.
Founder Focus (Next 7 Days) - exactly 3 actionable priorities to optimize execution.
Use structured, system-oriented language. No fluff.`;

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
