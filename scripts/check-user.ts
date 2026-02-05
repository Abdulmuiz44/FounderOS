
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkUser() {
    console.log(`Checking user abdulmuizproject@gmail.com at: ${supabaseUrl}`);
    const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', 'abdulmuizproject@gmail.com');

    if (error) {
        console.error("Error:", error);
    } else {
        console.log("Success! Users found:");
        console.log(data);
    }
}
checkUser();
