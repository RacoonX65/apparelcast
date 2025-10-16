-- Create table for user-submitted PEP locations
CREATE TABLE user_submitted_pep_locations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  address TEXT NOT NULL,
  city VARCHAR(100) NOT NULL,
  province VARCHAR(100) NOT NULL,
  postal_code VARCHAR(20),
  phone VARCHAR(50),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  full_address TEXT NOT NULL,
  
  -- User who submitted the location
  submitted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Moderation status
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  moderated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  moderated_at TIMESTAMP WITH TIME ZONE,
  moderation_notes TEXT,
  
  -- Additional metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_user_submitted_pep_locations_status ON user_submitted_pep_locations(status);
CREATE INDEX idx_user_submitted_pep_locations_province ON user_submitted_pep_locations(province);
CREATE INDEX idx_user_submitted_pep_locations_city ON user_submitted_pep_locations(city);
CREATE INDEX idx_user_submitted_pep_locations_submitted_by ON user_submitted_pep_locations(submitted_by);
CREATE INDEX idx_user_submitted_pep_locations_coordinates ON user_submitted_pep_locations(latitude, longitude);

-- Enable RLS (Row Level Security)
ALTER TABLE user_submitted_pep_locations ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Users can view approved locations and their own submissions
CREATE POLICY "Users can view approved locations and own submissions" ON user_submitted_pep_locations
  FOR SELECT USING (
    status = 'approved' OR 
    submitted_by = auth.uid()
  );

-- Users can insert their own submissions
CREATE POLICY "Users can submit locations" ON user_submitted_pep_locations
  FOR INSERT WITH CHECK (submitted_by = auth.uid());

-- Users can update their own pending submissions
CREATE POLICY "Users can update own pending submissions" ON user_submitted_pep_locations
  FOR UPDATE USING (
    submitted_by = auth.uid() AND 
    status = 'pending'
  );

-- Admins can do everything
CREATE POLICY "Admins can manage all locations" ON user_submitted_pep_locations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
  );

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_submitted_pep_locations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_submitted_pep_locations_updated_at
  BEFORE UPDATE ON user_submitted_pep_locations
  FOR EACH ROW
  EXECUTE FUNCTION update_user_submitted_pep_locations_updated_at();