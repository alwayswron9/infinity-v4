import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db/postgres';
import { v4 as uuidv4 } from 'uuid';
import { hashPassword } from '@/lib/auth/password';

export async function GET() {
  try {
    const testResults: Record<string, any> = {};

    // 1. Test User Operations
    const userId = uuidv4();
    const testUser = {
      id: userId,
      username: 'testuser_' + Date.now(),
      email: `test${Date.now()}@example.com`,
      name: 'Test User',
      status: 'active',
      password_hash: await hashPassword('testpassword123')
    };

    // Create User
    await executeQuery(`
      INSERT INTO users (id, username, email, name, status, password_hash)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [testUser.id, testUser.username, testUser.email, testUser.name, testUser.status, testUser.password_hash]);

    // Fetch User
    const userResult = await executeQuery('SELECT * FROM users WHERE id = $1', [userId]);
    testResults.user = {
      created: userResult.rows[0] !== undefined,
      user: userResult.rows[0]
    };

    // 2. Test API Key Operations
    const apiKeyId = uuidv4();
    const testApiKey = {
      id: apiKeyId,
      key_hash: 'test_key_hash_' + Date.now(),
      user_id: userId,
      status: 'active'
    };

    // Create API Key
    await executeQuery(`
      INSERT INTO api_keys (id, key_hash, user_id, status)
      VALUES ($1, $2, $3, $4)
    `, [testApiKey.id, testApiKey.key_hash, testApiKey.user_id, testApiKey.status]);

    // Fetch API Key
    const apiKeyResult = await executeQuery('SELECT * FROM api_keys WHERE id = $1', [apiKeyId]);
    testResults.apiKey = {
      created: apiKeyResult.rows[0] !== undefined,
      apiKey: apiKeyResult.rows[0]
    };

    // 3. Test Model Definition Operations
    const modelId = uuidv4();
    const testModel = {
      id: modelId,
      owner_id: userId,
      name: 'test_model_' + Date.now(),
      description: 'Test model description',
      fields: {
        title: {
          type: 'string',
          required: true
        }
      },
      embedding: {
        enabled: true,
        source_fields: ['title']
      }
    };

    // Create Model Definition
    await executeQuery(`
      INSERT INTO model_definitions (id, owner_id, name, description, fields, embedding)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [
      testModel.id,
      testModel.owner_id,
      testModel.name,
      testModel.description,
      JSON.stringify(testModel.fields),
      JSON.stringify(testModel.embedding)
    ]);

    // Fetch Model Definition
    const modelResult = await executeQuery('SELECT * FROM model_definitions WHERE id = $1', [modelId]);
    testResults.modelDefinition = {
      created: modelResult.rows[0] !== undefined,
      model: modelResult.rows[0]
    };

    // 4. Clean up test data
    await executeQuery('DELETE FROM model_definitions WHERE id = $1', [modelId]);
    await executeQuery('DELETE FROM api_keys WHERE id = $1', [apiKeyId]);
    await executeQuery('DELETE FROM users WHERE id = $1', [userId]);

    // Return test results
    return NextResponse.json({
      success: true,
      message: 'PostgreSQL CRUD tests completed successfully',
      results: testResults
    });

  } catch (error: any) {
    console.error('PostgreSQL CRUD test failed:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
} 