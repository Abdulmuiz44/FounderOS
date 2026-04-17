
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function testSupabaseAdapterAccess() {
    console.log('Testing Supabase Service Role Access...');

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !key) {
        console.error('Missing env vars');
        return;
    }

    const supabase = createClient(url, key, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    });

    // 1. Try to fetch a user
    console.log('Fetching users...');
    const { data: users, error: userError } = await supabase.from('users').select('*').limit(1);
    if (userError) {
        console.error('❌ Error fetching users:', userError);
    } else {
        console.log('✅ Fetched users:', users);
    }

    // 2. Try to insert a dummy user (simulating Adapter createUser)
    const dummyEmail = `test-${Date.now()}@example.com`;
    console.log(`Attempting to insert dummy user: ${dummyEmail}`);

    const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
            email: dummyEmail,
            name: 'Test Adapter User',
            image: 'https://example.com/avatar.png',
            emailVerified: new Date().toISOString()
        })
        .select()
        .single();

    if (createError) {
        console.error('❌ Error creating user:', createError);
    } else {
        console.log('✅ User created:', newUser);

        // 3. Try access accounts table
        console.log('Attempting to access accounts table...');
        const { error: accountError } = await supabase.from('accounts').select('*').limit(1);
        if (accountError) {
            console.error('❌ Error accessing accounts table:', accountError);
        } else {
            console.log('✅ Accounts table accessible');
        }

        // Clean up
        await supabase.from('users').delete().eq('id', newUser.id);
        console.log('Cleaned up test user.');
    }
}

testSupabaseAdapterAccess();
