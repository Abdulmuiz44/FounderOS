export interface Project {
  id: string;
  user_id: string;
  name: string;
  description: string;
  audience: string;
  current_blockers: string;
  uncertainties: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectLog {
  id: string;
  project_id: string;
  user_id: string;
  content: string;
  type: 'note' | 'experiment' | 'ai_output';
  tags: string[];
  created_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  status: 'active' | 'on_trial' | 'cancelled' | 'expired';
  plan_id?: string;
  renews_at?: string;
}
