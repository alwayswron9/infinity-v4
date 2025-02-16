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

async function handler(
  req: AuthenticatedRequest,
  context: { params: { model_id: string } }
) {
  if (req.method !== 'POST') {
    return createErrorResponse('Method not allowed', 405);
  }

  try {
    const userId = 'sub' in req.auth.payload ? req.auth.payload.sub : req.auth.payload.user_id;
    const { model_id } = context.params;

    // Verify model ownership
    const model = await verifyModelOwnership(model_id, userId);

    // Check if embeddings are enabled
    if (!model.embedding?.enabled) {
      return createErrorResponse('Vector search is not enabled for this model', 400);
    }

    // Get search parameters
    const body = await req.json();
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

    return NextResponse.json({
      success: true,
      data: results
    });
  } catch (error: any) {
    console.error('Error performing vector search:', error);
    return createErrorResponse(error.message || 'Failed to perform vector search', error.status || 500);
  }
}

export async function POST(
  req: NextRequest,
  context: { params: { model_id: string } }
) {
  return withAuth(req, async (authReq) => {
    if (authReq.method !== 'POST') {
      return createErrorResponse('Method not allowed', 405);
    }

    try {
      const userId = 'sub' in authReq.auth.payload ? authReq.auth.payload.sub : authReq.auth.payload.user_id;
      const { model_id } = context.params;

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

      return NextResponse.json({
        success: true,
        data: results
      });
    } catch (error: any) {
      console.error('Error performing vector search:', error);
      return createErrorResponse(error.message || 'Failed to perform vector search', error.status || 500);
    }
  }, context);
} 