import { NextResponse } from 'next/server';
import { PostgresUserService } from '@/lib/db/postgres/userService';
import { PostgresApiKeyService } from '@/lib/db/postgres/apiKeyService';
import { validateApiKeyFormat, hashApiKey } from '@/lib/auth/apikey';

export async function GET() {
  try {
    const testResults: Record<string, any> = {};
    const userService = new PostgresUserService();
    const apiKeyService = new PostgresApiKeyService();

    // 1. Create test user
    const testUser = {
      username: 'testuser_' + Date.now(),
      email: `test${Date.now()}@example.com`,
      password: 'testpassword123',
      name: 'Test User'
    };

    const user = await userService.createUser(testUser);
    testResults.user = {
      id: user.id,
      username: user.username
    };

    // 2. Create API key
    const apiKey = await apiKeyService.createApiKey(user.id, 'Test API Key');
    testResults.apiKeyCreation = {
      success: true,
      id: apiKey.id,
      name: apiKey.name,
      format: validateApiKeyFormat(apiKey.key)
    };

    // 3. List API keys
    const userKeys = await apiKeyService.listUserApiKeys(user.id);
    testResults.listKeys = {
      success: userKeys.length === 1,
      count: userKeys.length,
      firstKey: {
        id: userKeys[0].id,
        name: userKeys[0].name,
        status: userKeys[0].status
      }
    };

    // 4. Find by hash
    const keyHash = hashApiKey(apiKey.key);
    const foundKey = await apiKeyService.findByKeyHash(keyHash);
    testResults.findByHash = {
      success: foundKey !== null,
      matches: foundKey?.id === apiKey.id
    };

    // 5. Update status
    await apiKeyService.updateStatus(apiKey.id, user.id, 'inactive');
    const inactiveKey = await apiKeyService.findByKeyHash(keyHash);
    testResults.statusUpdate = {
      success: inactiveKey?.status === 'inactive'
    };

    // 6. Update last used
    await apiKeyService.updateLastUsed(apiKey.id);
    const updatedKey = await apiKeyService.findByKeyHash(keyHash);
    testResults.lastUsedUpdate = {
      success: updatedKey?.last_used_at !== null
    };

    // 7. Delete API key
    await apiKeyService.deleteApiKey(apiKey.id, user.id);
    const deletedKey = await apiKeyService.findByKeyHash(keyHash);
    testResults.deletion = {
      success: deletedKey === null
    };

    // 8. Test duplicate prevention
    try {
      await apiKeyService.createApiKey(user.id, 'Test API Key');
      await apiKeyService.createApiKey(user.id, 'Test API Key');
      testResults.duplicateNames = {
        success: true,
        message: 'Multiple keys with same name allowed'
      };
    } catch (error) {
      testResults.duplicateNames = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }

    // 9. Clean up
    await userService.deleteUser(user.id);
    testResults.cleanup = {
      success: true
    };

    return NextResponse.json({
      success: true,
      message: 'PostgreSQL API key service tests completed successfully',
      results: testResults
    });

  } catch (error: any) {
    console.error('PostgreSQL API key service test failed:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
} 