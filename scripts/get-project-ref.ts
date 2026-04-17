
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
// extract 'wpqqhnmhpvgkrgyudvwb' from 'https://wpqqhnmhpvgkrgyudvwb.supabase.co'
const match = url.match(/https:\/\/([a-z0-9]+)\.supabase\.co/);

if (match) {
    console.log(`PROJECT_REF=${match[1]}`);
} else {
    console.log('NO_MATCH');
}
