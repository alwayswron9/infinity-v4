BEGIN;

-- Add status column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'model_definitions'
        AND column_name = 'status'
    ) THEN
        ALTER TABLE model_definitions
        ADD COLUMN status VARCHAR(20) DEFAULT 'active';
    END IF;
END
$$;

-- Update existing records to have 'active' status
UPDATE model_definitions
SET status = 'active'
WHERE status IS NULL;

-- Make status NOT NULL
ALTER TABLE model_definitions
ALTER COLUMN status SET NOT NULL;

-- Add index on status
CREATE INDEX IF NOT EXISTS model_definitions_status_idx ON model_definitions(status);

COMMIT; 