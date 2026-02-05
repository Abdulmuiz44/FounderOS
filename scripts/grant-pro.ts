
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function main() {
    const email = 'abdulmuizproject@gmail.com';
    console.log(`Granting PRO access to: ${email}`);

    // 1. Get User ID
    // We can't query auth.users directly easily via client usually, but with service role we can try.
    // Or we assume the user exists in public.users if we synced them?
    // Let's try fetching from public.users if that table exists (from previous view it seems so: stats route queries 'users').

    const { data: user, error: userError } = await supabase
        .from('users')
        .select('id, email')
        .eq('email', email)
        .single();

    if (userError || !user) {
        console.error('User not found in public.users table:', userError);
        // Fallback: try to list users from auth admin if possible, but usually public.users is the way in this codebase.
        return;
    }

    console.log(`Found User ID: ${user.id}`);

    // 2. Upsert Subscription
    const { error: subError } = await supabase
        .from('subscriptions')
        .upsert({
            user_id: user.id,
            status: 'active',
            plan_name: 'Pro',
            ends_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
            customer_id: 'cus_mock_' + user.id,
            lemon_subscription_id: 'sub_mock_' + user.id
        }, { onConflict: 'user_id' });

    if (subError) {
        console.error('Error updating subscription:', subError);
    } else {
        console.log('✅ Subscription activated successfully.');
    }
}

main();
