import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db/postgres';
import { v4 as uuidv4 } from 'uuid';

// Helper to create a random 1536-dimensional vector
function createRandomVector(size: number = 1536): number[] {
  return Array.from({ length: size }, () => Math.random());
}

export async function GET() {
  try {
    const testResults: Record<string, any> = {};
    const testTableName = 'test_vectors_' + Date.now();

    // 1. Create a test table with vector column
    await executeQuery(`
      CREATE TABLE ${testTableName} (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title TEXT NOT NULL,
        description TEXT,
        embedding vector(1536),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    testResults.tableCreated = true;

    // 2. Insert test records with embeddings
    const testRecords = [
      {
        id: uuidv4(),
        title: 'Machine Learning Basics',
        description: 'Introduction to ML concepts',
        embedding: JSON.stringify(createRandomVector())
      },
      {
        id: uuidv4(),
        title: 'Advanced AI Techniques',
        description: 'Deep learning and neural networks',
        embedding: JSON.stringify(createRandomVector())
      },
      {
        id: uuidv4(),
        title: 'Data Science Overview',
        description: 'Basic data science concepts',
        embedding: JSON.stringify(createRandomVector())
      }
    ];

    // Insert records
    for (const record of testRecords) {
      await executeQuery(`
        INSERT INTO ${testTableName} (id, title, description, embedding)
        VALUES ($1, $2, $3, $4::vector)
      `, [record.id, record.title, record.description, record.embedding]);
    }
    testResults.recordsInserted = testRecords.length;

    // 3. Test vector similarity search
    const searchVector = JSON.stringify(createRandomVector());
    const similarityResult = await executeQuery(`
      SELECT 
        id,
        title,
        description,
        1 - (embedding <=> $1::vector) as similarity
      FROM ${testTableName}
      ORDER BY embedding <=> $1::vector
      LIMIT 2
    `, [searchVector]);
    testResults.similaritySearch = similarityResult.rows;

    // 4. Test vector operations
    const operationsResult = await executeQuery(`
      SELECT 
        id,
        title,
        embedding <-> $1::vector as euclidean_distance,
        1 - (embedding <=> $1::vector) as cosine_similarity,
        embedding <#> $1::vector as inner_product
      FROM ${testTableName}
      LIMIT 1
    `, [searchVector]);
    testResults.vectorOperations = operationsResult.rows;

    // 5. Create an IVFFlat index for faster similarity search
    await executeQuery(`
      CREATE INDEX ON ${testTableName} 
      USING ivfflat (embedding vector_cosine_ops)
      WITH (lists = 100);
    `);
    testResults.indexCreated = true;

    // 6. Test search with index
    const indexSearchResult = await executeQuery(`
      SELECT 
        id,
        title,
        description,
        1 - (embedding <=> $1::vector) as similarity
      FROM ${testTableName}
      ORDER BY embedding <=> $1::vector
      LIMIT 2
    `, [searchVector]);
    testResults.indexSearch = indexSearchResult.rows;

    // 7. Clean up
    await executeQuery(`DROP TABLE ${testTableName}`);
    testResults.tableCleaned = true;

    // Return test results
    return NextResponse.json({
      success: true,
      message: 'PostgreSQL vector operations tests completed successfully',
      results: testResults,
      vectorSizes: {
        searchVector: JSON.parse(searchVector).length,
        firstRecordVector: JSON.parse(testRecords[0].embedding).length
      }
    });

  } catch (error: any) {
    console.error('PostgreSQL vector operations test failed:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
} 