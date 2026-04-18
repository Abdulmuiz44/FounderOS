/**
 * CLI Types and Interfaces
 */

export interface Idea {
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
