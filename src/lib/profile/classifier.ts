import { BuilderPattern } from '@/types/schema_v2';

interface ProfileResult {
  builder_mode: string;
  dominant_pattern: string;
  execution_style: string;
  friction_type: string;
  summary_label: string;
}

export function classifyProfile(patterns: BuilderPattern[]): ProfileResult {
  const pMap = new Map(patterns.map(p => [p.pattern_type, p]));
  
  const momentum = pMap.get('momentum');
  const focus = pMap.get('focus');
  const execution = pMap.get('execution');
  const friction = pMap.get('friction');

  // 1. Determine Builder Mode
  let builderMode = "Steady Builder"; // Default
  
  if (momentum?.pattern_label === 'Strong Momentum') {
    if (focus?.pattern_label === 'Deep Focus') builderMode = "Deep Focus Builder";
    else if (focus?.pattern_label === 'Context Switching') builderMode = "Burst Builder";
    else builderMode = "High Velocity Builder";
  } else if (momentum?.pattern_label === 'Momentum Decay') {
     builderMode = "Reactive Builder";
  } else {
     if (friction?.pattern_label === 'High Friction') builderMode = "Stalled Builder";
  }

  // 2. Identify Dominant Pattern (Highest Confidence)
  const dominant = patterns.reduce((prev, current) => 
    (prev.confidence_score > current.confidence_score) ? prev : current
  , patterns[0]);
  
  const dominantLabel = dominant ? `${dominant.pattern_label} (${dominant.pattern_type})` : "None";

  // 3. Execution Style
  let execStyle = "Balanced";
  if (execution?.pattern_label === 'Execution-Driven') execStyle = "Shipper";
  else if (execution?.pattern_label === 'Preparation Loop') execStyle = "Planner";

  // 4. Friction Type
  let fricType = "Minimal";
  if (friction?.pattern_label === 'High Friction') {
     // In a real LLM scenario, we'd analyze the content. 
     // For MVP deterministic, we infer from focus/execution.
     if (focus?.pattern_label === 'Context Switching') fricType = "Context Overload";
     else if (execution?.pattern_label === 'Preparation Loop') fricType = "Overplanning";
     else fricType = "External Blocker";
  }

  // 5. Summary Label
  const summary = `${builderMode} • ${execStyle}`;

  return {
    builder_mode: builderMode,
    dominant_pattern: dominantLabel,
    execution_style: execStyle,
    friction_type: fricType,
    summary_label: summary
  };
}
