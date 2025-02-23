import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest, createErrorResponse } from '@/lib/api/middleware';
import { ModelService } from '@/lib/models/modelService';
import { PostgresDataService } from '@/lib/data/postgresDataService';

type ClearRouteContext = {
  params: Promise<{ model_id: string }>;
};

export async function POST(
  request: NextRequest,
  context: ClearRouteContext
): Promise<Response> {
  const params = await context.params;
  return withAuth(request, async (authReq) => {
    try {
      const userId = authReq.auth.payload.user_id;
      const { model_id } = params;

      // Verify model ownership and get model definition
      const modelService = new ModelService();
      const model = await modelService.validateCrudOperation(model_id, userId);

      // Initialize data service
      const dataService = new PostgresDataService(model);

      // Clear all data
      await dataService.clearData();

      return NextResponse.json({ success: true, message: 'All data cleared successfully' });
    } catch (error: any) {
      console.error('Error clearing model data:', error);
      return createErrorResponse(error.message || 'Failed to clear model data', error.status || 500);
    }
  }, { params });
} 