import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { getServerUser } from '@/utils/supabase/auth';

type MasterPlanBody = {
  repoName?: string;
  repoFullName?: string;
  content: string;
  description?: string;
  private?: boolean;
  createIfMissing?: boolean;
};

async function upsertMasterPlanFile(accessToken: string, fullName: string, content: string) {
  const fileUrl = `https://api.github.com/repos/${fullName}/contents/MASTER_PLAN.md`;

  const existingResponse = await fetch(fileUrl, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/vnd.github+json'
    }
  });

  const payload: Record<string, unknown> = {
    message: 'Add MASTER_PLAN.md from FounderOS',
    content: Buffer.from(content, 'utf8').toString('base64')
  };

  if (existingResponse.ok) {
    const existingFile = await existingResponse.json() as { sha?: string };
    if (existingFile.sha) {
      payload.sha = existingFile.sha;
    }
  }

  const fileResponse = await fetch(fileUrl, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!fileResponse.ok) {
    const errorText = await fileResponse.text();
    throw new Error(`MASTER_PLAN upload failed: ${errorText}`);
  }
}

function sanitizeRepoName(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9-_\s]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export async function POST(req: NextRequest) {
  try {
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    const accessToken = session?.provider_token;

    if (!accessToken) {
      return NextResponse.json({ error: 'GitHub not connected' }, { status: 401 });
    }

    const body = await req.json() as MasterPlanBody;
    const content = body.content?.trim();
    const repoName = sanitizeRepoName(body.repoName || 'founderos-master-plan');
    const repoFullName = body.repoFullName?.trim();
    const createIfMissing = body.createIfMissing ?? !repoFullName;

    if (!content) {
      return NextResponse.json({ error: 'MASTER_PLAN content is required' }, { status: 400 });
    }

    const profileResponse = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/vnd.github+json'
      }
    });

    if (!profileResponse.ok) {
      return NextResponse.json({ error: 'Failed to load GitHub profile' }, { status: 500 });
    }

    const profile = await profileResponse.json() as { login: string };
    const targetFullName = repoFullName || `${profile.login}/${repoName}`;

    if (!repoFullName && createIfMissing) {
      const createRepoResponse = await fetch('https://api.github.com/user/repos', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/vnd.github+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: repoName,
          description: body.description || 'FounderOS implementation plan generated from a validated idea',
          private: body.private ?? true,
          auto_init: true,
          has_issues: true,
          has_projects: true,
          has_wiki: false
        })
      });

      if (!createRepoResponse.ok) {
        const errorText = await createRepoResponse.text();
        return NextResponse.json({ error: `Failed to create repo: ${errorText}` }, { status: 500 });
      }

      const repo = await createRepoResponse.json() as { full_name: string; html_url: string };
      await upsertMasterPlanFile(accessToken, repo.full_name, content);

      return NextResponse.json({
        success: true,
        repo: repo.full_name,
        url: repo.html_url
      });
    }

    const repoInfoResponse = await fetch(`https://api.github.com/repos/${targetFullName}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/vnd.github+json'
      }
    });

    if (!repoInfoResponse.ok) {
      if (!createIfMissing) {
        const errorText = await repoInfoResponse.text();
        return NextResponse.json({ error: `Repository not found: ${errorText}` }, { status: 404 });
      }

      const createRepoResponse = await fetch('https://api.github.com/user/repos', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/vnd.github+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: repoName,
          description: body.description || 'FounderOS implementation plan generated from a validated idea',
          private: body.private ?? true,
          auto_init: true,
          has_issues: true,
          has_projects: true,
          has_wiki: false
        })
      });

      if (!createRepoResponse.ok) {
        const errorText = await createRepoResponse.text();
        return NextResponse.json({ error: `Failed to create repo: ${errorText}` }, { status: 500 });
      }

      const repo = await createRepoResponse.json() as { full_name: string; html_url: string };
      await upsertMasterPlanFile(accessToken, repo.full_name, content);

      return NextResponse.json({ success: true, repo: repo.full_name, url: repo.html_url });
    }

    const repo = await repoInfoResponse.json() as { full_name: string; html_url: string };
    await upsertMasterPlanFile(accessToken, repo.full_name, content);

    return NextResponse.json({
      success: true,
      repo: repo.full_name,
      url: repo.html_url
    });
  } catch (error) {
    console.error('Failed to create MASTER_PLAN repo:', error);
    return NextResponse.json({ error: 'Failed to create GitHub repository' }, { status: 500 });
  }
}
