import { NextResponse } from 'next/server';
import { withApiKey } from '@/lib/api/middleware';
import { ModelService } from '@/lib/models/modelService';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  return withApiKey(request, async (req) => {
    try {
      const { id } = params;
      const { user_id } = req.apiKey;

      const modelService = new ModelService();
      await modelService.restoreModel(id, user_id);

      return NextResponse.json({ success: true });
    } catch (error: any) {
      return NextResponse.json(
        { error: error.message || 'Failed to restore model' },
        { status: error.status || 500 }
      );
    }
  });
} 