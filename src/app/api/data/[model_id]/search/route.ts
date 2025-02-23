import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest, createErrorResponse, RouteContext } from '@/lib/api/middleware';
import { ModelService } from '@/lib/models/modelService';
import { PostgresDataService } from '@/lib/data/postgresDataService';

type SearchRouteContext = {
  params: Promise<{ model_id: string }>;
};

const modelService = new ModelService();

export async function POST(
  request: NextRequest,
  context: SearchRouteContext
): Promise<Response> {
  const params = await context.params;
  return withAuth(request, async (authReq) => {
    try {
      const userId = authReq.auth.payload.user_id;
      const { model_id } = params;

      // Verify model ownership and get model definition
      const model = await modelService.validateCrudOperation(model_id, userId);

      // Initialize data service
      const dataService = new PostgresDataService(model);

      // Get search parameters from request body
      const body = await authReq.json();
      const { query, limit = 10, minSimilarity = 0.7 } = body;

      if (!query || typeof query !== 'string') {
        return createErrorResponse('Search query is required', 400);
      }

      // Perform vector similarity search
      const results = await dataService.searchSimilar(query, limit, minSimilarity);

      return NextResponse.json({
        success: true,
        data: results
      });
    } catch (error: any) {
      console.error('Search error:', error);
      return createErrorResponse(error.message || 'Search failed', error.status || 500);
    }
  }, { params });
} 