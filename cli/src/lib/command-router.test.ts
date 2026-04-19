import * as fs from 'fs/promises';
import * as os from 'os';
import * as path from 'path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { routeCommand } from './command-router.js';
import { loadIdea, listIdeas } from './storage.js';

let testRoot: string;

const captureOutput = async <T>(fn: () => Promise<T>): Promise<{ result: T; stdout: string }> => {
  const chunks: string[] = [];
  const originalWrite = process.stdout.write;

  process.stdout.write = ((chunk: string | Uint8Array) => {
    chunks.push(Buffer.isBuffer(chunk) ? chunk.toString('utf8') : String(chunk));
    return true;
  }) as typeof process.stdout.write;

  try {
    const result = await fn();
    return { result, stdout: chunks.join('') };
  } finally {
    process.stdout.write = originalWrite;
  }
};

beforeEach(async () => {
  testRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'founder-router-'));
  process.env.FOUNDER_HOME = testRoot;
});

afterEach(async () => {
  delete process.env.FOUNDER_HOME;
  await fs.rm(testRoot, { recursive: true, force: true });
});

describe('command router non-interactive mode', () => {
  it('creates a new idea via flags and returns json', async () => {
    const { result, stdout } = await captureOutput(() =>
      routeCommand([
        'new',
        '--title',
        'Router Idea',
        '--problem',
        'Manual workflows waste founder time',
        '--target-user',
        'Solo founders',
        '--differentiator',
        'Local automation-first CLI',
        '--json',
      ]),
    );

    expect(result.exitCode).toBe(0);
    const parsed = JSON.parse(stdout) as { id: string; schemaVersion: number };
    expect(parsed.id).toMatch(/^idea_/);
    expect(parsed.schemaVersion).toBe(2);
  });

  it('validates and roadmaps an idea with json output', async () => {
    const created = await captureOutput(() =>
      routeCommand([
        'new',
        '--title',
        'Router Idea',
        '--problem',
        'Manual workflows waste founder time',
        '--target-user',
        'Solo founders',
        '--differentiator',
        'Local automation-first CLI',
        '--json',
      ]),
    );
    const id = (JSON.parse(created.stdout) as { id: string }).id;

    const validated = await captureOutput(() =>
      routeCommand([
        'validate',
        id,
        '--pain-intensity',
        '8',
        '--urgency',
        '7',
        '--target-user-clarity',
        '8',
        '--willingness-to-pay',
        '7',
        '--competition-saturation',
        '3',
        '--distribution-difficulty',
        '4',
        '--founder-advantage',
        '8',
        '--json',
      ]),
    );

    expect(validated.result.exitCode).toBe(0);
    const validationPayload = JSON.parse(validated.stdout) as { score: number };
    expect(validationPayload.score).toBeGreaterThan(0);

    const roadmap = await captureOutput(() => routeCommand(['roadmap', id, '--json']));
    expect(roadmap.result.exitCode).toBe(0);
    const roadmapPayload = JSON.parse(roadmap.stdout) as { roadmap: { markdownPath: string } };
    expect(roadmapPayload.roadmap.markdownPath).toContain(`${id}-ROADMAP.md`);

    const idea = await loadIdea(id);
    expect(idea.validation?.score).toBe(validationPayload.score);
    expect(idea.roadmap?.markdownPath).toBe(roadmapPayload.roadmap.markdownPath);
  });

  it('supports list/show json and typed errors', async () => {
    const unknown = await captureOutput(() => routeCommand(['show', 'idea_missing', '--json']));
    expect(unknown.result.exitCode).toBe(4);
    expect(unknown.stdout).toContain('No idea found');

    await captureOutput(() =>
      routeCommand([
        'new',
        '--title',
        'List Idea',
        '--problem',
        'Problem',
        '--target-user',
        'User',
        '--differentiator',
        'Diff',
      ]),
    );

    const listed = await captureOutput(() => routeCommand(['list', '--json']));
    expect(listed.result.exitCode).toBe(0);
    const ideas = JSON.parse(listed.stdout) as Array<{ id: string }>;
    expect(ideas.length).toBe(1);

    const shown = await captureOutput(() => routeCommand(['show', ideas[0].id, '--json']));
    expect(shown.result.exitCode).toBe(0);
    const idea = JSON.parse(shown.stdout) as { id: string; schemaVersion: number };
    expect(idea.id).toBe(ideas[0].id);
    expect(idea.schemaVersion).toBe(2);
  });

  it('exports and imports ideas with collision handling', async () => {
    await captureOutput(() =>
      routeCommand([
        'new',
        '--title',
        'Exportable',
        '--problem',
        'Problem',
        '--target-user',
        'User',
        '--differentiator',
        'Diff',
      ]),
    );

    const exportPath = path.join(testRoot, 'ideas-export.json');
    const exported = await captureOutput(() => routeCommand(['export', '--path', exportPath, '--json']));
    expect(exported.result.exitCode).toBe(0);

    const importSkip = await captureOutput(() =>
      routeCommand(['import', '--path', exportPath, '--mode', 'skip', '--json']),
    );
    const skipPayload = JSON.parse(importSkip.stdout) as { skipped: number };
    expect(skipPayload.skipped).toBe(1);

    const importRename = await captureOutput(() =>
      routeCommand(['import', '--path', exportPath, '--mode', 'rename', '--json']),
    );
    const renamePayload = JSON.parse(importRename.stdout) as { renamed: number };
    expect(renamePayload.renamed).toBe(1);

    const ideas = await listIdeas();
    expect(ideas.length).toBe(2);
  });
});
