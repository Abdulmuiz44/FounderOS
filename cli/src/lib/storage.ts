/**
 * Storage Layer
 *
 * Persists ideas to ~/.founder/ideas/ by default. Tests can override the root
 * with FOUNDER_HOME to avoid touching a real local workspace.
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { randomUUID } from 'crypto';
import type { Idea, CLIConfig } from './cli-types.js';
import { getConfigFile, getFounderDir, getIdeasDir } from './storage-paths.js';

export const ensureStorageDir = async (): Promise<void> => {
  await fs.mkdir(getIdeasDir(), { recursive: true });
};

const generateId = (): string => {
  try {
    return `idea_${randomUUID()}`;
  } catch {
    return `idea_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  }
};

const assertSafeIdeaId = (id: string): void => {
  if (!/^idea_[A-Za-z0-9_-]+$/.test(id)) {
    throw new Error(`Invalid idea id: ${id}`);
  }
};

const getIdeaPath = (id: string): string => {
  assertSafeIdeaId(id);
  return path.join(getIdeasDir(), `${id}.json`);
};

export const createIdea = async (
  title: string,
  problemStatement: string,
  targetUser: string,
  differentiator: string,
): Promise<Idea> => {
  await ensureStorageDir();
  const now = new Date().toISOString();

  const idea: Idea = {
    id: generateId(),
    createdAt: now,
    updatedAt: now,
    title,
    problemStatement,
    targetUser,
    differentiator,
  };

  await fs.writeFile(getIdeaPath(idea.id), JSON.stringify(idea, null, 2));
  return idea;
};

export const loadIdea = async (id: string): Promise<Idea> => {
  const data = await fs.readFile(getIdeaPath(id), 'utf-8');
  return JSON.parse(data) as Idea;
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
        const data = await fs.readFile(path.join(getIdeasDir(), file), 'utf-8');
        return JSON.parse(data) as Idea;
      }),
  );

  return ideas.sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );
};

export const updateIdea = async (idea: Idea): Promise<Idea> => {
  await ensureStorageDir();
  const updatedIdea: Idea = {
    ...idea,
    updatedAt: new Date().toISOString(),
  };

  await fs.writeFile(getIdeaPath(updatedIdea.id), JSON.stringify(updatedIdea, null, 2));
  return updatedIdea;
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

export const getStoragePath = (): string => getIdeasDir();
