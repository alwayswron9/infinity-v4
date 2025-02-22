-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create function to create model data tables
CREATE OR REPLACE FUNCTION create_model_table(model_id UUID, table_name TEXT)
RETURNS void AS $$
BEGIN
    -- Create the table
    EXECUTE format('
        CREATE TABLE IF NOT EXISTS %I (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            data JSONB NOT NULL DEFAULT ''{}'',
            embedding vector(1536),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )', table_name);

    -- Create indexes
    EXECUTE format('
        CREATE INDEX IF NOT EXISTS %I ON %I USING GIN (data)',
        table_name || '_data_idx',
        table_name
    );

    -- Create vector similarity index
    -- Note: This might give a warning if there's not enough data, which is normal
    EXECUTE format('
        CREATE INDEX IF NOT EXISTS %I ON %I 
        USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100)',
        table_name || '_embedding_idx',
        table_name
    );

    -- Create updated_at trigger
    EXECUTE format('
        CREATE TRIGGER %I
        BEFORE UPDATE ON %I
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column()',
        'update_' || table_name || '_updated_at',
        table_name
    );
END;
$$ LANGUAGE plpgsql; 