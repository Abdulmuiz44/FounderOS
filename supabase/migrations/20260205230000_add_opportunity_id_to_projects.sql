-- Add opportunity_id column to projects table
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS opportunity_id UUID REFERENCES opportunities(id);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_projects_opportunity_id ON projects(opportunity_id);
