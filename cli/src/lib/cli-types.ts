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
    painIntensity: number;       // 1-10
    urgency: number;             // 1-10
    targetUserClarity: number;   // 1-10
    willingnessToPay: number;    // 1-10
    competitionSaturation: number; // 1-10 (higher is worse for score)
    distributionDifficulty: number; // 1-10 (higher is worse for score)
    founderAdvantage: number;    // 1-10
  };
  score: number;                 // 0-100
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
  phases: RoadmapPhase[];
  estimatedTotalWeeks: number;
}

export interface CLIConfig {
  dataDir: string;
  editor?: string;
  theme?: 'dark' | 'light';
}
