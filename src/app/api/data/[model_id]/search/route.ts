import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest, createErrorResponse, RouteContext } from '@/lib/api/middleware';
import { ModelService } from '@/lib/models/modelService';
import { EmbeddingService } from '@/lib/embeddings/embeddingService';

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

      if (!model.embedding?.enabled) {
        return createErrorResponse('Vector search is not enabled for this model', 400);
      }

      // Get search parameters from request body
      const body = await authReq.json();
      const { query, limit = 10, minSimilarity = 0.7, filter } = body;

      if (!query || typeof query !== 'string') {
        return createErrorResponse('Search query is required and must be a string', 400);
      }

      if (typeof limit !== 'number' || limit < 1) {
        return createErrorResponse('Limit must be a positive number', 400);
      }

      if (typeof minSimilarity !== 'number' || minSimilarity < 0 || minSimilarity > 1) {
        return createErrorResponse('minSimilarity must be a number between 0 and 1', 400);
      }

      if (filter && typeof filter !== 'object') {
        return createErrorResponse('Filter must be an object', 400);
      }

      // Initialize embedding service
      const embeddingService = new EmbeddingService(model);

      // Perform vector similarity search
      const results = await embeddingService.searchSimilar(query, limit, minSimilarity);

      // Remove vector data from results
      const resultsWithoutVectors = results.map(({ _vector, ...rest }) => rest);

      return NextResponse.json({
        success: true,
        data: resultsWithoutVectors,
        meta: {
          query,
          total: results.length,
          limit,
          minSimilarity
        }
      });
    } catch (error: any) {
      console.error('Search error:', error);
      if (error.message.includes('OpenAI')) {
        return createErrorResponse('Error generating embeddings for search query', 500);
      }
      return createErrorResponse(error.message || 'Search failed', error.status || 500);
    }
  }, { params });
} 