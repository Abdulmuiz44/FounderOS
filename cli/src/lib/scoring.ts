/**
 * Validation Scoring Engine
 * 
 * A transparent, practical startup validation framework.
 */

import type { ValidationResult } from './cli-types.js';

export interface ScoringInput {
  painIntensity: number;       // 1-10
  urgency: number;             // 1-10
  targetUserClarity: number;   // 1-10
  willingnessToPay: number;    // 1-10
  competitionSaturation: number; // 1-10 (higher is worse)
  distributionDifficulty: number; // 1-10 (higher is worse)
  founderAdvantage: number;    // 1-10
}

export const calculateValidationScore = (input: ScoringInput): ValidationResult => {
  // Weights for the scoring system
  const weights = {
    painIntensity: 0.20,
    urgency: 0.15,
    targetUserClarity: 0.10,
    willingnessToPay: 0.20,
    competitionSaturation: 0.10, // Inverted
    distributionDifficulty: 0.10, // Inverted
    founderAdvantage: 0.15,
  };

  // Invert scores where higher is worse
  const invertedCompetition = 11 - input.competitionSaturation;
  const invertedDistribution = 11 - input.distributionDifficulty;

  // Calculate weighted score
  const weightedScore = 
    (input.painIntensity * weights.painIntensity) +
    (input.urgency * weights.urgency) +
    (input.targetUserClarity * weights.targetUserClarity) +
    (input.willingnessToPay * weights.willingnessToPay) +
    (invertedCompetition * weights.competitionSaturation) +
    (invertedDistribution * weights.distributionDifficulty) +
    (input.founderAdvantage * weights.founderAdvantage);

  const finalScore = Math.round(weightedScore * 10); // Scale to 0-100

  // Identify strengths (scores >= 8)
  const strengths: string[] = [];
  if (input.painIntensity >= 8) strengths.push('Strong pain point identified');
  if (input.urgency >= 8) strengths.push('High market urgency');
  if (input.willingnessToPay >= 8) strengths.push('Strong monetization potential');
  if (input.founderAdvantage >= 8) strengths.push('Unique founder advantage');
  if (input.competitionSaturation <= 3) strengths.push('Low competition saturation');
  if (input.distributionDifficulty <= 3) strengths.push('Clear distribution path');
  if (input.targetUserClarity >= 8) strengths.push('Very clear target audience');

  // Identify risks (scores <= 4 or inverted scores <= 4)
  const risks: string[] = [];
  if (input.painIntensity <= 4) risks.push('Weak or unclear pain point');
  if (input.urgency <= 4) risks.push('Lack of urgency in the market');
  if (input.willingnessToPay <= 4) risks.push('Low willingness to pay');
  if (input.founderAdvantage <= 4) risks.push('Limited founder-market fit');
  if (input.competitionSaturation >= 8) risks.push('Highly saturated market');
  if (input.distributionDifficulty >= 8) risks.push('Difficult/expensive distribution');
  if (input.targetUserClarity <= 4) risks.push('Vague target user profile');

  // Default recommendations
  let recommendation = '';
  if (finalScore >= 80) {
    recommendation = 'Strong Signal: Move fast. This idea has high potential and clear advantages.';
  } else if (finalScore >= 60) {
    recommendation = 'Moderate Signal: Promising, but address the identified risks before scaling.';
  } else if (finalScore >= 40) {
    recommendation = 'Weak Signal: Pivot or refine. The fundamentals are shaky in key areas.';
  } else {
    recommendation = 'Stop: Re-evaluate. High risk and low potential for current configuration.';
  }

  return {
    scoredAt: new Date().toISOString(),
    dimensions: { ...input },
    score: finalScore,
    strengths: strengths.length > 0 ? strengths : ['General potential'],
    risks: risks.length > 0 ? risks : ['Standard execution risks'],
    recommendation,
  };
};

export const scoreExplanation = (score: number): string => {
  if (score >= 80) return 'Highly Viable - Exceptional fundamentals';
  if (score >= 60) return 'Viable - Solid foundation with some challenges';
  if (score >= 40) return 'Questionable - Needs significant refinement';
  return 'Not Viable - High probability of failure without pivot';
};
