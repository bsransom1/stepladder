-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Therapists table
CREATE TABLE therapists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  practice_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Clients table
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  therapist_id UUID NOT NULL REFERENCES therapists(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  email TEXT,
  primary_modality TEXT DEFAULT 'ERP',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Client Magic Links table
CREATE TABLE client_magic_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_used_at TIMESTAMPTZ
);

-- ERP Hierarchy Items table
CREATE TABLE erp_hierarchy_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  therapist_id UUID NOT NULL REFERENCES therapists(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  description TEXT,
  category TEXT,
  baseline_suds INTEGER NOT NULL CHECK (baseline_suds >= 0 AND baseline_suds <= 100),
  order_index INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Assignments table
CREATE TABLE assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  therapist_id UUID NOT NULL REFERENCES therapists(id) ON DELETE CASCADE,
  modality TEXT NOT NULL DEFAULT 'ERP',
  goal TEXT NOT NULL,
  worksheet_type TEXT NOT NULL,
  config JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ERP Exposure Runs table
CREATE TABLE erp_exposure_runs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  assignment_id UUID REFERENCES assignments(id) ON DELETE SET NULL,
  hierarchy_item_id UUID NOT NULL REFERENCES erp_hierarchy_items(id) ON DELETE CASCADE,
  date_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  suds_before INTEGER NOT NULL CHECK (suds_before >= 0 AND suds_before <= 100),
  suds_peak INTEGER NOT NULL CHECK (suds_peak >= 0 AND suds_peak <= 100),
  suds_after INTEGER NOT NULL CHECK (suds_after >= 0 AND suds_after <= 100),
  duration_minutes INTEGER NOT NULL,
  did_ritual BOOLEAN DEFAULT false,
  ritual_description TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_clients_therapist_id ON clients(therapist_id);
CREATE INDEX idx_client_magic_links_token ON client_magic_links(token) WHERE is_active = true;
CREATE INDEX idx_client_magic_links_client_id ON client_magic_links(client_id);
CREATE INDEX idx_erp_hierarchy_items_client_id ON erp_hierarchy_items(client_id);
CREATE INDEX idx_assignments_client_id ON assignments(client_id);
CREATE INDEX idx_assignments_is_active ON assignments(is_active) WHERE is_active = true;
CREATE INDEX idx_erp_exposure_runs_client_id ON erp_exposure_runs(client_id);
CREATE INDEX idx_erp_exposure_runs_date_time ON erp_exposure_runs(date_time);
CREATE INDEX idx_erp_exposure_runs_hierarchy_item_id ON erp_exposure_runs(hierarchy_item_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_therapists_updated_at BEFORE UPDATE ON therapists
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_erp_hierarchy_items_updated_at BEFORE UPDATE ON erp_hierarchy_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assignments_updated_at BEFORE UPDATE ON assignments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

