import { NextRequest, NextResponse } from 'next/server';
import { validateApiKeyFormat, hashApiKey } from '@/lib/auth/apikey';
import { PostgresApiKeyService } from '@/lib/db/postgres/apiKeyService';

export type PublicApiRequest = NextRequest & {
  apiKey: {
    user_id: string;
    key_id: string;
  };
};

export type RouteContext<T extends Record<string, string | string[]> = {}> = {
  params: T;
};

export function createErrorResponse(error: string | { field: string; message: string }, status: number) {
  return NextResponse.json(
    { error: typeof error === 'string' ? { message: error } : error },
    { status }
  );
}

const apiKeyService = new PostgresApiKeyService();

export async function withPublicApiKey<T extends Record<string, string | string[]> = {}>(
  req: NextRequest,
  handler: (
    req: PublicApiRequest,
    context: { params: T }
  ) => Promise<NextResponse>,
  context: { params: T }
): Promise<NextResponse> {
  try {
    // Get API key from header
    const apiKey = req.headers.get('x-api-key');
    
    if (!apiKey) {
      return createErrorResponse('API key is required', 401);
    }

    // Validate API key format
    if (!validateApiKeyFormat(apiKey)) {
      return createErrorResponse('Invalid API key format', 401);
    }

    // Find and validate API key
    const keyHash = hashApiKey(apiKey);
    const apiKeyRecord = await apiKeyService.findByKeyHash(keyHash);

    if (!apiKeyRecord) {
      return createErrorResponse('Invalid API key', 401);
    }

    if (apiKeyRecord.status !== 'active') {
      return createErrorResponse('API key is inactive', 401);
    }

    // Update last used timestamp
    await apiKeyService.updateLastUsed(apiKeyRecord.id);

    // Add API key info to request
    const authenticatedReq = req as PublicApiRequest;
    authenticatedReq.apiKey = {
      user_id: apiKeyRecord.user_id,
      key_id: apiKeyRecord.id,
    };
    
    // Call the handler
    return handler(authenticatedReq, context);
  } catch (error) {
    console.error('API key authentication error:', error);
    return createErrorResponse('Authentication failed', 401);
  }
} 