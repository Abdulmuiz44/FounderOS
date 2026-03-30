interface GenerateJSONOptions {
    systemInstruction?: string;
    temperature?: number;
}

interface MistralMessage {
    content?: string;
}

interface MistralChoice {
    message?: MistralMessage;
}

interface MistralResponse {
    choices?: MistralChoice[];
}

const MODEL_FALLBACKS = [
    'mistral-large-latest',
    'mistral-small-latest'
];

export class MistralProvider {
    private apiKey: string;
    private readonly baseUrl = 'https://api.mistral.ai/v1/chat/completions';

    constructor(apiKey?: string) {
        this.apiKey = apiKey || process.env.MISTRAL_API_KEY || '';
    }

    private getApiKey(): string {
        if (!this.apiKey) {
            this.apiKey = process.env.MISTRAL_API_KEY || '';
        }

        if (!this.apiKey) {
            throw new Error('MISTRAL_API_KEY is not defined.');
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
        const messages: Array<{ role: 'system' | 'user'; content: string }> = [];

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
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model,
                messages,
                temperature: options.temperature ?? 0.4,
                response_format: { type: 'json_object' }
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`${response.status} ${response.statusText} - ${errorText}`);
        }

        const data = await response.json() as MistralResponse;
        const text = data.choices?.[0]?.message?.content?.trim();

        if (!text) {
            throw new Error('Mistral API returned no content.');
        }

        try {
            return JSON.parse(this.extractJSONString(text)) as T;
        } catch (error) {
            throw new Error(`Mistral returned invalid JSON: ${error instanceof Error ? error.message : 'Unknown parse error'}`);
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

        throw new Error(`Mistral API failed across all fallback models. ${failures.join(' | ')}`);
    }
}

export const aiClient = new MistralProvider();
