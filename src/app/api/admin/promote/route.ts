import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get('secret');

    if (secret !== 'gemini-bootstrap') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const email = 'founderos.live@gmail.com';

    // 1. Get User ID
    const { data: user, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .maybeSingle();

    if (userError || !user) {
        return NextResponse.json({ error: 'User not found', details: userError }, { status: 404 });
    }

    // 2. Upsert Subscription
    const { error: subError } = await supabase
        .from('subscriptions')
        .upsert({
            user_id: user.id,
            status: 'active',
            plan_name: 'Pro',
            variant_id: 'manual_admin_grant',
            lemon_subscription_id: `manual_${user.id}`,
            renews_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365 * 100).toISOString(), // 100 years
            ends_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365 * 100).toISOString(),
        }, { onConflict: 'lemon_subscription_id' });

    if (subError) {
        return NextResponse.json({ error: 'Subscription update failed', details: subError }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: `Promoted ${email} to Pro`, userId: user.id });
}
