-- Add status column to model_definitions if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'model_definitions' 
    AND column_name = 'status'
  ) THEN
    ALTER TABLE model_definitions
    ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'active';
  END IF;
END $$;

-- Add status column to model_data if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'model_data' 
    AND column_name = 'status'
  ) THEN
    ALTER TABLE model_data
    ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'active';
  END IF;
END $$;

-- Create indexes for status columns if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_indexes
    WHERE indexname = 'model_definitions_status_idx'
  ) THEN
    CREATE INDEX model_definitions_status_idx ON model_definitions(status);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_indexes
    WHERE indexname = 'model_data_status_idx'
  ) THEN
    CREATE INDEX model_data_status_idx ON model_data(status);
  END IF;
END $$;

-- Update existing records to have 'active' status
UPDATE model_definitions SET status = 'active' WHERE status IS NULL;
UPDATE model_data SET status = 'active' WHERE status IS NULL; 