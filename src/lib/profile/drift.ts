import { BuilderOSProfile } from '@/types/schema_v2';

interface DriftResult {
  summary: string;
  severity: 'stable' | 'minor shift' | 'major shift';
}

export function calculateDrift(current: BuilderOSProfile, previous: BuilderOSProfile | null): DriftResult {
  if (!previous) {
    return {
      summary: "System baseline established. Tracking initialized.",
      severity: 'stable'
    };
  }

  let changes: string[] = [];
  let severityScore = 0;

  // Check Mode
  if (current.builder_mode !== previous.builder_mode) {
    changes.push(`Mode shifted from ${previous.builder_mode} to ${current.builder_mode}`);
    severityScore += 2;
  }

  // Check Execution Style
  if (current.execution_style !== previous.execution_style) {
    changes.push(`Execution style changed to ${current.execution_style}`);
    severityScore += 1;
  }

  // Check Friction
  if (current.friction_type !== previous.friction_type) {
    if (current.friction_type === 'Minimal' && previous.friction_type !== 'Minimal') {
       changes.push(`Friction cleared (${previous.friction_type} resolved)`);
       severityScore += 1;
    } else if (previous.friction_type === 'Minimal' && current.friction_type !== 'Minimal') {
       changes.push(`New friction detected: ${current.friction_type}`);
       severityScore += 2;
    } else {
       changes.push(`Friction source shifted to ${current.friction_type}`);
       severityScore += 1;
    }
  }

  // Determine Result
  if (changes.length === 0) {
    return {
      summary: "Operating system remains stable. No significant drift detected.",
      severity: 'stable'
    };
  }

  const severity = severityScore >= 3 ? 'major shift' : 'minor shift';
  
  // Construct neutral summary
  const summary = `System drift detected: ${changes.join('. ')}.`;

  return {
    summary,
    severity
  };
}
