import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest, createErrorResponse, RouteContext } from '@/lib/api/middleware';
import { PostgresApiKeyService } from '@/lib/db/postgres/apiKeyService';

const apiKeyService = new PostgresApiKeyService();

export async function DELETE(
  req: NextRequest,
  context: RouteContext<{ id: string }>
) {
  return withAuth(req, async (authReq) => {
    try {
      const userId = authReq.auth.payload.user_id;
      const keyId = context.params.id;

      await apiKeyService.deleteApiKey(keyId, userId);

      return NextResponse.json({
        success: true,
        message: 'API key deleted successfully'
      });
    } catch (error: any) {
      console.error('Failed to delete API key:', error);
      if (error.message === 'API key not found or unauthorized') {
        return createErrorResponse('API key not found or unauthorized', 404);
      }
      return createErrorResponse('Failed to delete API key', 500);
    }
  }, { params: context.params });
} 