import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest, createErrorResponse, RouteContext } from '@/lib/api/middleware';
import { ModelService } from '@/lib/models/modelService';
import { DataService } from '@/lib/data/dataService';
import { EmbeddingService } from '@/lib/embeddings/embeddingService';
import { connectToDataDatabase, getDataMongoClient } from '@/lib/db/dataDb';

type ModelRouteContext = {
  params: Promise<{ model_id: string }>;
};

const modelService = new ModelService();

async function verifyModelOwnership(modelId: string, userId: string) {
  const model = await modelService.getModelDefinition(modelId);
  if (model.owner_id !== userId) {
    throw new Error('Unauthorized - You do not own this model');
  }
  return model;
}

export async function GET(
  request: NextRequest,
  context: ModelRouteContext
): Promise<Response> {
  const params = await context.params;
  return withAuth(request, async (authReq) => {
    try {
      // Add connection check
      await connectToDataDatabase();
      
      const client = getDataMongoClient();
      const db = client.db();

      const userId = 'sub' in authReq.auth.payload ? authReq.auth.payload.sub : authReq.auth.payload.user_id;
      const { model_id } = params;

      // Verify model ownership
      const model = await verifyModelOwnership(model_id, userId);

      // Initialize data service with model
      const dataService = new DataService(model);
      await dataService.initializeCollection();

      // Check if this is a get by ID request
      const { searchParams } = new URL(request.url);
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
  }, { params });
}

export async function POST(
  request: NextRequest,
  context: ModelRouteContext
): Promise<Response> {
  const params = await context.params;
  return withAuth(request, async (authReq) => {
    try {
      const userId = 'sub' in authReq.auth.payload ? authReq.auth.payload.sub : authReq.auth.payload.user_id;
      const { model_id } = params;

      // Verify model ownership
      const model = await verifyModelOwnership(model_id, userId);

      // Initialize data service with model
      const dataService = new DataService(model);
      await dataService.initializeCollection();

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
  }, { params });
}

export async function PUT(
  request: NextRequest,
  context: ModelRouteContext
): Promise<Response> {
  const params = await context.params;
  return withAuth(request, async (authReq) => {
    try {
      const userId = 'sub' in authReq.auth.payload ? authReq.auth.payload.sub : authReq.auth.payload.user_id;
      const { model_id } = params;
      const { searchParams } = new URL(request.url);
      const id = searchParams.get('id');
      
      if (!id) {
        return createErrorResponse('Record ID is required', 400);
      }

      // Verify model ownership
      const model = await verifyModelOwnership(model_id, userId);

      // Initialize data service with model
      const dataService = new DataService(model);
      await dataService.initializeCollection();

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
  }, { params });
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ model_id: string }> }
): Promise<Response> {
  const params = await context.params;
  return withAuth(request, async (authReq) => {
    try {
      const userId = 'sub' in authReq.auth.payload ? authReq.auth.payload.sub : authReq.auth.payload.user_id;
      const { model_id } = params;
      const { searchParams } = new URL(request.url);
      const id = searchParams.get('id');
      
      if (!id) {
        return createErrorResponse('Record ID is required', 400);
      }

      // Verify model ownership
      const model = await verifyModelOwnership(model_id, userId);

      // Initialize data service with model
      const dataService = new DataService(model);
      await dataService.initializeCollection();

      // Delete record
      await dataService.deleteRecord(id);

      return new NextResponse(null, { status: 204 });
    } catch (error: any) {
      console.error('Error deleting record:', error);
      return createErrorResponse(error.message || 'Failed to delete record', error.status || 500);
    }
  }, { params });
} 