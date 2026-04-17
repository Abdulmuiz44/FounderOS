
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

console.log("--- Debugging Environment Variables ---");
const keys = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'NEXTAUTH_URL',
    'AUTH_URL',
    'NEXTAUTH_SECRET',
    'AUTH_SECRET'
];

keys.forEach(key => {
    const val = process.env[key];
    console.log(`${key}: ${val ? (val.substring(0, 5) + '...') : 'UNDEFINED'}`);
});

console.log("--- End Debug ---");
