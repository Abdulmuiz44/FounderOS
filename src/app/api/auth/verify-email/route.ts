
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');
    const email = searchParams.get('email');

    if (!token || !email) {
        return NextResponse.redirect(new URL('/login?error=InvalidVerificationLink', req.url));
    }

    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 1. Verify token exists and matches
    console.log(`Verifying token for ${email}:`, token);
    const { data: record, error: fetchError } = await supabase
        .from('verification_tokens')
        .select('*')
        .eq('identifier', email)
        .eq('token', token)
        .single();

    if (fetchError) {
        console.error("Fetch token error:", fetchError);
    }

    if (!record) {
        console.error("Token record not found");
        return NextResponse.redirect(new URL('/login?error=InvalidToken', req.url));
    }

    // 2. Check expiration
    if (new Date(record.expires) < new Date()) {
        return NextResponse.redirect(new URL('/login?error=TokenExpired', req.url));
    }

    // 3. Update user as verified
    const { error: updateError } = await supabase
        .from('users')
        .update({ emailVerified: new Date().toISOString() })
        .eq('email', email);

    if (updateError) {
        return NextResponse.redirect(new URL('/login?error=VerificationFailed', req.url));
    }

    // 4. Delete used token
    // await supabase.from('verification_tokens').delete().eq('identifier', email).eq('token', token);

    // 5. Redirect to login with success message
    return NextResponse.redirect(new URL('/login?success=EmailVerified', req.url));
}
