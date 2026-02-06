import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => {
                        request.cookies.set(name, value);
                    });

                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    });

                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    const {
        data: { user },
    } = await supabase.auth.getUser();

    // Protected routes - redirect to pricing/login if not logged in
    if (
        !user &&
        (request.nextUrl.pathname.startsWith('/dashboard') ||
            request.nextUrl.pathname.startsWith('/admin'))
    ) {
        const url = request.nextUrl.clone();
        url.pathname = '/pricing'; // Redirect unauthenticated users to pricing as requested
        return NextResponse.redirect(url);
    }

    // Auth routes - redirect to dashboard if already logged in
    if (user && (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/signup')) {
        const url = request.nextUrl.clone();
        url.pathname = '/dashboard';
        return NextResponse.redirect(url);
    }

    return response;
}
