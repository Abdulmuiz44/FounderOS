import * as path from 'path';
import { homedir } from 'os';

export const getFounderDir = (): string =>
  process.env.FOUNDER_HOME ?? path.join(homedir(), '.founder');

export const getIdeasDir = (): string => path.join(getFounderDir(), 'ideas');

export const getConfigFile = (): string => path.join(getFounderDir(), 'config.json');

export const getRoadmapMarkdownPath = (ideaId: string): string =>
  path.join(getFounderDir(), `${ideaId}-ROADMAP.md`);
