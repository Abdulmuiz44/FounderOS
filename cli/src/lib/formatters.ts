import type { Idea } from './cli-types.js';

const formatDate = (iso: string): string => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }
  return date.toISOString().slice(0, 10);
};

export const formatIdeaList = (ideas: Idea[]): string => {
  if (ideas.length === 0) {
    return [
      'No ideas saved yet.',
      '',
      'Create your first idea with:',
      '  founder new',
    ].join('\n');
  }

  const rows = ideas.map((idea) => {
    const score = idea.validation ? `${idea.validation.score}/100` : 'not scored';
    return `- ${idea.title}\n  id: ${idea.id}\n  updated: ${formatDate(idea.updatedAt)}\n  validation: ${score}`;
  });

  return ['Saved ideas:', '', ...rows].join('\n');
};

export const formatIdeaDetails = (idea: Idea): string => {
  const lines = [
    idea.title,
    '='.repeat(idea.title.length),
    '',
    `ID: ${idea.id}`,
    `Created: ${formatDate(idea.createdAt)}`,
    `Updated: ${formatDate(idea.updatedAt)}`,
    '',
    'Problem',
    idea.problemStatement,
    '',
    'Target user',
    idea.targetUser,
    '',
    'Differentiator',
    idea.differentiator,
  ];

  if (idea.validation) {
    lines.push(
      '',
      'Validation',
      `Score: ${idea.validation.score}/100`,
      `Recommendation: ${idea.validation.recommendation}`,
    );

    if (idea.validation.strengths.length > 0) {
      lines.push('Strengths:', ...idea.validation.strengths.map((strength) => `- ${strength}`));
    }

    if (idea.validation.risks.length > 0) {
      lines.push('Risks:', ...idea.validation.risks.map((risk) => `- ${risk}`));
    }
  } else {
    lines.push('', 'Validation', 'Not scored yet. Run: founder validate');
  }

  if (idea.roadmap) {
    lines.push(
      '',
      'Roadmap',
      `Generated: ${formatDate(idea.roadmap.generatedAt)}`,
      `Estimated total: ${idea.roadmap.estimatedTotalWeeks} weeks`,
      `Markdown: ${idea.roadmap.markdownPath}`,
      'Phases:',
      ...idea.roadmap.phases.map((phase) => `- ${phase.name} (${phase.duration})`),
    );
  } else {
    lines.push('', 'Roadmap', 'Not generated yet. Run: founder roadmap');
  }

  return lines.join('\n');
};
