import { NextRequest, NextResponse } from 'next/server';
import { withPublicApiKey, PublicApiRequest, createErrorResponse } from '@/lib/api/publicMiddleware';
import { ModelService } from '@/lib/models/modelService';
import { PostgresDataService } from '@/lib/data/postgresDataService';

const modelService = new ModelService();

export async function GET(request: NextRequest) {
  return withPublicApiKey(request, async (authReq) => {
    try {
      const { searchParams } = new URL(request.url);
      const modelName = searchParams.get('model');
      const recordId = searchParams.get('id');

      if (!modelName) {
        return createErrorResponse('Model name is required', 400);
      }

      // Get model definition by name
      const model = await modelService.getModelDefinitionByName(modelName, authReq.apiKey.user_id);

      // Initialize data service
      const dataService = new PostgresDataService(model);

      if (recordId) {
        // Get specific record
        const record = await dataService.getRecord(recordId);
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
  }, { params: {} });
}

export async function POST(request: NextRequest) {
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

      // Get request body
      const body = await authReq.json();
      
      // Check if the request is for bulk operations (array of objects)
      if (Array.isArray(body)) {
        if (body.length === 0) {
          return createErrorResponse('Empty array provided. At least one record is required.', 400);
        }
        
        // Process each record in the array
        const results = [];
        const errors = [];
        
        for (let i = 0; i < body.length; i++) {
          try {
            // Validate nested fields structure for each item
            if (!body[i].fields || typeof body[i].fields !== 'object') {
              throw new Error('Each item must contain a fields object');
            }
            
            const record = await dataService.createRecord(body[i].fields);
            results.push(record);
          } catch (error: any) {
            errors.push({
              index: i,
              error: error.message || 'Failed to create record',
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
        }, { status: errors.length === 0 ? 201 : 207 });
      } else {
        // Single record creation (existing functionality)
        // Validate nested fields structure
        if (!body.fields || typeof body.fields !== 'object') {
          return createErrorResponse('Request body must contain a fields object', 400);
        }

        const record = await dataService.createRecord(body.fields);
        return NextResponse.json({ success: true, data: record }, { status: 201 });
      }
    } catch (error: any) {
      console.error('Error creating record:', error);
      return createErrorResponse(error.message || 'Failed to create record', error.status || 500);
    }
  }, { params: {} });
}

export async function PUT(request: NextRequest) {
  return withPublicApiKey(request, async (authReq) => {
    try {
      const { searchParams } = new URL(request.url);
      const modelName = searchParams.get('model');
      const recordId = searchParams.get('id');

      if (!modelName) {
        return createErrorResponse('Model name is required', 400);
      }
      if (!recordId) {
        return createErrorResponse('Record ID is required', 400);
      }

      // Get model definition by name
      const model = await modelService.getModelDefinitionByName(modelName, authReq.apiKey.user_id);

      // Initialize data service
      const dataService = new PostgresDataService(model);

      // Update record
      const body = await authReq.json();

      // Validate nested fields structure
      if (!body.fields || typeof body.fields !== 'object') {
        return createErrorResponse('Request body must contain a fields object', 400);
      }

      const record = await dataService.updateRecord(recordId, body.fields);

      return NextResponse.json({ success: true, data: record });
    } catch (error: any) {
      console.error('Error updating record:', error);
      return createErrorResponse(error.message || 'Failed to update record', error.status || 500);
    }
  }, { params: {} });
}

export async function DELETE(request: NextRequest) {
  return withPublicApiKey(request, async (authReq) => {
    try {
      const { searchParams } = new URL(request.url);
      const modelName = searchParams.get('model');
      const recordId = searchParams.get('id');

      if (!modelName) {
        return createErrorResponse('Model name is required', 400);
      }
      if (!recordId) {
        return createErrorResponse('Record ID is required', 400);
      }

      // Get model definition by name
      const model = await modelService.getModelDefinitionByName(modelName, authReq.apiKey.user_id);

      // Initialize data service
      const dataService = new PostgresDataService(model);

      // Delete record
      await dataService.deleteRecord(recordId);

      return new NextResponse(null, { status: 204 });
    } catch (error: any) {
      console.error('Error deleting record:', error);
      return createErrorResponse(error.message || 'Failed to delete record', error.status || 500);
    }
  }, { params: {} });
} 