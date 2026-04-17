import { NextRequest } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const next = searchParams.get('next') ?? '/pricing'; // Default to pricing page

    if (code) {
        const supabase = await createClient();
        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (!error) {
            // Successfully confirmed email
            // Check if user has subscription
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                const { data: subscription } = await supabase
                    .from('subscriptions')
                    .select('*')
                    .eq('user_id', user.id)
                    .in('status', ['active', 'on_trial'])
                    .maybeSingle();

                // Redirect to dashboard if subscribed, pricing if not
                const redirectTo = subscription ? '/dashboard' : '/pricing';
                return redirect(redirectTo);
            }
        }
    }

    // If no code or error, redirect to pricing
    return redirect(next);
}
