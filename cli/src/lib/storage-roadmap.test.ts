import * as fs from 'fs/promises';
import * as os from 'os';
import * as path from 'path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createIdea, deleteIdea, findIdea, listIdeas, loadIdea, updateIdea } from './storage.js';
import { generateAndPersistRoadmap, generateRoadmap } from './roadmap-gen.js';
import { calculateValidationScore } from './scoring.js';
import { formatIdeaDetails, formatIdeaList } from './formatters.js';
import type { Idea } from './cli-types.js';

let testRoot: string;

const validation = calculateValidationScore({
  painIntensity: 8,
  urgency: 7,
  targetUserClarity: 8,
  willingnessToPay: 8,
  competitionSaturation: 3,
  distributionDifficulty: 4,
  founderAdvantage: 9,
});

beforeEach(async () => {
  testRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'founder-cli-'));
  process.env.FOUNDER_HOME = testRoot;
});

afterEach(async () => {
  delete process.env.FOUNDER_HOME;
  await fs.rm(testRoot, { recursive: true, force: true });
});

describe('storage', () => {
  it('creates, lists, updates, finds, and deletes ideas', async () => {
    const idea = await createIdea(
      'Workflow Copilot',
      'Founders lose execution context across tools.',
      'Solo SaaS founders',
      'Local-first planning loop',
    );

    expect(idea.id).toMatch(/^idea_/);
    expect(await findIdea(idea.id)).toMatchObject({ title: 'Workflow Copilot' });

    const ideas = await listIdeas();
    expect(ideas).toHaveLength(1);
    expect(ideas[0].id).toBe(idea.id);

    const updated = await updateIdea({ ...idea, validation });
    expect(updated.updatedAt).not.toBe('');
    expect(updated.validation?.score).toBe(validation.score);

    const loaded = await loadIdea(idea.id);
    expect(loaded.validation?.score).toBe(validation.score);

    await expect(deleteIdea(idea.id)).resolves.toBe(true);
    await expect(deleteIdea(idea.id)).resolves.toBe(false);
    await expect(listIdeas()).resolves.toEqual([]);
  });
});

describe('roadmap generation', () => {
  it('returns the stable roadmap result shape', () => {
    const idea: Idea = {
      id: 'idea_test',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      title: 'Workflow Copilot',
      problemStatement: 'Founders lose execution context across tools.',
      targetUser: 'Solo SaaS founders',
      differentiator: 'Local-first planning loop',
      validation,
    };

    const roadmap = generateRoadmap(idea, '/tmp/idea_test-ROADMAP.md');
    expect(roadmap).toMatchObject({
      estimatedTotalWeeks: 8,
      markdownPath: '/tmp/idea_test-ROADMAP.md',
    });
    expect(roadmap.generatedAt).toEqual(expect.any(String));
    expect(roadmap.phases).toHaveLength(3);
    expect(roadmap.phases[0]).toHaveProperty('tasks');
  });

  it('persists roadmap metadata into the idea JSON after markdown export', async () => {
    const idea = await createIdea(
      'Workflow Copilot',
      'Founders lose execution context across tools.',
      'Solo SaaS founders',
      'Local-first planning loop',
    );
    const validated = await updateIdea({ ...idea, validation });

    const roadmap = await generateAndPersistRoadmap(validated);
    const loaded = await loadIdea(idea.id);

    expect(loaded.roadmap).toMatchObject({
      estimatedTotalWeeks: 8,
      markdownPath: roadmap.markdownPath,
    });
    expect(loaded.updatedAt).not.toBe(validated.updatedAt);

    const markdown = await fs.readFile(roadmap.markdownPath, 'utf-8');
    expect(markdown).toContain('# Workflow Copilot - MVP Roadmap');
  });
});

describe('formatters', () => {
  it('formats empty and populated idea lists', async () => {
    expect(formatIdeaList([])).toContain('No ideas saved yet');

    const idea = await createIdea('A', 'B', 'C', 'D');
    const validated = await updateIdea({ ...idea, validation });
    const output = formatIdeaList([validated]);

    expect(output).toContain('Saved ideas');
    expect(output).toContain(validated.id);
    expect(output).toContain(`${validation.score}/100`);
  });

  it('formats full idea details with validation and roadmap summaries', async () => {
    const idea = await createIdea('A', 'Problem', 'Target', 'Different');
    const validated = await updateIdea({ ...idea, validation });
    const roadmap = await generateAndPersistRoadmap(validated);
    const loaded = await loadIdea(idea.id);

    const output = formatIdeaDetails(loaded);
    expect(output).toContain('Problem');
    expect(output).toContain('Target');
    expect(output).toContain('Validation');
    expect(output).toContain(`${validation.score}/100`);
    expect(output).toContain('Roadmap');
    expect(output).toContain(roadmap.markdownPath);
  });
});
