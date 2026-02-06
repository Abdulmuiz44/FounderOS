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

        return this.makeRequestWithRetry(https, body) as Promise<T>;
    }

    private async makeRequestWithRetry(https: any, body: GenerateContentRequest, attempt = 1): Promise<any> {
        const MAX_RETRIES = 3;
        const BASE_DELAY = 2000; // Start with 2 seconds

        try {
            return await new Promise((resolve, reject) => {
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
                };

                const req = https.request(options, (res: any) => {
                    let responseData = '';

                    res.on('data', (chunk: any) => {
                        responseData += chunk;
                    });

                    res.on('end', () => {
                        if (res.statusCode === 429) {
                            reject(new Error('RATE_LIMIT'));
                            return;
                        }

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
                            resolve(JSON.parse(text));
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
        } catch (error: any) {
            if (error.message === 'RATE_LIMIT' || error.message?.includes('429')) {
                if (attempt <= MAX_RETRIES) {
                    const delay = BASE_DELAY * Math.pow(2, attempt - 1); // 2s, 4s, 8s
                    console.warn(`Gemini Rate Limit Hit. Retrying in ${delay}ms (Attempt ${attempt}/${MAX_RETRIES})...`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                    return this.makeRequestWithRetry(https, body, attempt + 1);
                } else {
                    throw new Error('Gemini API Rate Limit Exceeded after retries.');
                }
            }
            throw error;
        }
    }
}

export const aiClient = new GeminiProvider();
