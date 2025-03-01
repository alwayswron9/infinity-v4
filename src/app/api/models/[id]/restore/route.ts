import { NextRequest, NextResponse } from 'next/server';
import { withAuth, createErrorResponse } from '@/lib/api/middleware';
import { ModelService } from '@/lib/models/modelService';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  const resolvedParams = await params;
  return withAuth(request, async (req) => {
    try {
      const { id } = resolvedParams;
      const userId = req.auth.payload.user_id;

      const modelService = new ModelService();
      await modelService.restoreModel(id, userId);

      return NextResponse.json({ success: true });
    } catch (error: any) {
      return createErrorResponse(
        error.message || 'Failed to restore model',
        error.status || 500
      );
    }
  }, { params: resolvedParams });
} 