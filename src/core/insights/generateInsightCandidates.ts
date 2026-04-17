import { InsightCandidate } from '../../types/insight';

export function generateInsightCandidates(patterns: string[]): InsightCandidate[] {
  return patterns.map(pattern => {
    switch (pattern) {
      case 'attention_without_direction':
        return {
          type: 'pattern_match',
          description: 'You are attracting eyeballs but failing to convert interest into users. This represents "Attention without Direction"—a common builder trap.',
          confidence: 'high',
          relatedMetrics: ['sessions', 'signup_conversion_rate']
        };
      case 'planning_loop':
        return {
          type: 'pattern_match',
          description: 'Top-of-funnel activity is high but meaningful output (deals/milestones) is flat. You might be stuck in a "Planning Loop."',
          confidence: 'medium',
          relatedMetrics: ['leads_created', 'deals_closed']
        };
      case 'momentum_decay':
        return {
          type: 'pattern_match',
          description: 'A significant drop in commits and ship-velocity indicates "Momentum Decay." Chaos is likely increasing.',
          confidence: 'high',
          relatedMetrics: ['commits', 'pull_requests']
        };
      default:
        return {
          type: 'unknown',
          description: pattern,
          confidence: 'low',
          relatedMetrics: []
        };
    }
  });
}