import { NextRequest, NextResponse } from 'next/server';
import { withPublicApiKey, PublicApiRequest } from '@/lib/api/publicMiddleware';
import { ModelService } from '@/lib/models/modelService';
import { EmbeddingService } from '@/lib/embeddings/embeddingService';

const modelService = new ModelService();

type SearchContext = {
  params: Promise<{ model_name: string }>;
};

export async function POST(
  req: NextRequest,
  context: SearchContext
): Promise<Response> {
  const params = await context.params;
  return withPublicApiKey(req, async (req) => {
    try {
      const { model_name } = params;
      const { user_id } = req.apiKey;

      // 1. Model Access Check
      let model;
      try {
        model = await modelService.getModelDefinitionByName(model_name, user_id);
      } catch (error: any) {
        console.error('Error fetching model:', error);
        return NextResponse.json(
          { error: 'Model not found' },
          { status: 404 }
        );
      }

      if (!model.embedding?.enabled) {
        return NextResponse.json(
          { error: 'Vector search is not enabled for this model' },
          { status: 400 }
        );
      }

      // 2. Request Body Parsing
      let body;
      try {
        body = await req.json();
      } catch (error: any) {
        console.error('Error parsing request body:', error);
        return NextResponse.json(
          { 
            error: 'Invalid JSON in request body',
            details: error.message
          },
          { status: 400 }
        );
      }

      // 3. Parameter Validation
      const { 
        query, 
        limit = 10, 
        minSimilarity = 0,
        filter
      } = body;

      if (!query || typeof query !== 'string') {
        return NextResponse.json(
          { error: 'Search query is required and must be a string' },
          { status: 400 }
        );
      }

      if (typeof limit !== 'number' || limit < 1) {
        return NextResponse.json(
          { error: 'Limit must be a positive number' },
          { status: 400 }
        );
      }

      if (typeof minSimilarity !== 'number' || minSimilarity < 0 || minSimilarity > 1) {
        return NextResponse.json(
          { error: 'minSimilarity must be a number between 0 and 1' },
          { status: 400 }
        );
      }

      if (filter && typeof filter !== 'object') {
        return NextResponse.json(
          { error: 'Filter must be an object' },
          { status: 400 }
        );
      }

      // 4. Search Execution
      const embeddingService = new EmbeddingService(model);
      let results;
      try {
        results = await embeddingService.searchSimilar(
          query, 
          limit, 
          minSimilarity,
          filter
        );
      } catch (error: any) {
        console.error('Error performing search:', error);
        if (error.message.includes('OpenAI')) {
          return NextResponse.json(
            { error: 'Error generating embeddings for search query' },
            { status: 500 }
          );
        }
        return NextResponse.json(
          { error: 'Error performing search operation' },
          { status: 500 }
        );
      }

      // 5. Debug Logging
      console.log('Search query:', query);
      console.log('Total records processed:', results.length);
      console.log('Filter applied:', filter);
      console.log('Min similarity threshold:', minSimilarity);
      console.log('Found results:', results.length);

      // 6. Response Formatting
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
      // 7. Fallback Error Handler
      console.error('Unhandled error in vector search:', error);
      return NextResponse.json(
        { 
          error: 'An unexpected error occurred',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined
        },
        { status: 500 }
      );
    }
  }, { params });
} 