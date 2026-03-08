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
        console.log(`✅ ${v} - Found ${res.data.models?.length} models`);
        res.data.models?.slice(0, 10).forEach((m: any) => console.log(` - ${m.name}`));
    } catch (e: any) {
        console.error(`❌ ${v} failed: ${e.response?.status} - ${JSON.stringify(e.response?.data || e.message)}`);
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
