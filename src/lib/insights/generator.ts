import { BuilderPattern } from '@/types/schema_v2';

export function generateInsight(patterns: BuilderPattern[]): string {
  // This function mocks the LLM synthesis.
  // In production, this would call OpenAI/Gemini with the system prompt.
  
  if (!patterns || patterns.length === 0) {
    return "Not enough data to generate an insight yet. Start logging your work.";
  }

  const pMap = new Map(patterns.map(p => [p.pattern_type, p]));
  
  const momentum = pMap.get('momentum');
  const focus = pMap.get('focus');
  const execution = pMap.get('execution');
  const friction = pMap.get('friction');

  // Neutral, mirror-like synthesis
  let insight = "Your logs show ";

  // Momentum + Focus
  if (momentum?.pattern_label === 'Strong Momentum') {
    insight += "a consistent streak of activity";
  } else {
    insight += "intermittent periods of activity";
  }

  if (focus?.pattern_label === 'Deep Focus') {
    insight += " channeled into a single project. ";
  } else {
    insight += ", distributed across multiple contexts. ";
  }

  // Execution
  if (execution?.pattern_label === 'Execution-Driven') {
    insight += "You tend to prioritize shipping over planning, ";
  } else if (execution?.pattern_label === 'Preparation Loop') {
    insight += "You spend significant time in research and planning, ";
  } else {
    insight += "You maintain a balance of planning and shipping, ";
  }

  // Friction
  if (friction?.pattern_label === 'High Friction') {
    insight += "though recurring blockers are currently slowing your velocity.";
  } else {
    insight += "and generally unblock yourself effectively.";
  }

  return insight;
}
