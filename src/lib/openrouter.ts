interface OpenRouterMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

interface GenerateJSONOptions {
    systemInstruction?: string;
    temperature?: number;
    maxTokens?: number;
}

interface OpenRouterChoice {
    message: {
        content: string;
    };
}

interface OpenRouterResponse {
    choices: OpenRouterChoice[];
}

export class OpenRouterProvider {
    private apiKey: string;
    private readonly baseUrl = 'https://openrouter.ai/api/v1/chat/completions';
    private readonly defaultModel = 'deepseek/deepseek-v4-pro';

    constructor(apiKey?: string) {
        this.apiKey = apiKey || process.env.OPENROUTER_API_KEY || '';
    }

    private getApiKey(): string {
        if (!this.apiKey) {
            this.apiKey = process.env.OPENROUTER_API_KEY || '';
        }

        if (!this.apiKey) {
            throw new Error('OPENROUTER_API_KEY is not defined.');
        }

        return this.apiKey;
    }

    private getModel(): string {
        return process.env.OPENROUTER_MODEL || this.defaultModel;
    }

    private getAppUrl(): string | undefined {
        return process.env.NEXT_PUBLIC_APP_URL;
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

    private buildHeaders(): HeadersInit {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.getApiKey()}`,
            'X-Title': 'FounderOS'
        };

        const appUrl = this.getAppUrl();
        if (appUrl) {
            headers['HTTP-Referer'] = appUrl;
        }

        return headers;
    }

    async generateJSON<T>(prompt: string, options: GenerateJSONOptions = {}): Promise<T> {
        const apiKey = this.getApiKey();
        const model = this.getModel();
        const messages: OpenRouterMessage[] = [];

        if (options.systemInstruction) {
            messages.push({
                role: 'system',
                content: options.systemInstruction
            });
        }

        messages.push({
            role: 'user',
            content: prompt
        });

        const response = await fetch(this.baseUrl, {
            method: 'POST',
            headers: this.buildHeaders(),
            body: JSON.stringify({
                model,
                messages,
                temperature: options.temperature ?? 0.4,
                response_format: { type: 'json_object' },
                max_tokens: options.maxTokens ?? 4096
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`${response.status} ${response.statusText} - ${errorText}`);
        }

        const data = await response.json() as OpenRouterResponse;
        const text = data.choices?.[0]?.message?.content;

        if (!text) {
            throw new Error('OpenRouter API returned no content.');
        }

        try {
            return JSON.parse(this.extractJSONString(text)) as T;
        } catch (error) {
            throw new Error(`OpenRouter returned invalid JSON: ${error instanceof Error ? error.message : 'Unknown parse error'}`);
        }
    }
}

export const openRouter = new OpenRouterProvider();