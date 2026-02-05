export interface GenerateContentRequest {
    contents: {
        role: string;
        parts: { text: string }[];
    }[];
    generationConfig?: {
        temperature?: number;
        maxOutputTokens?: number;
        responseMimeType?: string; // 'application/json' supported in Gemini 1.5
    };
}

export interface GenerateContentResponse {
    candidates: {
        content: {
            parts: { text: string }[];
        };
        finishReason: string;
    }[];
}

export class GeminiProvider {
    private apiKey: string;
    private baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent';

    constructor(apiKey?: string) {
        this.apiKey = apiKey || process.env.GEMINI_API_KEY || '';
        if (!this.apiKey) {
            console.warn('GEMINI_API_KEY is not set');
        }
    }

    async generateJSON<T>(prompt: string, systemInstruction?: string): Promise<T> {
        const contents = [];

        if (systemInstruction) {
            // Gemini 1.5 supports system instructions generally, but if not using SDK, 
            // sometimes it's safer to prepend to user prompt or use specific field.
            // For simplicity in REST:
            contents.push({
                role: 'user',
                parts: [{ text: `System Instruction: ${systemInstruction}\n\nTask: ${prompt}` }]
            });
        } else {
            contents.push({
                role: 'user',
                parts: [{ text: prompt }]
            });
        }

        const body: GenerateContentRequest = {
            contents,
            generationConfig: {
                temperature: 0.7,
                responseMimeType: 'application/json'
            }
        };

        try {
            const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Gemini API Error: ${response.status} - ${errorText}`);
            }

            const data = await response.json() as GenerateContentResponse;
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

            if (!text) {
                throw new Error('No content generated');
            }

            return JSON.parse(text) as T;
        } catch (error) {
            console.error('Gemini Generation Failed:', error);
            throw error;
        }
    }
}

export const aiClient = new GeminiProvider();
