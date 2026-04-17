export type Severity = "low" | "medium" | "high";
export type Direction = "up" | "down" | "flat";

export interface Signal {
  source: "ga" | "hubspot" | "github";
  metric: string;
  current: number;
  previous: number;
  deltaPercent: number;
  direction: Direction;
  severity: Severity;
}