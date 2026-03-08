import axios from 'axios';
import https from 'https';
import dotenv from 'dotenv';
import path from 'path';

// Force load .env.local
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.error('ERROR: GEMINI_API_KEY is not defined in .env.local');
    process.exit(1);
}

const agent = new https.Agent({
    keepAlive: false,
    rejectUnauthorized: false,
    ALPNProtocols: ['http/1.1']
});

async function test(v: string, m: string) {
    const baseUrl = `https://generativelanguage.googleapis.com/${v}`;
    const modelName = m.startsWith('models/') ? m : `models/${m}`;
    const url = `${baseUrl}/${modelName}:generateContent?key=${apiKey}`;

    console.log(`\nTesting URL format: ${url.replace(apiKey!, 'REDACTED')}`);

    try {
        const res = await axios.post(url, {
            contents: [{ parts: [{ text: 'Hello' }] }]
        }, {
            headers: { 'Content-Type': 'application/json' },
            httpsAgent: agent,
            timeout: 10000
        });
        console.log(`✅ Success! Response status: ${res.status}`);
        return true;
    } catch (e: any) {
        console.error(`❌ Failed: ${e.response?.status} - ${JSON.stringify(e.response?.data || e.message)}`);
        return false;
    }
}

async function run() {
    console.log('--- Starting Gemini Debug Tests ---');

    const versions = ['v1', 'v1beta'];
    const models = ['gemini-1.5-flash', 'gemini-1.5-flash-latest', 'gemini-1.5-pro', 'gemini-1.5-flash-001'];

    for (const v of versions) {
        for (const m of models) {
            await test(v, m);
        }
    }
}

run();
