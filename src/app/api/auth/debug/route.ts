import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export function GET() {
    return NextResponse.json({
        hasAuthSecret: !!process.env.AUTH_SECRET,
        authSecretLength: process.env.AUTH_SECRET?.length || 0,
        nextAuthUrl: process.env.NEXTAUTH_URL,
        authUrl: process.env.AUTH_URL,
        googleId: !!process.env.GOOGLE_CLIENT_ID,
        githubId: !!process.env.GITHUB_CLIENT_ID,
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
        nodeEnv: process.env.NODE_ENV,
        trustHost: process.env.AUTH_TRUST_HOST
    });
}
