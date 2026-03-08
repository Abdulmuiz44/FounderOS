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

interface GeminiTextResponse {
    candidates?: Array<{
        content?: {
            parts?: Array<{ text?: string }>;
        };
    }>;
}

export async function callLLM(input: { signals: Signal[], patterns: string[], insights: InsightCandidate[] }): Promise<string> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error('GEMINI_API_KEY is not set');
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

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            systemInstruction: {
                parts: [{ text: SYSTEM_PROMPT }]
            },
            contents: [
                {
                    role: 'user',
                    parts: [{ text: userPrompt }]
                }
            ],
            generationConfig: {
                temperature: 0.4
            }
        })
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json() as GeminiTextResponse;
    const content = data.candidates?.[0]?.content?.parts
        ?.map((part) => part.text || '')
        .join('')
        .trim();

    if (!content) {
        throw new Error('Gemini API returned no content');
    }

    return content;
}
