import { Severity, Direction } from '../../types/signal.js';

interface DeltaResult {
  deltaPercent: number;
  direction: Direction;
  severity: Severity;
}

export function computeDelta(current: number, previous: number): DeltaResult {
  const delta = current - previous;
  let deltaPercent = previous !== 0 ? (delta / previous) * 100 : 0;
  deltaPercent = Math.round(deltaPercent * 10) / 10;

  let direction: Direction = 'flat';
  if (deltaPercent > 1) direction = 'up';
  if (deltaPercent < -1) direction = 'down';

  const absDelta = Math.abs(deltaPercent);
  let severity: Severity = 'low';
  if (absDelta > 15) severity = 'high';
  else if (absDelta > 5) severity = 'medium';

  return { deltaPercent, direction, severity };
}