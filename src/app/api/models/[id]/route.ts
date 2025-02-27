import { NextRequest, NextResponse } from 'next/server';
import { withAuth, createErrorResponse } from '@/lib/api/middleware';
import { ModelService } from '@/lib/models/modelService';

const modelService = new ModelService();

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  const resolvedParams = await params;
  return withAuth(request, async (req) => {
    try {
      const { id } = resolvedParams;
      const userId = req.auth.payload.sub;

      await modelService.deleteModelDefinition(id, userId);
      return new NextResponse(null, { status: 204 });
    } catch (error: any) {
      console.error('Error deleting model definition:', error);
      return createErrorResponse(
        error.message || 'Failed to delete model definition',
        error.status || 500
      );
    }
  }, { params: resolvedParams });
} 