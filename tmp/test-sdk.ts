import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const apiKey = process.env.GEMINI_API_KEY;

async function run() {
    if (!apiKey) {
        console.error('No API key');
        return;
    }

    try {
        console.log('--- Testing Gemini with Official SDK ---');
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        console.log('Sending tiny prompt...');
        const result = await model.generateContent("hi");
        const response = await result.response;
        const text = response.text();

        console.log('✅ SDK Success!');
        console.log('Response:', text);
    } catch (e: any) {
        console.error('❌ SDK Failed:', e.message);
        if (e.stack) console.error(e.stack);
    }
}

run();
