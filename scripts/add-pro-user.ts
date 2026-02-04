/**
 * Script to:
 * 1. Fix the foreign key constraint
 * 2. Find the user
 * 3. Create the Pro subscription
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupProUser() {
    const email = 'abdulmuizproject@gmail.com';

    console.log('Step 2: Fixing foreign key constraint...');

    // Fix foreign key
    const { error: fkError } = await supabase.rpc('exec_sql', {
        sql: `
      ALTER TABLE public.subscriptions DROP CONSTRAINT IF EXISTS subscriptions_user_id_fkey;
      ALTER TABLE public.subscriptions ADD CONSTRAINT subscriptions_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
    `
    });

    if (fkError) {
        console.log('Note: Foreign key update via RPC failed (this is expected, run manually if needed):', fkError.message);
        console.log('Continuing anyway - the constraint may already be correct...');
    } else {
        console.log('✅ Foreign key updated');
    }

    console.log(`\nStep 3: Finding user: ${email}`);

    const { data: user, error: userError } = await supabase
        .from('users')
        .select('id, email, name')
        .eq('email', email)
        .single();

    if (userError || !user) {
        console.error('❌ User not found:', userError?.message || 'No user with that email');
        process.exit(1);
    }

    console.log(`✅ Found user: ${user.name || user.email} (${user.id})`);

    console.log('\nStep 4: Creating Pro subscription...');

    const { data: newSub, error: insertError } = await supabase
        .from('subscriptions')
        .insert({
            user_id: user.id,
            status: 'active',
            plan_name: 'Pro',
            variant_id: 'manual_admin_override',
            lemon_subscription_id: `manual_pro_${Date.now()}`,
            customer_id: 'admin_granted',
            renews_at: new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000).toISOString(),
        })
        .select()
        .single();

    if (insertError) {
        console.error('❌ Failed to create subscription:', insertError.message);
        console.log('\nTry running this SQL manually in Supabase SQL Editor:');
        console.log(`
INSERT INTO public.subscriptions (
  user_id, status, plan_name, variant_id, lemon_subscription_id, customer_id, renews_at
) VALUES (
  '${user.id}', 'active', 'Pro', 'manual_admin_override', 'manual_pro_access', 'admin_granted', NOW() + INTERVAL '100 years'
);
    `);
        process.exit(1);
    }

    console.log('✅ Pro subscription created successfully!');
    console.log('Subscription:', newSub);
    process.exit(0);
}

setupProUser();
