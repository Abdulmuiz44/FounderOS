import axios from 'axios';
import https from 'https';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const apiKey = process.env.GEMINI_API_KEY;

const agent = new https.Agent({
    keepAlive: false,
    rejectUnauthorized: false,
    ALPNProtocols: ['http/1.1']
});

async function listModels(v: string) {
    const url = `https://generativelanguage.googleapis.com/${v}/models?key=${apiKey}`;
    console.log(`\nListing models for ${v}...`);
    try {
        const res = await axios.get(url, { httpsAgent: agent });
        res.data.models?.forEach((m: any) => {
            if (m.name.includes('1.5') || m.name.includes('2.0')) {
                console.log(` - ${m.name} (${m.supportedGenerationMethods.join(',')})`);
            }
        });
    } catch (e: any) {
        console.error(`❌ ${v} failed: ${e.response?.status}`);
    }
}

async function run() {
    if (!apiKey) {
        console.error('No API key');
        return;
    }
    await listModels('v1beta');
    await listModels('v1');
}

run();
