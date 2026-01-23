export interface InsightCandidate {
  type: string;
  description: string;
  confidence: "low" | "medium" | "high";
  relatedMetrics: string[];
}