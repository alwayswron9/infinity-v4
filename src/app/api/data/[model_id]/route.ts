import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest, createErrorResponse, RouteContext } from '@/lib/api/middleware';
import { ModelService } from '@/lib/models/modelService';
import { PostgresDataService } from '@/lib/data/postgresDataService';

type ModelRouteContext = {
  params: Promise<{ model_id: string }>;
};

const modelService = new ModelService();

export async function GET(
  request: NextRequest,
  context: ModelRouteContext
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
        const page = searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1;
        const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 10;

        const { records, total } = await dataService.listRecords({
          filter,
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
      const userId = authReq.auth.payload.user_id;
      const { model_id } = params;

      // Verify model ownership and get model definition
      const model = await modelService.validateCrudOperation(model_id, userId);

      // Initialize data service
      const dataService = new PostgresDataService(model);

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
      const userId = authReq.auth.payload.user_id;
      const { model_id } = params;
      const { searchParams } = new URL(request.url);
      const id = searchParams.get('id');
      
      if (!id) {
        return createErrorResponse('Record ID is required', 400);
      }

      // Verify model ownership and get model definition
      const model = await modelService.validateCrudOperation(model_id, userId);

      // Initialize data service
      const dataService = new PostgresDataService(model);

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
  context: ModelRouteContext
): Promise<Response> {
  const params = await context.params;
  return withAuth(request, async (authReq) => {
    try {
      const userId = authReq.auth.payload.user_id;
      const { model_id } = params;
      const { searchParams } = new URL(request.url);
      const id = searchParams.get('id');
      
      if (!id) {
        return createErrorResponse('Record ID is required', 400);
      }

      // Verify model ownership and get model definition
      const model = await modelService.validateCrudOperation(model_id, userId);

      // Initialize data service
      const dataService = new PostgresDataService(model);

      // Delete record
      await dataService.deleteRecord(id);

      return new NextResponse(null, { status: 204 });
    } catch (error: any) {
      console.error('Error deleting record:', error);
      return createErrorResponse(error.message || 'Failed to delete record', error.status || 500);
    }
  }, { params });
} 