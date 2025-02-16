import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest, createErrorResponse } from '@/lib/api/middleware';
import { ModelService } from '@/lib/models/modelService';
import { DataService } from '@/lib/data/dataService';
import { EmbeddingService } from '@/lib/embeddings/embeddingService';

const modelService = new ModelService();

async function verifyModelOwnership(modelId: string, userId: string) {
  const model = await modelService.getModelDefinition(modelId);
  if (model.owner_id !== userId) {
    throw new Error('Unauthorized - You do not own this model');
  }
  return model;
}

export async function GET(
  req: NextRequest,
  context: { params: { model_id: string } }
) {
  return withAuth(req, async (authReq) => {
    try {
      const userId = 'sub' in authReq.auth.payload ? authReq.auth.payload.sub : authReq.auth.payload.user_id;
      const params = await Promise.resolve(context.params);
      const { model_id } = params;

      // Verify model ownership
      const model = await verifyModelOwnership(model_id, userId);

      // Initialize data service with model
      const dataService = new DataService(model);

      // Check if this is a get by ID request
      const { searchParams } = new URL(req.url);
      const id = searchParams.get('id');

      if (id) {
        // Get specific record
        const record = await dataService.getRecord(id);
        return NextResponse.json({ success: true, data: record });
      } else {
        // List/query records
        const filter = searchParams.get('filter') ? JSON.parse(searchParams.get('filter')!) : undefined;
        const include = searchParams.get('include') ? JSON.parse(searchParams.get('include')!) : undefined;
        const page = searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1;
        const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 10;

        const { records, total } = await dataService.listRecords({
          filter,
          include,
          page,
          limit
        });

        return NextResponse.json({
          success: true,
          data: records,
          meta: { page, limit, total }
        });
      }
    } catch (error: any) {
      console.error('Error fetching record(s):', error);
      return createErrorResponse(error.message || 'Failed to fetch record(s)', error.status || 500);
    }
  }, context);
}

export async function POST(
  req: NextRequest,
  context: { params: { model_id: string } }
) {
  return withAuth(req, async (authReq) => {
    try {
      const userId = 'sub' in authReq.auth.payload ? authReq.auth.payload.sub : authReq.auth.payload.user_id;
      const params = await Promise.resolve(context.params);
      const { model_id } = params;

      // Verify model ownership
      const model = await verifyModelOwnership(model_id, userId);

      // Initialize data service with model
      const dataService = new DataService(model);

      // Create record
      const body = await authReq.json();
      
      // Validate nested fields structure
      if (!body.fields || typeof body.fields !== 'object') {
        return createErrorResponse('Request body must contain a fields object', 400);
      }

      const record = await dataService.createRecord(body.fields);

      return NextResponse.json({ success: true, data: record }, { status: 201 });
    } catch (error: any) {
      console.error('Error creating record:', error);
      return createErrorResponse(error.message || 'Failed to create record', error.status || 500);
    }
  }, context);
}

export async function PUT(
  req: NextRequest,
  context: { params: { model_id: string } }
) {
  return withAuth(req, async (authReq) => {
    try {
      const userId = 'sub' in authReq.auth.payload ? authReq.auth.payload.sub : authReq.auth.payload.user_id;
      const params = await Promise.resolve(context.params);
      const { model_id } = params;
      const { searchParams } = new URL(req.url);
      const id = searchParams.get('id');
      
      if (!id) {
        return createErrorResponse('Record ID is required', 400);
      }

      // Verify model ownership
      const model = await verifyModelOwnership(model_id, userId);

      // Initialize data service with model
      const dataService = new DataService(model);

      // Update record
      const body = await authReq.json();

      // Validate nested fields structure
      if (!body.fields || typeof body.fields !== 'object') {
        return createErrorResponse('Request body must contain a fields object', 400);
      }

      const record = await dataService.updateRecord(id, body.fields);

      return NextResponse.json({ success: true, data: record });
    } catch (error: any) {
      console.error('Error updating record:', error);
      return createErrorResponse(error.message || 'Failed to update record', error.status || 500);
    }
  }, context);
}

export async function DELETE(
  req: NextRequest,
  context: { params: { model_id: string } }
) {
  return withAuth(req, async (authReq) => {
    try {
      const userId = 'sub' in authReq.auth.payload ? authReq.auth.payload.sub : authReq.auth.payload.user_id;
      const params = await Promise.resolve(context.params);
      const { model_id } = params;
      const { searchParams } = new URL(req.url);
      const id = searchParams.get('id');
      
      if (!id) {
        return createErrorResponse('Record ID is required', 400);
      }

      // Verify model ownership
      const model = await verifyModelOwnership(model_id, userId);

      // Initialize data service with model
      const dataService = new DataService(model);

      // Delete record
      await dataService.deleteRecord(id);

      return new NextResponse(null, { status: 204 });
    } catch (error: any) {
      console.error('Error deleting record:', error);
      return createErrorResponse(error.message || 'Failed to delete record', error.status || 500);
    }
  }, context);
}

async function handleSearch(
  req: AuthenticatedRequest,
  { params }: { params: { model_id: string } }
) {
  try {
    const userId = 'sub' in req.auth.payload ? req.auth.payload.sub : req.auth.payload.user_id;
    const resolvedParams = await Promise.resolve(params);
    const { model_id } = resolvedParams;

    // Get model definition to validate access
    const model = await modelService.getModelDefinition(model_id);
    if (model.owner_id !== userId) {
      return createErrorResponse('Unauthorized', 403);
    }

    // Check if embeddings are enabled
    if (!model.embedding?.enabled) {
      return createErrorResponse('Vector search is not enabled for this model', 400);
    }

    // Get search parameters
    const body = await req.json();
    const { query, limit = 10, minSimilarity = 0 } = body;

    if (!query || typeof query !== 'string') {
      return createErrorResponse('Search query is required', 400);
    }

    // Initialize embedding service
    const embeddingService = new EmbeddingService(model);

    // Perform search
    const results = await embeddingService.searchSimilar(query, limit, minSimilarity);

    return NextResponse.json({
      success: true,
      data: results
    });
  } catch (error: any) {
    console.error('Error performing vector search:', error);
    return createErrorResponse(error.message || 'Failed to perform vector search', error.status || 500);
  }
}

export const SEARCH = (req: NextRequest, params: { params: { model_id: string } }) => withAuth(req, (authReq) => handleSearch(authReq, params), params); 