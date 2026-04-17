-- Add github_repo_full_name to projects
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS github_repo_full_name TEXT;
