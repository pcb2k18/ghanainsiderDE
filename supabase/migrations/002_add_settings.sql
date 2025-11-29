-- Create settings table for application configuration
CREATE TABLE IF NOT EXISTS settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(255) UNIQUE NOT NULL,
  value TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on key for fast lookups
CREATE INDEX idx_settings_key ON settings(key);

-- Insert default AI model setting
INSERT INTO settings (key, value, description)
VALUES (
  'ai_model',
  'claude-3-5-haiku-20241022',
  'Claude model to use for AI content formatting. Options: claude-3-5-haiku-20241022 (cheapest), claude-3-5-sonnet-20241022, claude-sonnet-4-20250514, claude-opus-4-20250514 (most capable)'
) ON CONFLICT (key) DO NOTHING;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER settings_updated_at
  BEFORE UPDATE ON settings
  FOR EACH ROW
  EXECUTE FUNCTION update_settings_updated_at();

-- Add RLS policies
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Allow read access to all (settings are not sensitive)
CREATE POLICY "Allow public read access to settings"
  ON settings
  FOR SELECT
  USING (true);

-- Only allow updates (no inserts/deletes to prevent key modification)
CREATE POLICY "Allow updates to settings"
  ON settings
  FOR UPDATE
  USING (true);
