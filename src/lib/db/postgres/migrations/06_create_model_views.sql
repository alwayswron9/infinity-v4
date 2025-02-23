-- Debug: Show current database and schema context
DO $$
BEGIN
  RAISE NOTICE 'Current database: %', current_database();
  RAISE NOTICE 'Current user: %', current_user;
  RAISE NOTICE 'Current schema: %', current_schema;
  RAISE NOTICE 'Search path: %', current_setting('search_path');
END $$;

-- First clean up any existing failed transactions
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM pg_stat_activity WHERE state = 'idle in transaction') THEN
    RAISE NOTICE 'Found idle transactions, attempting to clean up';
    ROLLBACK;
  END IF;
END $$;

-- Debug: Check all schemas and find model_definitions table with more detail
DO $$ 
DECLARE
  schema_name text;
  found_table_schema text;
  found_table_name text;
  column_info RECORD;
  table_count INTEGER;
BEGIN
  -- Count total tables in database
  SELECT COUNT(*) INTO table_count 
  FROM information_schema.tables 
  WHERE tables.table_schema NOT IN ('pg_catalog', 'information_schema');
  RAISE NOTICE 'Total tables in database: %', table_count;

  -- List all schemas and their tables
  RAISE NOTICE 'Listing all schemas and tables:';
  FOR schema_name IN 
    SELECT nspname 
    FROM pg_catalog.pg_namespace 
    WHERE nspname NOT LIKE 'pg_%' 
    AND nspname != 'information_schema'
    ORDER BY nspname
  LOOP
    RAISE NOTICE 'Schema: %', schema_name;
    FOR found_table_name IN 
      SELECT tablename 
      FROM pg_catalog.pg_tables 
      WHERE schemaname = schema_name
      ORDER BY tablename
    LOOP
      RAISE NOTICE '  Table: %', found_table_name;
    END LOOP;
  END LOOP;

  -- Try to find model_definitions specifically
  SELECT schemaname, tablename INTO found_table_schema, found_table_name
  FROM pg_catalog.pg_tables
  WHERE tablename = 'model_definitions';

  IF found_table_schema IS NULL THEN
    RAISE EXCEPTION 'model_definitions table not found. Please check database connection and permissions.';
  END IF;

  RAISE NOTICE 'Found model_definitions in schema: %', found_table_schema;

  -- Show table structure
  RAISE NOTICE 'Structure of model_definitions:';
  FOR column_info IN 
    SELECT column_name, data_type, is_nullable, column_default
    FROM information_schema.columns
    WHERE columns.table_schema = found_table_schema 
    AND columns.table_name = 'model_definitions'
    ORDER BY ordinal_position
  LOOP
    RAISE NOTICE 'Column: %, Type: %, Nullable: %, Default: %', 
      column_info.column_name, 
      column_info.data_type, 
      column_info.is_nullable,
      column_info.column_default;
  END LOOP;

  -- Set the search path to include the correct schema
  EXECUTE 'SET search_path TO ' || quote_ident(found_table_schema) || ', public';
  RAISE NOTICE 'Set search_path to: %, public', found_table_schema;
END $$;

-- Debug: Check if users table exists (check in all schemas)
DO $$ 
DECLARE
  users_schema text;
BEGIN
  SELECT n.nspname INTO users_schema
  FROM pg_catalog.pg_class c
  JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
  WHERE c.relname = 'users'
  AND c.relkind = 'r';

  IF users_schema IS NULL THEN
    RAISE EXCEPTION 'users table not found in any schema';
  END IF;

  RAISE NOTICE 'Found users table in schema: %', users_schema;
END $$;

BEGIN;

-- Create model_views table if it doesn't exist
CREATE TABLE IF NOT EXISTS model_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id UUID NOT NULL REFERENCES model_definitions(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  config JSONB NOT NULL,
  is_default BOOLEAN DEFAULT false,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(model_id, owner_id, name)
);

-- Create indexes if they don't exist
DO $$ 
BEGIN
  CREATE INDEX IF NOT EXISTS model_views_model_id_idx ON model_views(model_id);
  CREATE INDEX IF NOT EXISTS model_views_owner_id_idx ON model_views(owner_id);
  CREATE INDEX IF NOT EXISTS model_views_is_public_idx ON model_views(is_public) WHERE is_public = true;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Failed to create indexes: %', SQLERRM;
END $$;

-- Debug: Check if there are any existing model definitions and show a sample
DO $$
DECLARE
  model_count INTEGER;
  sample_record RECORD;
BEGIN
  SELECT COUNT(*) INTO model_count FROM model_definitions;
  RAISE NOTICE 'Found % model definitions', model_count;
  
  -- Show a sample record if any exist
  IF model_count > 0 THEN
    SELECT * INTO sample_record FROM model_definitions LIMIT 1;
    RAISE NOTICE 'Sample record - ID: %, Owner: %, Name: %', 
      sample_record.id, 
      sample_record.owner_id,
      sample_record.name;
  END IF;
END $$;

-- Create default views for existing models, but only if they don't already exist
DO $$ 
DECLARE
  inserted_count INTEGER;
BEGIN
  WITH inserted AS (
    INSERT INTO model_views (
      SELECT 
        gen_random_uuid(),
        md.id as model_id,
        md.owner_id,
        'Default View' as name,
        'Auto-generated default view' as description,
        jsonb_build_object(
          'columns', (
            SELECT jsonb_agg(
              jsonb_build_object(
                'field', key,
                'visible', true,
                'sortable', true,
                'filterable', true
              )
            )
            FROM jsonb_each(md.fields)
          ),
          'sorting', '[]'::jsonb,
          'filters', '[]'::jsonb,
          'layout', jsonb_build_object(
            'density', 'normal',
            'theme', 'system',
            'showGridLines', true,
            'enableVirtualization', true,
            'pageSize', 25,
            'enableColumnResize', true,
            'enableColumnReorder', true,
            'enableRowSelection', false
          )
        ) as config,
        true as is_default,
        false as is_public,
        CURRENT_TIMESTAMP as created_at,
        CURRENT_TIMESTAMP as updated_at
      FROM model_definitions md
      WHERE NOT EXISTS (
        SELECT 1 
        FROM model_views mv 
        WHERE mv.model_id = md.id 
        AND mv.is_default = true
      )
    ) RETURNING id
  )
  SELECT COUNT(*) INTO inserted_count FROM inserted;
  
  RAISE NOTICE 'Successfully inserted % default views', inserted_count;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error creating default views: %', SQLERRM;
    RAISE NOTICE 'Error detail: %', SQLSTATE;
    RAISE NOTICE 'Error context: %', SQLERRM;
END $$;

COMMIT; 