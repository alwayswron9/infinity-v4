import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest, createErrorResponse } from '@/lib/api/middleware';
import { ModelService } from '@/lib/models/modelService';
import { EmbeddingService } from '@/lib/embeddings/embeddingService';

const modelService = new ModelService();

async function verifyModelOwnership(modelId: string, userId: string) {
  const model = await modelService.getModelDefinition(modelId);
  if (model.owner_id !== userId) {
    throw new Error('Unauthorized - You do not own this model');
  }
  return model;
}

type SearchContext = {
  params: Promise<{ model_id: string }>;
};

export async function POST(
  req: NextRequest,
  context: SearchContext
): Promise<Response> {
  const params = await context.params;
  return withAuth(req, async (authReq) => {
    try {
      const userId = 'sub' in authReq.auth.payload ? authReq.auth.payload.sub : authReq.auth.payload.user_id;
      const { model_id } = params;

      // Verify model ownership
      const model = await verifyModelOwnership(model_id, userId);

      // Check if embeddings are enabled
      if (!model.embedding?.enabled) {
        return createErrorResponse('Vector search is not enabled for this model', 400);
      }

      // Get search parameters
      const body = await authReq.json();
      const { 
        query, 
        limit = 10, 
        minSimilarity = 0,
        filter
      } = body;

      if (!query || typeof query !== 'string') {
        return createErrorResponse('Search query is required', 400);
      }

      // Validate filter if provided
      if (filter && typeof filter !== 'object') {
        return createErrorResponse('Filter must be an object', 400);
      }

      // Initialize embedding service
      const embeddingService = new EmbeddingService(model);

      // Perform search with optional filter
      const results = await embeddingService.searchSimilar(
        query, 
        limit, 
        minSimilarity,
        filter
      );

      // Remove vector data from results
      const resultsWithoutVectors = results.map(({ _vector, ...rest }) => ({
        ...rest,
      }));

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
      console.error('Error performing vector search:', error);
      return createErrorResponse(error.message || 'Failed to perform vector search', error.status || 500);
    }
  }, { params });
} 