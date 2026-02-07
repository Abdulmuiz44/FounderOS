import { createClient } from '@/utils/supabase/server';

/**
 * Get the authenticated user from Supabase session (Server-Side)
 * Use this in API routes instead of NextAuth's auth()
 */
export async function getServerUser() {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
        return null;
    }

    return user;
}
