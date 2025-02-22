-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS vector;

-- Create model data table
CREATE TABLE IF NOT EXISTS model_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id UUID NOT NULL REFERENCES model_definitions(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES users(id),
  data JSONB NOT NULL DEFAULT '{}',
  embedding vector(1536),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS model_data_model_id_idx ON model_data(model_id);
CREATE INDEX IF NOT EXISTS model_data_owner_id_idx ON model_data(owner_id);
CREATE INDEX IF NOT EXISTS model_data_created_at_idx ON model_data(created_at);

-- Create GiST index for vector similarity search
-- Note: This might give a warning if there's not enough data, which is normal
CREATE INDEX IF NOT EXISTS model_data_embedding_idx ON model_data USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Create GIN index for JSONB queries
CREATE INDEX IF NOT EXISTS model_data_jsonb_idx ON model_data USING GIN (data);

-- Create updated_at trigger
CREATE TRIGGER update_model_data_updated_at
    BEFORE UPDATE ON model_data
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE IF NOT EXISTS model_definitions (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  fields JSONB NOT NULL,
  owner_id UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION create_model_table(model_id TEXT, table_name TEXT) RETURNS VOID AS $$
BEGIN
  EXECUTE format('
    CREATE TABLE IF NOT EXISTS %I (
      id UUID PRIMARY KEY,
      data JSONB NOT NULL,
      embedding VECTOR(1536),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )', table_name);
END;
$$ LANGUAGE plpgsql; 