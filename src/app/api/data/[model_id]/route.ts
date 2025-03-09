import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest, createErrorResponse } from '@/lib/api/middleware';
import { ModelService } from '@/lib/models/modelService';
import { PostgresDataService } from '@/lib/data/postgresDataService';

const modelService = new ModelService();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ model_id: string }> }
): Promise<Response> {
  const resolvedParams = await params;
  const model_id = resolvedParams.model_id;
  return withAuth(request, async (authReq) => {
    try {
      const userId = authReq.auth.payload.user_id;

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
        const filtersParam = searchParams.get('filter');
        let filter = undefined;
        
        if (filtersParam) {
          try {
            const parsedFilters = JSON.parse(filtersParam);
            console.log('Received filters:', parsedFilters);
            
            // Check if it's an array of filter objects (from the UI)
            if (Array.isArray(parsedFilters)) {
              // For complex filter operations, we'll pass them directly to the data service
              // which now has enhanced support for complex filter operations
              filter = parsedFilters;
              console.log('Using complex filter format:', filter);
            } else {
              // It's already in the expected format (simple key-value)
              filter = parsedFilters;
              console.log('Using simple filter format:', filter);
            }
          } catch (error) {
            console.error('Error parsing filters:', error);
          }
        }
        
        const page = searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1;
        const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 10;
        const sorting = searchParams.get('sorting') ? JSON.parse(searchParams.get('sorting')!) : undefined;

        const { records, total } = await dataService.listRecords({
          filter,
          page,
          limit
        });

        // Calculate pagination data
        const totalRecords = total || 0;
        const totalPages = Math.max(1, Math.ceil(totalRecords / limit));

        return NextResponse.json({
          success: true,
          data: records,
          meta: { 
            page, 
            limit, 
            total: totalRecords,
            totalPages,
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1 
          }
        });
      }
    } catch (error: any) {
      console.error('Error fetching record(s):', error);
      return createErrorResponse(error.message || 'Failed to fetch record(s)', error.status || 500);
    }
  }, { params: resolvedParams });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ model_id: string }> }
): Promise<Response> {
  const resolvedParams = await params;
  const model_id = resolvedParams.model_id;
  return withAuth(request, async (authReq) => {
    try {
      const userId = authReq.auth.payload.user_id;

      // Verify model ownership and get model definition
      const model = await modelService.validateCrudOperation(model_id, userId);

      // Initialize data service
      const dataService = new PostgresDataService(model);

      // Create record
      const body = await authReq.json();
      
      // Support both direct data and fields wrapper for backward compatibility
      const data = body.fields || body;

      const record = await dataService.createRecord(data);

      return NextResponse.json({ success: true, data: record }, { status: 201 });
    } catch (error: any) {
      console.error('Error creating record:', error);
      return createErrorResponse(error.message || 'Failed to create record', error.status || 500);
    }
  }, { params: resolvedParams });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ model_id: string }> }
): Promise<Response> {
  const resolvedParams = await params;
  const model_id = resolvedParams.model_id;
  return withAuth(request, async (authReq) => {
    try {
      const userId = authReq.auth.payload.user_id;
      const { searchParams } = new URL(request.url);
      const id = searchParams.get('id');
      
      // Verify model ownership and get model definition
      const model = await modelService.validateCrudOperation(model_id, userId);

      // Initialize data service
      const dataService = new PostgresDataService(model);

      // Get request body
      const body = await authReq.json();
      
      // Check if this is a bulk update request (array of objects)
      if (Array.isArray(body)) {
        if (body.length === 0) {
          return createErrorResponse('Empty array provided. At least one record is required.', 400);
        }
        
        // Process each record in the array
        const results = [];
        const errors = [];
        
        for (let i = 0; i < body.length; i++) {
          try {
            const item = body[i];
            
            // Each item must have an id
            if (!item.id) {
              throw new Error('Each item must contain an id field');
            }
            
            // Support both direct data and fields wrapper for backward compatibility
            const updateData = item.fields || item;
            
            const record = await dataService.updateRecord(item.id, updateData);
            results.push(record);
          } catch (error: any) {
            errors.push({
              index: i,
              error: error.message || 'Failed to update record',
              data: body[i]
            });
          }
        }
        
        return NextResponse.json({
          success: errors.length === 0,
          data: results,
          errors: errors.length > 0 ? errors : undefined,
          meta: {
            total: body.length,
            succeeded: results.length,
            failed: errors.length
          }
        }, { status: errors.length === 0 ? 200 : 207 });
      } else {
        // Single record update (existing functionality)
        if (!id) {
          return createErrorResponse('Record ID is required', 400);
        }

        // Support both direct data and fields wrapper for backward compatibility
        const updateData = body.fields || body;

        const record = await dataService.updateRecord(id, updateData);

        return NextResponse.json({ success: true, data: record });
      }
    } catch (error: any) {
      console.error('Error updating record:', error);
      return createErrorResponse(error.message || 'Failed to update record', error.status || 500);
    }
  }, { params: resolvedParams });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ model_id: string }> }
): Promise<Response> {
  const resolvedParams = await params;
  const model_id = resolvedParams.model_id;
  return withAuth(request, async (authReq) => {
    try {
      const userId = authReq.auth.payload.user_id;
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
  }, { params: resolvedParams });
} 