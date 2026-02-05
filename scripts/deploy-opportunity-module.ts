
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function deployModule() {
    console.log('Deploying Opportunity Intelligence Module...');

    const migrationPath = path.join(process.cwd(), 'supabase', 'migrations', '20260204100000_opportunity_intelligence.sql');

    if (!fs.existsSync(migrationPath)) {
        console.error(`Migration file not found at ${migrationPath}`);
        process.exit(1);
    }

    const sqlContent = fs.readFileSync(migrationPath, 'utf-8');

    // Split by statement separator (;)
    // This is a naive split that assumes ; is at the end of lines or blocks.
    // My migration file is formatted with ; at end of statements.
    const statements = sqlContent
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0);

    console.log(`Found ${statements.length} statements to execute.`);

    for (const sql of statements) {
        // console.log(`Executing: ${sql.substring(0, 50)}...`);

        // Attempt to run via RPC 'exec_sql' which is a common helper in Supabase setups
        // If it doesn't exist, we might fail.
        const { error } = await supabase.rpc('exec_sql', { sql_query: sql });

        if (error) {
            console.error(`Failed to execute statement via RPC:`);
            console.error(sql);
            console.error(`Error: ${error.message}`);

            // If the error is regarding function not found, we can't do much automatically via client-js
            // unless we have direct pg connection.
            if (error.message.includes('function "exec_sql" does not exist')) {
                console.error('\nCRITICAL: The helper function `exec_sql` is missing in your database.');
                console.error('Please run the migration SQL manually in the Supabase Dashboard SQL Editor.');
                process.exit(1);
            }
        } else {
            console.log('  ✅ Executed successfully');
        }
    }

    console.log('\nDeployment completed successfully.');
}

deployModule();
