import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

declare global {
    // eslint-disable-next-line no-var
    var __founderOsSupabaseClient: SupabaseClient | undefined;
}

export function createClient(): SupabaseClient {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
        if (typeof window !== 'undefined') {
            throw new Error('Supabase environment variables not configured');
        }

        return createBrowserClient(
            'https://placeholder.supabase.co',
            'placeholder-key'
        ) as SupabaseClient;
    }

    if (!globalThis.__founderOsSupabaseClient) {
        globalThis.__founderOsSupabaseClient = createBrowserClient(
            supabaseUrl,
            supabaseAnonKey
        ) as SupabaseClient;
    }

    return globalThis.__founderOsSupabaseClient;
}
