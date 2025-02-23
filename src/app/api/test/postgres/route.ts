import { NextResponse } from 'next/server';
import { initializeDatabase, executeQuery } from '@/lib/db/postgres';

export async function GET() {
  try {
    // Initialize database and extensions
    await initializeDatabase();
    
    // Test query to verify connection
    const result = await executeQuery('SELECT version();');
    
    // Test creating a temporary table with vector
    await executeQuery(`
      CREATE TEMP TABLE IF NOT EXISTS test_vectors (
        id SERIAL PRIMARY KEY,
        embedding vector(3)
      );
    `);
    
    // Insert a test vector
    await executeQuery(`
      INSERT INTO test_vectors (embedding)
      VALUES ('[1,2,3]'::vector);
    `);
    
    // Test vector operations
    const vectorResult = await executeQuery(`
      SELECT embedding,
             '[4,5,6]'::vector <=> embedding as distance
      FROM test_vectors
      LIMIT 1;
    `);

    return NextResponse.json({
      success: true,
      message: 'PostgreSQL connection successful',
      version: result.rows[0].version,
      vectorTest: {
        embedding: vectorResult.rows[0].embedding,
        distance: vectorResult.rows[0].distance
      }
    });
  } catch (error: any) {
    console.error('PostgreSQL test failed:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
} 