/**
 * Storage Layer
 *
 * Persists ideas to ~/.founder/ideas/ by default. Tests can override the root
 * with FOUNDER_HOME to avoid touching a real local workspace.
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { randomUUID } from 'crypto';
import type { Idea, CLIConfig, IdeasExportBundle, RoadmapResult, ValidationResult } from './cli-types.js';
import { IDEA_SCHEMA_VERSION } from './cli-types.js';
import { getConfigFile, getFounderDir, getIdeasDir, getRoadmapMarkdownPath } from './storage-paths.js';
import { CliError } from './errors.js';

export const ensureStorageDir = async (): Promise<void> => {
  await fs.mkdir(getIdeasDir(), { recursive: true });
};

export const isIdeaId = (value: string): boolean => /^idea_[A-Za-z0-9_-]+$/.test(value);

const assertSafeIdeaId = (id: string): void => {
  if (!isIdeaId(id)) {
    throw new CliError('INVALID_ARGUMENT', `Invalid idea id: ${id}`);
  }
};

const generateId = (): string => {
  try {
    return `idea_${randomUUID()}`;
  } catch {
    return `idea_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  }
};

const getIdeaPath = (id: string): string => {
  assertSafeIdeaId(id);
  return path.join(getIdeasDir(), `${id}.json`);
};

const nowIso = (): string => new Date().toISOString();

const normalizeValidation = (input: unknown): ValidationResult | undefined => {
  if (!input || typeof input !== 'object') {
    return undefined;
  }
  return input as ValidationResult;
};

const normalizeRoadmap = (ideaId: string, input: unknown): RoadmapResult | undefined => {
  if (!input || typeof input !== 'object') {
    return undefined;
  }

  const value = input as Partial<RoadmapResult>;
  return {
    generatedAt: typeof value.generatedAt === 'string' ? value.generatedAt : nowIso(),
    estimatedTotalWeeks:
      typeof value.estimatedTotalWeeks === 'number' && Number.isFinite(value.estimatedTotalWeeks)
        ? value.estimatedTotalWeeks
        : 8,
    phases: Array.isArray(value.phases) ? value.phases : [],
    markdownPath:
      typeof value.markdownPath === 'string' && value.markdownPath.length > 0
        ? value.markdownPath
        : getRoadmapMarkdownPath(ideaId),
  };
};

export const normalizeIdeaRecord = (raw: unknown): Idea => {
  if (!raw || typeof raw !== 'object') {
    throw new CliError('INVALID_DATA', 'Idea file contains invalid JSON object');
  }

  const value = raw as Partial<Idea> & { schemaVersion?: number };
  const id = typeof value.id === 'string' ? value.id : generateId();
  assertSafeIdeaId(id);

  const createdAt = typeof value.createdAt === 'string' ? value.createdAt : nowIso();
  const updatedAt = typeof value.updatedAt === 'string' ? value.updatedAt : createdAt;

  const idea: Idea = {
    schemaVersion: IDEA_SCHEMA_VERSION,
    id,
    createdAt,
    updatedAt,
    title: typeof value.title === 'string' ? value.title : 'Untitled Idea',
    problemStatement:
      typeof value.problemStatement === 'string' ? value.problemStatement : 'No problem statement provided.',
    targetUser: typeof value.targetUser === 'string' ? value.targetUser : 'Unspecified user segment.',
    differentiator:
      typeof value.differentiator === 'string' ? value.differentiator : 'No differentiator provided.',
    validation: normalizeValidation(value.validation),
    roadmap: normalizeRoadmap(id, value.roadmap),
  };

  return idea;
};

const readIdeaFile = async (filePath: string): Promise<{ idea: Idea; migrated: boolean }> => {
  const data = await fs.readFile(filePath, 'utf-8');
  const raw = JSON.parse(data) as unknown;
  const idea = normalizeIdeaRecord(raw);
  const migrated = JSON.stringify(raw) !== JSON.stringify(idea);
  return { idea, migrated };
};

const persistIdea = async (idea: Idea): Promise<void> => {
  await fs.writeFile(getIdeaPath(idea.id), JSON.stringify(idea, null, 2));
};

export const createIdea = async (
  title: string,
  problemStatement: string,
  targetUser: string,
  differentiator: string,
): Promise<Idea> => {
  await ensureStorageDir();
  const now = nowIso();

  const idea: Idea = {
    schemaVersion: IDEA_SCHEMA_VERSION,
    id: generateId(),
    createdAt: now,
    updatedAt: now,
    title,
    problemStatement,
    targetUser,
    differentiator,
  };

  await persistIdea(idea);
  return idea;
};

export const writeIdea = async (
  idea: Idea,
  options?: { touchUpdatedAt?: boolean; allowIdChange?: boolean },
): Promise<Idea> => {
  await ensureStorageDir();
  const normalized = normalizeIdeaRecord(idea);
  const nextIdea: Idea = {
    ...normalized,
    schemaVersion: IDEA_SCHEMA_VERSION,
    updatedAt: options?.touchUpdatedAt === false ? normalized.updatedAt : nowIso(),
  };

  await persistIdea(nextIdea);
  return nextIdea;
};

export const loadIdea = async (id: string): Promise<Idea> => {
  const filePath = getIdeaPath(id);
  const { idea, migrated } = await readIdeaFile(filePath);
  if (migrated) {
    await persistIdea(idea);
  }
  return idea;
};

export const findIdea = async (id: string): Promise<Idea | null> => {
  try {
    return await loadIdea(id);
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
      return null;
    }
    throw err;
  }
};

export const listIdeas = async (): Promise<Idea[]> => {
  await ensureStorageDir();

  const files = await fs.readdir(getIdeasDir());
  const ideas = await Promise.all(
    files
      .filter((file) => file.endsWith('.json'))
      .map(async (file) => {
        const filePath = path.join(getIdeasDir(), file);
        const { idea, migrated } = await readIdeaFile(filePath);
        if (migrated) {
          await persistIdea(idea);
        }
        return idea;
      }),
  );

  return ideas.sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );
};

export const updateIdea = async (idea: Idea): Promise<Idea> => {
  return writeIdea(idea, { touchUpdatedAt: true });
};

export const updateIdeaById = async (
  id: string,
  update: (idea: Idea) => Idea,
): Promise<Idea | null> => {
  const idea = await findIdea(id);
  if (!idea) {
    return null;
  }

  return updateIdea(update(idea));
};

export const deleteIdea = async (id: string): Promise<boolean> => {
  try {
    await fs.unlink(getIdeaPath(id));
    return true;
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
      return false;
    }
    throw err;
  }
};

export const loadConfig = async (): Promise<CLIConfig> => {
  try {
    const data = await fs.readFile(getConfigFile(), 'utf-8');
    return JSON.parse(data) as CLIConfig;
  } catch {
    const config: CLIConfig = {
      dataDir: getIdeasDir(),
      theme: 'dark',
    };
    await fs.mkdir(getFounderDir(), { recursive: true });
    await fs.writeFile(getConfigFile(), JSON.stringify(config, null, 2));
    return config;
  }
};

export const makeImportSafeIdea = (idea: Idea): Idea => {
  const normalized = normalizeIdeaRecord(idea);
  return {
    ...normalized,
    schemaVersion: IDEA_SCHEMA_VERSION,
    updatedAt: nowIso(),
  };
};

export const createRenamedIdea = (idea: Idea): Idea => {
  const normalized = normalizeIdeaRecord(idea);
  const now = nowIso();
  return {
    ...normalized,
    schemaVersion: IDEA_SCHEMA_VERSION,
    id: generateId(),
    createdAt: now,
    updatedAt: now,
  };
};

export const parseIdeasBundle = (raw: unknown): IdeasExportBundle => {
  if (!raw || typeof raw !== 'object') {
    throw new CliError('INVALID_DATA', 'Import file must contain a JSON object');
  }

  const value = raw as Partial<IdeasExportBundle>;
  if (!Array.isArray(value.ideas)) {
    throw new CliError('INVALID_DATA', 'Import file must contain an ideas array');
  }

  return {
    bundleVersion: 1,
    exportedAt: typeof value.exportedAt === 'string' ? value.exportedAt : nowIso(),
    ideas: value.ideas.map((idea) => normalizeIdeaRecord(idea)),
  };
};

export const getStoragePath = (): string => getIdeasDir();
