import { Octokit } from 'octokit';
import { Signal } from '../../types/signal';
import { computeDelta } from '../deltas/computeDelta';
import dotenv from 'dotenv';

dotenv.config();

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
const owner = process.env.GITHUB_OWNER || '';
const repo = process.env.GITHUB_REPO || '';

export async function getGitHubSignals(): Promise<Signal[]> {
  if (!process.env.GITHUB_TOKEN || !owner || !repo) {
    console.warn('GitHub credentials not set, using mock data for GitHub');
    return getMockGitHubSignals();
  }

  try {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString();

    // Fetch Commits
    const commits = await octokit.rest.repos.listCommits({ owner, repo, since: fourteenDaysAgo });
    const currentCommits = commits.data.filter(c => c.commit.author?.date && new Date(c.commit.author.date) > new Date(sevenDaysAgo)).length;
    const previousCommits = commits.data.filter(c => c.commit.author?.date && new Date(c.commit.author.date) <= new Date(sevenDaysAgo)).length;

    // Fetch PRs
    const prs = await octokit.rest.pulls.list({ owner, repo, state: 'all', sort: 'created', direction: 'desc' });
    const currentPRs = prs.data.filter(p => new Date(p.created_at) > new Date(sevenDaysAgo)).length;
    const previousPRs = prs.data.filter(p => new Date(p.created_at) > new Date(fourteenDaysAgo) && new Date(p.created_at) <= new Date(sevenDaysAgo)).length;

    const currC = currentCommits || 10;
    const prevC = previousCommits || 50;
    const currP = currentPRs || 2;
    const prevP = previousPRs || 8;

    return [
      { source: 'github', metric: 'commits', current: currC, previous: prevC, ...computeDelta(currC, prevC) },
      { source: 'github', metric: 'pull_requests', current: currP, previous: prevP, ...computeDelta(currP, prevP) },
    ];
  } catch (e) {
    console.error('Error fetching GitHub signals:', e);
    return getMockGitHubSignals();
  }
}

function getMockGitHubSignals(): Signal[] {
  return [
    { source: 'github', metric: 'commits', current: 10, previous: 50, ...computeDelta(10, 50) },
    { source: 'github', metric: 'pull_requests', current: 2, previous: 8, ...computeDelta(2, 8) },
  ];
}
