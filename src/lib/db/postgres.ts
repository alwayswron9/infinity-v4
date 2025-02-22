import { Pool } from 'pg';
import { Client } from 'pg';

if (!process.env.POSTGRES_URL) {
  throw new Error('POSTGRES_URL is not set in environment variables');
}

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
});

let initialized = false;

/**
 * Initialize the database with required extensions and schemas
 */
export async function initializeDatabase() {
  if (initialized) return;

  const client = new Client({
    connectionString: process.env.POSTGRES_URL,
  });

  try {
    await client.connect();
    
    // Enable pgvector extension
    await client.query('CREATE EXTENSION IF NOT EXISTS vector;');
    
    initialized = true;
    console.log('PostgreSQL database initialized with pgvector');
  } catch (error) {
    console.error('Failed to initialize PostgreSQL database:', error);
    throw error;
  } finally {
    await client.end();
  }
}

/**
 * Get a connection from the pool
 */
export async function getConnection() {
  if (!initialized) {
    await initializeDatabase();
  }
  return pool.connect();
}

/**
 * Execute a query with parameters
 */
export async function executeQuery(text: string, params?: any[]) {
  const client = await pool.connect();
  try {
    return await client.query(text, params);
  } finally {
    client.release();
  }
}

/**
 * Create a new model table for storing records with vector embeddings
 */
export async function createModelTable(modelId: string) {
  const tableName = `data_${modelId}`;
  
  try {
    await executeQuery(`
      SELECT create_model_table($1, $2)
    `, [modelId, tableName]);
    
    console.log(`Created model table: ${tableName}`);
  } catch (error) {
    console.error(`Failed to create model table ${tableName}:`, error);
    throw error;
  }
}

/**
 * Perform a vector similarity search
 */
export async function vectorSimilaritySearch(
  tableName: string,
  embedding: number[],
  limit: number = 10,
  minSimilarity: number = 0.7,
  filter: Record<string, any> = {}
) {
  // Convert filter object to WHERE clause
  const filterConditions = Object.entries(filter)
    .map(([key, value]) => `data->>'${key}' = $${key}`)
    .join(' AND ');

  const whereClause = filterConditions ? `WHERE ${filterConditions}` : '';
  
  const queryText = `
    SELECT *,
           1 - (embedding <=> $1) as similarity
    FROM ${tableName}
    ${whereClause}
    WHERE 1 - (embedding <=> $1) >= $2
    ORDER BY similarity DESC
    LIMIT $3
  `;

  const values = [embedding, minSimilarity, limit, ...Object.values(filter)];
  
  try {
    const result = await executeQuery(queryText, values);
    return result.rows;
  } catch (error) {
    console.error('Vector similarity search failed:', error);
    throw error;
  }
}

/**
 * Close all database connections
 */
export async function closeDatabase() {
  try {
    await pool.end();
    console.log('Closed all PostgreSQL connections');
  } catch (error) {
    console.error('Failed to close PostgreSQL connections:', error);
    throw error;
  }
} 