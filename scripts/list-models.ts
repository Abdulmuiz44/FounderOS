import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const apiKey = process.env.MISTRAL_API_KEY;
const baseUrl = 'https://api.mistral.ai/v1/models';

async function listModels() {
    if (!apiKey) {
        console.error('MISTRAL_API_KEY not found in .env.local');
        return;
    }

    try {
        const response = await fetch(baseUrl, {
            headers: {
                Authorization: `Bearer ${apiKey}`
            }
        });

        if (!response.ok) {
            console.error(`Error: ${response.status} - ${await response.text()}`);
            return;
        }

        const data = await response.json();
        console.log('Available Models:');
        // @ts-ignore
        data.data?.forEach((model) => {
            console.log(`- ${model.id}`);
        });
    } catch (e) {
        console.error('Failed to fetch models', e);
    }
}

listModels();