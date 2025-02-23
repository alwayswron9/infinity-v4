import { NextRequest, NextResponse } from 'next/server';
import { withApiKey, AuthenticatedRequest } from '@/lib/api/middleware';
import { ModelService } from '@/lib/models/modelService';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  const resolvedParams = await params;
  return withApiKey(request, async (req: AuthenticatedRequest) => {
    try {
      const { id } = resolvedParams;
      const userId = req.auth.payload.user_id;

      const modelService = new ModelService();
      await modelService.restoreModel(id, userId);

      return NextResponse.json({ success: true });
    } catch (error: any) {
      return NextResponse.json(
        { error: error.message || 'Failed to restore model' },
        { status: error.status || 500 }
      );
    }
  }, { params: resolvedParams });
} 