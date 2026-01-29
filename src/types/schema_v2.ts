export interface Subscription {
  id: string;
  user_id: string;
  plan: 'starter' | 'pro';
  status: 'active' | 'cancelled' | 'expired' | 'on_trial';
  renews_at?: string;
}

export interface Project {
  id: string;
  user_id: string;
  name: string;
  description: string;
  audience: string;
  current_goal: string;
  open_questions: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface Log {
  id: string;
  project_id: string;
  user_id: string;
  content: string;
  log_type: 'update' | 'learning' | 'blocker';
  created_at: string;
}

export interface AiSummary {
  id: string;
  log_id?: string;
  project_id?: string;
  summary_text: string;
  created_at: string;
}

export interface BuilderPattern {
  id: string;
  user_id: string;
  pattern_type: 'momentum' | 'focus' | 'execution' | 'friction';
  pattern_label: string;
  explanation: string;
  confidence_score: number;
  updated_at: string;
}

export interface BuilderInsight {
  id: string;
  user_id: string;
  insight_text: string;
  generated_from_patterns: any;
  updated_at: string;
}

export interface BuilderOSProfile {
  id: string;
  user_id: string;
  builder_mode: string;
  dominant_pattern: string;
  execution_style: string;
  friction_type: string;
  summary_label: string;
  updated_at: string;
}

export interface BuilderOSDrift {
  id: string;
  user_id: string;
  summary: string;
  severity: 'stable' | 'minor shift' | 'major shift';
  created_at: string;
}

// Chatter Ratio: Measures AI interaction vs actual execution
export interface ChatterMetrics {
  id: string;
  user_id: string;
  project_id?: string;
  ai_interaction_minutes: number;  // Time spent prompting/chatting with AI
  execution_minutes: number;       // Time spent actually building (commits, deploys)
  chatter_ratio: number;           // ai_interaction / (ai_interaction + execution)
  model_used?: string;             // e.g., 'gpt-4o', 'claude-3.5', 'gemini-2.0'
  session_date: string;
  created_at: string;
}

// Builder Mode derived from chatter patterns
export type BuilderModeType =
  | 'deep_flow'           // Low chatter, high execution
  | 'balanced_building'   // Healthy mix
  | 'planning_loop'       // High chatter, low execution
  | 'momentum_decay'      // Declining execution over time
  | 'attention_scatter';  // Switching between many projects/models
