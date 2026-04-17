
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function syncUser() {
    const userId = '49747729-49b8-40e8-a106-ae9d7f72ee6a';
    const email = 'abdulmuizproject@gmail.com';

    console.log(`Syncing user ${email} (${userId}) to auth.users...`);

    const { data, error } = await supabase.auth.admin.createUser({
        id: userId,
        email: email,
        email_confirm: true,
        password: 'temporary-password-123' // They can reset it or sign in with magic link
    });

    if (error) {
        console.error("Error creating auth user:", error);
    } else {
        console.log("Success! Auth user created:", data.user.id);
    }
}

syncUser();
