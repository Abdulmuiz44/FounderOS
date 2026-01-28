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