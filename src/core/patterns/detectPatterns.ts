import { Signal } from '../../types/signal';

export function detectPatterns(signals: Signal[]): string[] {
  const patterns: string[] = [];
  const getSignal = (metric: string) => signals.find(s => s.metric === metric);

  const sessions = getSignal('sessions');
  const conversion = getSignal('signup_conversion_rate');
  if (sessions?.direction === 'up' && conversion?.direction === 'down') {
    patterns.push('attention_without_direction');
  }

  const leads = getSignal('leads_created');
  const deals = getSignal('deals_closed');
  if (leads?.direction === 'up' && (deals?.direction === 'flat' || deals?.direction === 'down')) {
    patterns.push('planning_loop');
  }

  const commits = getSignal('commits');
  const prs = getSignal('pull_requests');
  if (commits?.direction === 'down' && prs?.direction === 'down') {
    patterns.push('momentum_decay');
  }

  return patterns;
}