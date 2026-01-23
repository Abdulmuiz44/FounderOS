import { InsightCandidate } from '../../types/insight.js';

export function generateInsightCandidates(patterns: string[]): InsightCandidate[] {
  return patterns.map(pattern => {
    switch (pattern) {
      case 'traffic_up_conversion_down':
        return {
          type: 'pattern_match',
          description: 'Traffic is increasing but conversion is dropping, suggesting onboarding or activation friction.',
          confidence: 'high',
          relatedMetrics: ['sessions', 'signup_conversion_rate']
        };
      case 'leads_up_revenue_flat':
        return {
          type: 'pattern_match',
          description: 'Leads are up but revenue (deals) is flat, indicating a sales or qualification bottleneck.',
          confidence: 'medium',
          relatedMetrics: ['leads_created', 'deals_closed']
        };
      case 'engineering_velocity_drop':
        return {
          type: 'pattern_match',
          description: 'Significant drop in commits and PRs signals slowed product iteration.',
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