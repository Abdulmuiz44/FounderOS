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
