import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest, createErrorResponse } from '@/lib/api/middleware';
import { z } from 'zod';
import { PostgresApiKeyService } from '@/lib/db/postgres/apiKeyService';

// Schema for API key creation
const CreateApiKeySchema = z.object({
  name: z.string().min(1).max(100),
});

const apiKeyService = new PostgresApiKeyService();

export async function POST(req: NextRequest) {
  return withAuth(req, async (authReq) => {
    try {
      const body = await authReq.json();
      const validatedData = CreateApiKeySchema.parse(body);
      const userId = authReq.auth.payload.user_id;

      const apiKey = await apiKeyService.createApiKey(userId, validatedData.name);

      return NextResponse.json({
        success: true,
        key: apiKey.key,
        api_key: {
          id: apiKey.id,
          name: apiKey.name,
          created_at: apiKey.created_at,
          last_used: apiKey.last_used_at,
          prefix: apiKey.key.substring(0, 8)
        }
      });
    } catch (error) {
      console.error('Failed to create API key:', error);
      if (error instanceof z.ZodError) {
        return createErrorResponse({
          field: error.errors[0].path[0] as string,
          message: error.errors[0].message
        }, 400);
      }
      return createErrorResponse('Failed to create API key', 500);
    }
  }, { params: {} });
}

export async function GET(req: NextRequest) {
  return withAuth(req, async (authReq) => {
    try {
      const userId = authReq.auth.payload.user_id;
      const apiKeys = await apiKeyService.listUserApiKeys(userId);

      // Transform to match client's expected format
      const formattedKeys = apiKeys.map(key => ({
        id: key.id,
        name: key.name,
        created_at: key.created_at,
        last_used: key.last_used_at,
        prefix: key.key_hash.substring(0, 8) // Using first 8 chars of hash as prefix
      }));

      return NextResponse.json({
        success: true,
        api_keys: formattedKeys
      });
    } catch (error) {
      console.error('Failed to list API keys:', error);
      return createErrorResponse('Failed to list API keys', 500);
    }
  }, { params: {} });
} 