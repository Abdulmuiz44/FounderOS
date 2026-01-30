-- Chatter Metrics Table
-- Tracks AI interaction vs execution time for Chatter Ratio feature
CREATE TABLE IF NOT EXISTS chatter_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  ai_interaction_minutes INTEGER NOT NULL DEFAULT 0,
  execution_minutes INTEGER NOT NULL DEFAULT 0,
  chatter_ratio DECIMAL(3,2) NOT NULL DEFAULT 0,
  model_used TEXT,
  session_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Unique constraint: one entry per user per project per day
  UNIQUE(user_id, project_id, session_date)
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_chatter_metrics_user_date 
ON chatter_metrics(user_id, session_date DESC);

-- RLS Policies
ALTER TABLE chatter_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own chatter metrics"
ON chatter_metrics FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own chatter metrics"
ON chatter_metrics FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own chatter metrics"
ON chatter_metrics FOR UPDATE
USING (auth.uid() = user_id);
