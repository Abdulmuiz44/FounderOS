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

        const https = await import('https'); // Dynamic import to avoid edge issues if any

        return new Promise((resolve, reject) => {
            const data = JSON.stringify(body);
            const url = new URL(`${this.baseUrl}?key=${this.apiKey}`);

            const options = {
                hostname: url.hostname,
                path: url.pathname + url.search,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(data)
                },
                // Add a slightly relaxed agent for development environments if likely to fail
            };

            const req = https.request(options, (res: any) => {
                let responseData = '';

                res.on('data', (chunk: any) => {
                    responseData += chunk;
                });

                res.on('end', () => {
                    if (res.statusCode && (res.statusCode < 200 || res.statusCode >= 300)) {
                        reject(new Error(`Gemini API Error: ${res.statusCode} - ${responseData}`));
                        return;
                    }

                    try {
                        const json = JSON.parse(responseData) as GenerateContentResponse;
                        const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
                        if (!text) {
                            reject(new Error('No content generated'));
                            return;
                        }
                        resolve(JSON.parse(text) as T);
                    } catch (e) {
                        reject(e);
                    }
                });
            });

            req.on('error', (e: any) => {
                console.error('Gemini Request Failed:', e);
                reject(e);
            });

            req.write(data);
            req.end();
        });
    }
}

export const aiClient = new GeminiProvider();
