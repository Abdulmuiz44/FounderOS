
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const apiKey = process.env.GEMINI_API_KEY;
const baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models';

async function listModels() {
    if (!apiKey) {
        console.error("GEMINI_API_KEY not found in .env.local");
        return;
    }

    try {
        const response = await fetch(`${baseUrl}?key=${apiKey}`);
        if (!response.ok) {
            console.error(`Error: ${response.status} - ${await response.text()}`);
            return;
        }

        const data = await response.json();
        console.log("Available Models:");
        // @ts-ignore
        data.models?.forEach(model => {
            if (model.supportedGenerationMethods?.includes('generateContent')) {
                console.log(`- ${model.name} (Supports generateContent)`);
            } else {
                console.log(`- ${model.name}`);
            }
        });
    } catch (e) {
        console.error("Failed to fetch models", e);
    }
}

listModels();
