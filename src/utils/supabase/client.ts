import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

let cachedClient: SupabaseClient | null = null;

export function createClient(): SupabaseClient {
  // Return cached client if available
  if (cachedClient) return cachedClient;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // During build time, env vars may not be available
  // Use placeholder values that will be replaced at runtime
  if (!supabaseUrl || !supabaseAnonKey) {
    // Check if we're in a browser environment
    if (typeof window !== 'undefined') {
      throw new Error('Supabase environment variables not configured');
    }
    // During SSR/build, return a placeholder client that will fail gracefully
    return createBrowserClient(
      'https://placeholder.supabase.co',
      'placeholder-key'
    ) as SupabaseClient;
  }

  cachedClient = createBrowserClient(supabaseUrl, supabaseAnonKey) as SupabaseClient;
  return cachedClient;
}
