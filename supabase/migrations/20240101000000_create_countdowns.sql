-- Create countdowns table
CREATE TABLE countdowns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL DEFAULT 'Default Countdown',
  start_value DECIMAL(20,10) NOT NULL,
  rate_per_second DECIMAL(20,10) NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_running BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_countdowns_created_at ON countdowns(created_at);

-- Enable Row Level Security
ALTER TABLE countdowns ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (public countdown)
CREATE POLICY "Allow all operations on countdowns" ON countdowns
  FOR ALL USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_countdowns_updated_at
  BEFORE UPDATE ON countdowns
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column(); 