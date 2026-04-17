import { Log } from '@/types/schema_v2';

interface PatternResult {
  pattern_type: 'momentum' | 'focus' | 'execution' | 'friction';
  pattern_label: string;
  explanation: string;
  confidence_score: number;
}

export function analyzeMomentum(logs: Log[]): PatternResult {
  // Sort logs by date
  const sorted = [...logs].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  
  if (sorted.length < 3) {
    return {
      pattern_type: 'momentum',
      pattern_label: 'Calibrating',
      explanation: 'Not enough data to detect momentum yet. Keep logging.',
      confidence_score: 0.1
    };
  }

  const now = new Date();
  const lastLogDate = new Date(sorted[0].created_at);
  const daysSinceLastLog = (now.getTime() - lastLogDate.getTime()) / (1000 * 3600 * 24);

  // Check consistency (mock logic for MVP)
  // Real logic would bin by week
  
  if (daysSinceLastLog > 5) {
    return {
      pattern_type: 'momentum',
      pattern_label: 'Momentum Decay',
      explanation: 'You tend to slow down after a period of activity. It has been over 5 days since your last log.',
      confidence_score: 0.85
    };
  }

  return {
    pattern_type: 'momentum',
    pattern_label: 'Strong Momentum',
    explanation: 'You are consistently shipping updates. Your frequency indicates high velocity.',
    confidence_score: 0.92
  };
}

export function analyzeFocus(logs: Log[]): PatternResult {
  if (logs.length < 5) {
    return {
      pattern_type: 'focus',
      pattern_label: 'Calibrating',
      explanation: 'Log more activity to reveal your focus patterns.',
      confidence_score: 0.1
    };
  }

  // Count unique project IDs in last 10 logs
  const recentLogs = logs.slice(0, 10);
  const uniqueProjects = new Set(recentLogs.map(l => l.project_id)).size;

  if (uniqueProjects === 1) {
    return {
      pattern_type: 'focus',
      pattern_label: 'Deep Focus',
      explanation: 'You are channeling all energy into a single stream. Deep work detected.',
      confidence_score: 0.95
    };
  } else if (uniqueProjects >= 3) {
    return {
      pattern_type: 'focus',
      pattern_label: 'Context Switching',
      explanation: `You have switched context between ${uniqueProjects} projects recently. This may reduce velocity.`,
      confidence_score: 0.88
    };
  }

  return {
    pattern_type: 'focus',
    pattern_label: 'Balanced',
    explanation: 'You are maintaining a reasonable balance between projects.',
    confidence_score: 0.6
  };
}

export function analyzeExecution(logs: Log[]): PatternResult {
  // Simple keyword matching for MVP
  const planningWords = ['plan', 'think', 'research', 'explore', 'study', 'maybe', 'consider'];
  const executionWords = ['ship', 'build', 'code', 'deploy', 'fix', 'implement', 'write', 'release'];

  let planCount = 0;
  let execCount = 0;

  logs.forEach(log => {
    const text = log.content.toLowerCase();
    if (planningWords.some(w => text.includes(w))) planCount++;
    if (executionWords.some(w => text.includes(w))) execCount++;
  });

  const total = planCount + execCount;
  
  if (total === 0 || logs.length < 3) {
    return {
      pattern_type: 'execution',
      pattern_label: 'Unknown',
      explanation: 'Analysis pending more detailed logs.',
      confidence_score: 0.2
    };
  }

  const ratio = execCount / (total || 1);

  if (ratio > 0.7) {
    return {
      pattern_type: 'execution',
      pattern_label: 'Execution-Driven',
      explanation: 'You spend significantly more time shipping than planning. Bias for action detected.',
      confidence_score: 0.9
    };
  } else if (ratio < 0.3) {
     return {
      pattern_type: 'execution',
      pattern_label: 'Preparation Loop',
      explanation: 'You are spending most time in research mode. Consider shipping smaller increments.',
      confidence_score: 0.85
    };
  }

  return {
    pattern_type: 'execution',
    pattern_label: 'Balanced Approach',
    explanation: 'Healthy mix of thinking and building.',
    confidence_score: 0.7
  };
}

export function analyzeFriction(logs: Log[]): PatternResult {
  const recentLogs = logs.slice(0, 20);
  const blockers = recentLogs.filter(l => l.log_type === 'blocker').length;
  const percentage = blockers / (recentLogs.length || 1);

  if (percentage > 0.3) {
    return {
      pattern_type: 'friction',
      pattern_label: 'High Friction',
      explanation: 'Over 30% of your recent logs are blockers. You may be stuck on a specific problem.',
      confidence_score: 0.92
    };
  }

  return {
    pattern_type: 'friction',
    pattern_label: 'Smooth Flow',
    explanation: 'Low friction detected. You are unblocking yourself effectively.',
    confidence_score: 0.8
  };
}
