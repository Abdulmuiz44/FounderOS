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

export class GeminiProvider {
    private apiKey: string;
    private readonly baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models';
    private readonly model = 'gemini-3-flash';

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
            const cleaned = trimmed
                .replace(/^```json\s*/i, '')
                .replace(/^```\s*/i, '')
                .replace(/\s*```$/, '');
            return cleaned.trim();
        }

        return trimmed;
    }

    async generateJSON<T>(prompt: string, options: GenerateJSONOptions = {}): Promise<T> {
        const apiKey = this.getApiKey();

        const body: Record<string, unknown> = {
            systemInstruction: options.systemInstruction
                ? {
                    parts: [{ text: options.systemInstruction }]
                }
                : undefined,
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

        if (options.useGoogleSearch) {
            body.tools = [{ googleSearch: {} }];
        }

        const response = await fetch(`${this.baseUrl}/${this.model}:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Gemini API error: ${response.status} ${response.statusText} - ${errorText}`);
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
}

export const aiClient = new GeminiProvider();
