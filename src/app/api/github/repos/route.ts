import { NextRequest, NextResponse } from 'next/server';
import { requireGitHubAccessToken, ServerAuthError } from '@/lib/server-auth';

export async function GET(_req: NextRequest) {
  try {
    const { accessToken } = await requireGitHubAccessToken();

    const res = await fetch('https://api.github.com/user/repos?sort=updated&per_page=100', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error('GitHub API Response Error:', errorText);
      return NextResponse.json({ error: 'Failed to fetch repositories' }, { status: 502 });
    }

    const repos = (await res.json()) as Array<Record<string, unknown>>;
    const simplifiedRepos = repos.map((repo) => ({
      id: repo.id,
      name: repo.name,
      full_name: repo.full_name,
      private: repo.private,
      html_url: repo.html_url,
      description: repo.description,
    }));

    return NextResponse.json(simplifiedRepos);
  } catch (error) {
    if (error instanceof ServerAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    console.error('GitHub API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch repositories' }, { status: 500 });
  }
}
