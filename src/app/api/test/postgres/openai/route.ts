import { NextResponse } from 'next/server';
import { PostgresVectorService } from '@/lib/db/postgres/vectorService';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
  try {
    const testResults: Record<string, any> = {};
    const modelId = uuidv4();

    // Create test model definition
    const testModel = {
      id: modelId,
      owner_id: uuidv4(),
      name: 'test_model',
      fields: {},
      embedding: {
        enabled: true,
        source_fields: ['title', 'description']
      }
    };

    // Initialize vector service
    const vectorService = new PostgresVectorService(modelId);
    await vectorService.initializeTable(testModel as any);
    testResults.tableInitialized = true;

    // Create test records
    const testRecords = [
      {
        title: 'Introduction to Neural Networks',
        description: 'Learn about artificial neural networks, deep learning, and their applications in modern AI systems.'
      },
      {
        title: 'Natural Language Processing Basics',
        description: 'Understanding NLP fundamentals, text processing, tokenization, and semantic analysis.'
      },
      {
        title: 'Computer Vision Applications',
        description: 'Exploring image recognition, object detection, and visual understanding in AI.'
      }
    ];

    // Insert records with embeddings
    const recordIds = await Promise.all(
      testRecords.map(record => 
        vectorService.createRecord(record, ['title', 'description'])
      )
    );
    testResults.recordsCreated = recordIds;

    // Test semantic search
    const searchQueries = [
      'How do neural networks work?',
      'Text processing and language understanding',
      'Image recognition systems'
    ];

    const searchResults = await Promise.all(
      searchQueries.map(query =>
        vectorService.searchSimilar(query, 2, 0.5)
      )
    );

    testResults.searches = searchQueries.map((query, i) => ({
      query,
      results: searchResults[i]
    }));

    // Clean up
    await vectorService.dropTable();
    testResults.tableCleaned = true;

    return NextResponse.json({
      success: true,
      message: 'PostgreSQL vector service test with OpenAI embeddings completed successfully',
      results: testResults
    });

  } catch (error: any) {
    console.error('PostgreSQL vector service test failed:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
} 