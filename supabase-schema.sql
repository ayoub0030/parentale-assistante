-- Tasks Table Schema for Supabase

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  due_date TIMESTAMP WITH TIME ZONE NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  priority TEXT NOT NULL CHECK (priority IN ('high', 'medium', 'low')),
  status TEXT NOT NULL CHECK (status IN ('pending', 'in-progress', 'completed', 'overdue')),
  estimated_time INTEGER,
  recurring_type TEXT CHECK (recurring_type IN ('none', 'daily', 'weekly')),
  resource_url TEXT,
  reward_points INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS tasks_child_id_idx ON tasks(child_id);
CREATE INDEX IF NOT EXISTS tasks_status_idx ON tasks(status);
CREATE INDEX IF NOT EXISTS tasks_due_date_idx ON tasks(due_date);

-- Create RLS (Row Level Security) policies
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Allow users to select their own tasks
CREATE POLICY tasks_select_policy ON tasks
  FOR SELECT USING (true);

-- Allow users to insert their own tasks
CREATE POLICY tasks_insert_policy ON tasks
  FOR INSERT WITH CHECK (true);

-- Allow users to update their own tasks
CREATE POLICY tasks_update_policy ON tasks
  FOR UPDATE USING (true);

-- Allow users to delete their own tasks
CREATE POLICY tasks_delete_policy ON tasks
  FOR DELETE USING (true);

-- Trigger to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_tasks_updated_at
BEFORE UPDATE ON tasks
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Comments for better documentation
COMMENT ON TABLE tasks IS 'Stores task information for children';
COMMENT ON COLUMN tasks.id IS 'Unique identifier for the task';
COMMENT ON COLUMN tasks.title IS 'Title of the task';
COMMENT ON COLUMN tasks.description IS 'Detailed description or instructions for the task';
COMMENT ON COLUMN tasks.child_id IS 'Reference to the child this task is assigned to';
COMMENT ON COLUMN tasks.subject IS 'Subject or category of the task';
COMMENT ON COLUMN tasks.due_date IS 'When the task is due';
COMMENT ON COLUMN tasks.start_date IS 'When the task should start';
COMMENT ON COLUMN tasks.priority IS 'Priority level: high, medium, or low';
COMMENT ON COLUMN tasks.status IS 'Current status: pending, in-progress, completed, or overdue';
COMMENT ON COLUMN tasks.estimated_time IS 'Estimated time to complete in minutes';
COMMENT ON COLUMN tasks.recurring_type IS 'Whether the task recurs: none, daily, or weekly';
COMMENT ON COLUMN tasks.resource_url IS 'Optional URL to a resource related to the task';
COMMENT ON COLUMN tasks.reward_points IS 'Optional points awarded for completing the task';
