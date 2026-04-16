import { describe, it, expect } from 'vitest';
import { calculateValidationScore, scoreExplanation } from './scoring.js';

describe('Scoring Logic', () => {
  it('should calculate a high score for an ideal idea', () => {
    const input = {
      painIntensity: 10,
      urgency: 10,
      targetUserClarity: 10,
      willingnessToPay: 10,
      competitionSaturation: 1,
      distributionDifficulty: 1,
      founderAdvantage: 10,
    };
    const result = calculateValidationScore(input);
    expect(result.score).toBe(100);
    expect(result.strengths).toContain('Strong pain point identified');
    expect(result.recommendation).toContain('Strong Signal');
  });

  it('should calculate a low score for a poor idea', () => {
    const input = {
      painIntensity: 2,
      urgency: 2,
      targetUserClarity: 2,
      willingnessToPay: 2,
      competitionSaturation: 10,
      distributionDifficulty: 10,
      founderAdvantage: 2,
    };
    const result = calculateValidationScore(input);
    expect(result.score).toBeLessThan(30);
    expect(result.risks).toContain('Weak or unclear pain point');
    expect(result.recommendation).toContain('Stop');
  });

  it('should handle middle-of-the-road values', () => {
    const input = {
      painIntensity: 5,
      urgency: 5,
      targetUserClarity: 5,
      willingnessToPay: 5,
      competitionSaturation: 5,
      distributionDifficulty: 5,
      founderAdvantage: 5,
    };
    const result = calculateValidationScore(input);
    expect(result.score).toBe(52); 
    expect(result.score).toBeGreaterThan(40);
    expect(result.score).toBeLessThan(70);
  });
});

describe('Score Explanation', () => {
  it('returns Highly Viable for 80+', () => {
    expect(scoreExplanation(85)).toBe('Highly Viable - Exceptional fundamentals');
  });
  it('returns Not Viable for low scores', () => {
    expect(scoreExplanation(20)).toBe('Not Viable - High probability of failure without pivot');
  });
});
