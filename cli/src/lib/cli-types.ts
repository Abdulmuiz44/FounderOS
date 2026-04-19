/**
 * CLI Types and Interfaces
 */

export const IDEA_SCHEMA_VERSION = 2;

export interface Idea {
  schemaVersion: number;
  id: string;
  createdAt: string;
  updatedAt: string;
  title: string;
  problemStatement: string;
  targetUser: string;
  differentiator: string;
  validation?: ValidationResult;
  roadmap?: RoadmapResult;
}

export interface ValidationResult {
  scoredAt: string;
  dimensions: {
    painIntensity: number;
    urgency: number;
    targetUserClarity: number;
    willingnessToPay: number;
    competitionSaturation: number;
    distributionDifficulty: number;
    founderAdvantage: number;
  };
  score: number;
  strengths: string[];
  risks: string[];
  recommendation: string;
}

export interface RoadmapPhase {
  name: string;
  duration: string;
  tasks: string[];
  deliverables: string[];
}

export interface RoadmapResult {
  generatedAt: string;
  estimatedTotalWeeks: number;
  phases: RoadmapPhase[];
  markdownPath: string;
}

export interface CLIConfig {
  dataDir: string;
  editor?: string;
  theme?: 'dark' | 'light';
}

export interface IdeasExportBundle {
  bundleVersion: 1;
  exportedAt: string;
  ideas: Idea[];
}
