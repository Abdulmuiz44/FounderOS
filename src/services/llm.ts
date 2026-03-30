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
2. Detect 'System Drift' and how the builder's approach is changing versus previous data.
3. Locate friction points or blockers that lead to building in chaos.
4. Infer what this behavior likely means for the project's long-term health.
5. Determine the 3 most critical focus areas for the next 7 days to restore order and shipping velocity.`;

export const OUTPUT_PROMPT = `Produce a Builder Brief with these sections:
# Executive Summary
4-6 sentence neutral reflection of the current state of building.

# Key Observations
Bullet points of specific behavioral patterns and system changes.

# What This Likely Means
Explanation of how current behavior impacts project trajectory.

# Founder Focus (Next 7 Days)
Exactly 3 actionable priorities to optimize execution.

Use structured, system-oriented language. No fluff.`;

interface MistralChatResponse {
    choices?: Array<{
        message?: {
            content?: string;
        };
    }>;
}

const MODEL_FALLBACKS = [
    'mistral-large-latest',
    'mistral-small-latest'
];

export async function callLLM(input: { signals: Signal[], patterns: string[], insights: InsightCandidate[] }): Promise<string> {
    const apiKey = process.env.MISTRAL_API_KEY;
    if (!apiKey) {
        throw new Error('MISTRAL_API_KEY is not set');
    }

    const { signals, patterns, insights } = input;

    const userPrompt = `
${ANALYSIS_PROMPT}

Signals:
${JSON.stringify(signals, null, 2)}

Patterns:
${JSON.stringify(patterns, null, 2)}

Insight candidates:
${JSON.stringify(insights, null, 2)}

${OUTPUT_PROMPT}
`.trim();

    const failures: string[] = [];

    for (const model of MODEL_FALLBACKS) {
        const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model,
                messages: [
                    {
                        role: 'system',
                        content: SYSTEM_PROMPT
                    },
                    {
                        role: 'user',
                        content: userPrompt
                    }
                ],
                temperature: 0.4
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            failures.push(`${model}: ${response.status} ${response.statusText} - ${errorText}`);
            continue;
        }

        const data = await response.json() as MistralChatResponse;
        const content = data.choices?.[0]?.message?.content?.trim();

        if (content) {
            return content;
        }

        failures.push(`${model}: empty response`);
    }

    throw new Error(`Mistral API returned no usable content. ${failures.join(' | ')}`);
}
