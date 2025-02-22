import { NextRequest, NextResponse } from 'next/server';
import { withAuth, createErrorResponse } from '@/lib/api/middleware';
import { ModelService } from '@/lib/models/modelService';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAuth(request, async (req) => {
    try {
      const { id } = await params;
      const { user_id } = req.auth.payload;

      const modelService = new ModelService();
      await modelService.archiveModel(id, user_id);

      return NextResponse.json({ success: true });
    } catch (error: any) {
      return createErrorResponse(
        error.message || 'Failed to archive model',
        error.status || 500
      );
    }
  }, { params });
} 