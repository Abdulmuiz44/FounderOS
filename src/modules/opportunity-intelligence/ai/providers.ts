interface GenerateJSONOptions {
    systemInstruction?: string;
    useGoogleSearch?: boolean;
    temperature?: number;
}

interface GeminiPart {
    text?: string;
}

interface GeminiCandidate {
    content?: {
        parts?: GeminiPart[];
    };
}

interface GeminiResponse {
    candidates?: GeminiCandidate[];
}

const MODEL_FALLBACKS = [
    'gemini-3-flash-preview',
    'gemini-2.5-flash',
    'gemini-flash-latest'
];

export class GeminiProvider {
    private apiKey: string;
    private readonly baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models';

    constructor(apiKey?: string) {
        this.apiKey = apiKey || process.env.GEMINI_API_KEY || '';
    }

    private getApiKey(): string {
        if (!this.apiKey) {
            this.apiKey = process.env.GEMINI_API_KEY || '';
        }

        if (!this.apiKey) {
            throw new Error('GEMINI_API_KEY is not defined.');
        }

        return this.apiKey;
    }

    private extractJSONString(raw: string): string {
        const trimmed = raw.trim();

        if (trimmed.startsWith('```')) {
            return trimmed
                .replace(/^```json\s*/i, '')
                .replace(/^```\s*/i, '')
                .replace(/\s*```$/, '')
                .trim();
        }

        return trimmed;
    }

    private async requestModel<T>(model: string, prompt: string, options: GenerateJSONOptions): Promise<T> {
        const apiKey = this.getApiKey();

        const body: Record<string, unknown> = {
            contents: [
                {
                    role: 'user',
                    parts: [{ text: prompt }]
                }
            ],
            generationConfig: {
                temperature: options.temperature ?? 0.4,
                responseMimeType: 'application/json'
            }
        };

        if (options.systemInstruction) {
            body.systemInstruction = {
                parts: [{ text: options.systemInstruction }]
            };
        }

        if (options.useGoogleSearch) {
            body.tools = [{ google_search: {} }];
        }

        const response = await fetch(`${this.baseUrl}/${model}:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`${response.status} ${response.statusText} - ${errorText}`);
        }

        const data = await response.json() as GeminiResponse;
        const text = data.candidates?.[0]?.content?.parts
            ?.map((part) => part.text || '')
            .join('')
            .trim();

        if (!text) {
            throw new Error('Gemini API returned no content.');
        }

        try {
            return JSON.parse(this.extractJSONString(text)) as T;
        } catch (error) {
            throw new Error(`Gemini returned invalid JSON: ${error instanceof Error ? error.message : 'Unknown parse error'}`);
        }
    }

    async generateJSON<T>(prompt: string, options: GenerateJSONOptions = {}): Promise<T> {
        const failures: string[] = [];

        for (const model of MODEL_FALLBACKS) {
            try {
                return await this.requestModel<T>(model, prompt, options);
            } catch (error) {
                failures.push(`${model}: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        }

        throw new Error(`Gemini API failed across all fallback models. ${failures.join(' | ')}`);
    }
}

export const aiClient = new GeminiProvider();
