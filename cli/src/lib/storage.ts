/**
 * Storage Layer
 * 
 * Persists ideas to ~/.founder/ideas/
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { homedir } from 'os';
import { randomUUID } from 'crypto';
import type { Idea, CLIConfig } from './cli-types.js';

const FOUNDER_DIR = path.join(homedir(), '.founder');
const IDEAS_DIR = path.join(FOUNDER_DIR, 'ideas');
const CONFIG_FILE = path.join(FOUNDER_DIR, 'config.json');

// Ensure directories exist
export const ensureStorageDir = async (): Promise<void> => {
  try {
    await fs.mkdir(IDEAS_DIR, { recursive: true });
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code !== 'EEXIST') {
      throw err;
    }
  }
};

// Generate a new ID
const generateId = (): string => {
  try {
    return `idea_${randomUUID()}`;
  } catch {
    // Fallback: simple UUID-like string
    return `idea_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  }
};

// Create a new idea
export const createIdea = async (
  title: string,
  problemStatement: string,
  targetUser: string,
  differentiator: string,
): Promise<Idea> => {
  await ensureStorageDir();

  const idea: Idea = {
    id: generateId(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    title,
    problemStatement,
    targetUser,
    differentiator,
  };

  const filePath = path.join(IDEAS_DIR, `${idea.id}.json`);
  await fs.writeFile(filePath, JSON.stringify(idea, null, 2));

  return idea;
};

// Load an idea by ID
export const loadIdea = async (id: string): Promise<Idea> => {
  const filePath = path.join(IDEAS_DIR, `${id}.json`);
  const data = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(data);
};

// List all ideas
export const listIdeas = async (): Promise<Idea[]> => {
  await ensureStorageDir();

  try {
    const files = await fs.readdir(IDEAS_DIR);
    const ideas = await Promise.all(
      files
        .filter((f) => f.endsWith('.json'))
        .map((f) => fs.readFile(path.join(IDEAS_DIR, f), 'utf-8').then(JSON.parse)),
    );
    return ideas.sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
      return [];
    }
    throw err;
  }
};

// Update an idea
export const updateIdea = async (idea: Idea): Promise<void> => {
  idea.updatedAt = new Date().toISOString();
  const filePath = path.join(IDEAS_DIR, `${idea.id}.json`);
  await fs.writeFile(filePath, JSON.stringify(idea, null, 2));
};

// Delete an idea
export const deleteIdea = async (id: string): Promise<void> => {
  const filePath = path.join(IDEAS_DIR, `${id}.json`);
  await fs.unlink(filePath);
};

// Load or create config
export const loadConfig = async (): Promise<CLIConfig> => {
  try {
    const data = await fs.readFile(CONFIG_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    const config: CLIConfig = {
      dataDir: IDEAS_DIR,
      theme: 'dark',
    };
    await fs.mkdir(FOUNDER_DIR, { recursive: true });
    await fs.writeFile(CONFIG_FILE, JSON.stringify(config, null, 2));
    return config;
  }
};

export const getStoragePath = (): string => IDEAS_DIR;
