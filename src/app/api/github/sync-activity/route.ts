import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getServerUser } from '@/utils/supabase/auth';
import { analyzeExecution, analyzeFocus, analyzeFriction, analyzeMomentum } from '@/lib/patterns/engine';
import { generateInsight } from '@/lib/insights/generator';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

type SyncBody = {
  projectId?: string;
};

export async function POST(request: NextRequest) {
  try {
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { projectId } = await request.json() as SyncBody;
    if (!projectId) {
      return NextResponse.json({ error: 'projectId is required' }, { status: 400 });
    }

    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .eq('user_id', user.id)
      .single();

    if (projectError || !project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    if (!project.github_repo_full_name) {
      return NextResponse.json({ processed: false, reason: 'no_github_repo' });
    }

    const { data: { session } } = await supabase.auth.getSession();
    const accessToken = session?.provider_token;

    if (!accessToken) {
      return NextResponse.json({ error: 'GitHub not connected' }, { status: 401 });
    }

    const [owner, repo] = project.github_repo_full_name.split('/');
    if (!owner || !repo) {
      return NextResponse.json({ error: 'Invalid repository name' }, { status: 400 });
    }

    const repoInfoResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/vnd.github+json'
      }
    });

    if (!repoInfoResponse.ok) {
      const errorText = await repoInfoResponse.text();
      return NextResponse.json({ error: `Failed to load repository: ${errorText}` }, { status: 500 });
    }

    const repoInfo = await repoInfoResponse.json() as { default_branch?: string };
    const branch = repoInfo.default_branch || 'main';

    const commitsResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/commits?sha=${encodeURIComponent(branch)}&per_page=20`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/vnd.github+json'
      }
    });

    if (!commitsResponse.ok) {
      const errorText = await commitsResponse.text();
      return NextResponse.json({ error: `Failed to load commits: ${errorText}` }, { status: 500 });
    }

    const commits = await commitsResponse.json() as Array<{
      sha: string;
      commit: { message?: string; author?: { name?: string; date?: string } };
      html_url?: string;
      author?: { login?: string } | null;
    }>;

    const { data: existingLogs = [] } = await supabase
      .from('logs')
      .select('*')
      .eq('user_id', user.id)
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })
      .limit(100);

    const existingContent = new Set((existingLogs as Array<{ content?: string }>)
      .map((log) => log.content || ''));

    const newLogs = commits
      .filter((commit) => Boolean(commit.sha) && Boolean(commit.commit?.message))
      .map((commit) => {
        const shortSha = commit.sha.slice(0, 7);
        const message = commit.commit.message?.split('\n')[0] || 'GitHub commit';
        const author = commit.author?.login || commit.commit.author?.name || 'GitHub';
        const date = commit.commit.author?.date || new Date().toISOString();
        const content = `GitHub commit [${shortSha}] ${message}\nAuthor: ${author}\nDate: ${date}\nRepo: ${project.github_repo_full_name}\n${commit.html_url || ''}`;

        return {
          user_id: user.id,
          project_id: projectId,
          content,
          log_type: classifyCommit(message),
          source_key: `commit:${shortSha}`
        };
      })
      .filter((entry) => !existingContent.has(entry.content));

    if (newLogs.length > 0) {
      const { error: insertError } = await supabase.from('logs').insert(newLogs.map(({ source_key, ...entry }) => entry));
      if (insertError) {
        return NextResponse.json({ error: insertError.message }, { status: 500 });
      }
    }

    const { data: logsAfterCommits = [] } = await supabase
      .from('logs')
      .select('*')
      .eq('user_id', user.id)
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })
      .limit(100);

    const normalizedLogsAfterCommits = (logsAfterCommits ?? []) as Array<{ content?: string } & Record<string, unknown>>;

    const patterns = [
      analyzeMomentum(normalizedLogsAfterCommits as any),
      analyzeFocus(normalizedLogsAfterCommits as any),
      analyzeExecution(normalizedLogsAfterCommits as any),
      analyzeFriction(normalizedLogsAfterCommits as any)
    ];

    for (const pattern of patterns) {
      const { error } = await supabase.from('builder_patterns').upsert({
        user_id: user.id,
        pattern_type: pattern.pattern_type,
        pattern_label: pattern.pattern_label,
        explanation: pattern.explanation,
        confidence_score: pattern.confidence_score,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id, pattern_type' });

      if (error) {
        console.error('Error upserting pattern:', error);
      }
    }

    const { data: latestPatterns = [] } = await supabase
      .from('builder_patterns')
      .select('*')
      .eq('user_id', user.id);

    const normalizedLatestPatterns = (latestPatterns ?? []) as Array<Record<string, unknown>>;

    if (normalizedLatestPatterns.length > 0) {
      const insightText = generateInsight(normalizedLatestPatterns as any);
      const { error: insightError } = await supabase.from('builder_insights').upsert({
        user_id: user.id,
        insight_text: insightText,
        generated_from_patterns: normalizedLatestPatterns,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' });

      if (insightError) {
        console.error('Error saving insight:', insightError);
      }

      const insightLogContent = `Insight snapshot for ${project.name}\n${insightText}`;
      const hasInsightLog = existingContent.has(insightLogContent);

      if (!hasInsightLog) {
        const { error: insightLogError } = await supabase.from('logs').insert({
          user_id: user.id,
          project_id: projectId,
          content: insightLogContent,
          log_type: 'learning'
        });

        if (insightLogError) {
          console.error('Error creating insight log:', insightLogError);
        }
      }
    }

    return NextResponse.json({
      processed: true,
      insertedLogs: newLogs.length,
      commits: commits.length
    });
  } catch (error) {
    console.error('Failed to sync GitHub activity:', error);
    return NextResponse.json({ error: 'Failed to sync GitHub activity' }, { status: 500 });
  }
}

function classifyCommit(message: string): 'update' | 'learning' | 'blocker' {
  const text = message.toLowerCase();

  if (text.includes('fix') || text.includes('bug') || text.includes('error') || text.includes('block')) {
    return 'blocker';
  }

  if (text.includes('test') || text.includes('learn') || text.includes('research') || text.includes('note')) {
    return 'learning';
  }

  return 'update';
}
