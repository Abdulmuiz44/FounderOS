
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkUser() {
    const userId = '49747729-49b8-40e8-a106-ae9d7f72ee6a';
    console.log(`Checking Auth User ID: ${userId} at: ${supabaseUrl}`);

    // Check Auth Users
    const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(userId);

    if (authError) {
        console.error("Auth Error:", authError);
    } else {
        console.log("Auth User Found:", authUser.user?.email);
    }

    // Check Public Users
    console.log("Checking Public Users table...");
    const { data: publicUser, error: publicError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId);

    if (publicError) {
        console.error("Public DB Error:", publicError);
    } else {
        console.log("Public User Found:", publicUser);
    }
}
checkUser();
