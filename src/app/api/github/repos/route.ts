import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(req: NextRequest) {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    const accessToken = session?.provider_token;

    if (!session || !accessToken) {
        return NextResponse.json({ error: 'GitHub not connected' }, { status: 401 });
    }

    try {
        const res = await fetch('https://api.github.com/user/repos?sort=updated&per_page=100', {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                Accept: 'application/vnd.github.v3+json'
            }
        });

        if (!res.ok) {
            const errorText = await res.text();
            console.error('GitHub API Response Error:', errorText);
            throw new Error('Failed to fetch from GitHub');
        }

        const repos = await res.json();

        // Filter to only what we need
        const simplifiedRepos = repos.map((r: any) => ({
            id: r.id,
            name: r.name,
            full_name: r.full_name,
            private: r.private,
            html_url: r.html_url,
            description: r.description
        }));

        return NextResponse.json(simplifiedRepos);

    } catch (error) {
        console.error('GitHub API Error:', error);
        return NextResponse.json({ error: 'Failed to fetch repositories' }, { status: 500 });
    }
}
