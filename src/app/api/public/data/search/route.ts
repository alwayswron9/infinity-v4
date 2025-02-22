import { NextRequest, NextResponse } from 'next/server';
import { withPublicApiKey, PublicApiRequest, createErrorResponse } from '@/lib/api/publicMiddleware';
import { ModelService } from '@/lib/models/modelService';
import { PostgresDataService } from '@/lib/data/postgresDataService';

const modelService = new ModelService();

export async function POST(request: NextRequest): Promise<Response> {
  return withPublicApiKey(request, async (authReq) => {
    try {
      const { searchParams } = new URL(request.url);
      const modelName = searchParams.get('model');

      if (!modelName) {
        return createErrorResponse('Model name is required', 400);
      }

      // Get model definition by name
      const model = await modelService.getModelDefinitionByName(modelName, authReq.apiKey.user_id);

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
  }, { params: {} });
} 