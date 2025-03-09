import { NextRequest, NextResponse } from 'next/server';
import { withPublicApiKey, PublicApiRequest } from '@/lib/api/publicMiddleware';
import { ModelService } from '@/lib/models/modelService';
import { PostgresDataService } from '@/lib/data/postgresDataService';

const modelService = new ModelService();

type ModelRouteContext = {
  params: Promise<{ model_name: string }>;
};

export async function GET(
  request: NextRequest,
  context: ModelRouteContext
): Promise<Response> {
  const params = await context.params;
  return withPublicApiKey(request, async (req) => {
    try {
      const { model_name } = params;
      const { user_id } = req.apiKey;

      // Get model and verify access using name
      const model = await modelService.getModelDefinitionByName(model_name, user_id);

      const dataService = new PostgresDataService(model);

      const { searchParams } = new URL(request.url);
      const id = searchParams.get('id');

      if (id) {
        const record = await dataService.getRecord(id);
        // Exclude vector data
        const { _vector, ...recordWithoutVector } = record;
        return NextResponse.json({ success: true, data: recordWithoutVector });
      } else {
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

        // Exclude vector data from all records
        const recordsWithoutVectors = records.map(({ _vector, ...rest }) => rest);

        return NextResponse.json({
          success: true,
          data: recordsWithoutVectors,
          meta: { page, limit, total }
        });
      }
    } catch (error: any) {
      console.error('Error fetching record(s):', error);
      return NextResponse.json(
        { 
          success: false,
          error: error.message || 'Failed to fetch record(s)',
          details: {
            code: error.code,
            fields: error.fields,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
          }
        },
        { status: error.status || 500 }
      );
    }
  }, { params });
}

export async function POST(
  request: NextRequest,
  context: ModelRouteContext
): Promise<Response> {
  const params = await context.params;
  return withPublicApiKey(request, async (req) => {
    try {
      const { model_name } = params;
      const { user_id } = req.apiKey;

      const model = await modelService.getModelDefinitionByName(model_name, user_id);
      const dataService = new PostgresDataService(model);

      const body = await req.json();
      
      // Check if the request is for bulk operations (array of objects)
      if (Array.isArray(body)) {
        if (body.length === 0) {
          return NextResponse.json(
            { error: 'Empty array provided. At least one record is required.' },
            { status: 400 }
          );
        }
        
        // Process each record in the array
        const results = [];
        const errors = [];
        
        for (let i = 0; i < body.length; i++) {
          try {
            const record = await dataService.createRecord(body[i]);
            // Exclude vector data
            const { _vector, ...recordWithoutVector } = record;
            results.push(recordWithoutVector);
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
        const record = await dataService.createRecord(body);
        
        // Exclude vector data
        const { _vector, ...recordWithoutVector } = record;
        return NextResponse.json(
          { success: true, data: recordWithoutVector },
          { status: 201 }
        );
      }
    } catch (error: any) {
      console.error('Error creating record:', error);
      return NextResponse.json(
        { 
          success: false,
          error: error.message || 'Failed to create record',
          details: {
            code: error.code,
            fields: error.fields,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
          }
        },
        { status: error.status || 500 }
      );
    }
  }, { params });
}

export async function PUT(
  request: NextRequest,
  context: ModelRouteContext
): Promise<Response> {
  const params = await context.params;
  return withPublicApiKey(request, async (req) => {
    try {
      const { model_name } = params;
      const { user_id } = req.apiKey;
      const { searchParams } = new URL(request.url);
      const id = searchParams.get('id');

      const model = await modelService.getModelDefinitionByName(model_name, user_id);
      const dataService = new PostgresDataService(model);

      const body = await req.json();
      
      // Check if this is a bulk update request (array of objects)
      if (Array.isArray(body)) {
        if (body.length === 0) {
          return NextResponse.json(
            { error: 'Empty array provided. At least one record is required.' },
            { status: 400 }
          );
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
            
            // Remove any vector data from the input
            const { _vector, ...updateData } = item;
            
            const record = await dataService.updateRecord(item.id, updateData);
            
            // Exclude vector data from response
            const { _vector: responseVector, ...recordWithoutVector } = record;
            results.push(recordWithoutVector);
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
          return NextResponse.json(
            { error: 'Record ID is required' },
            { status: 400 }
          );
        }

        // Remove any vector data from the input
        const { _vector, ...updateData } = body;
        
        const record = await dataService.updateRecord(id, updateData);

        // Exclude vector data from response
        const { _vector: responseVector, ...recordWithoutVector } = record;
        return NextResponse.json({ success: true, data: recordWithoutVector });
      }
    } catch (error: any) {
      console.error('Error updating record:', error);
      return NextResponse.json(
        { 
          success: false,
          error: error.message || 'Failed to update record',
          details: {
            code: error.code,
            fields: error.fields,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
          }
        },
        { status: error.status || 500 }
      );
    }
  }, { params });
}

export async function PATCH(
  request: NextRequest,
  context: ModelRouteContext
): Promise<Response> {
  const params = await context.params;
  return withPublicApiKey(request, async (req) => {
    try {
      const { model_name } = params;
      const { user_id } = req.apiKey;
      const { searchParams } = new URL(request.url);
      const id = searchParams.get('id');

      const model = await modelService.getModelDefinitionByName(model_name, user_id);
      const dataService = new PostgresDataService(model);

      // Single record partial update
      if (!id) {
        return NextResponse.json(
          { error: 'Record ID is required' },
          { status: 400 }
        );
      }

      // Get the current record to merge with partial updates
      const currentRecord = await dataService.getRecord(id);
      
      // Get the partial update data
      const partialUpdate = await req.json();
      
      // Remove any vector data from the input
      const { _vector, ...updateData } = partialUpdate;
      
      // Update the record with the partial data
      const record = await dataService.updateRecord(id, updateData);

      // Exclude vector data from response
      const { _vector: responseVector, ...recordWithoutVector } = record;
      return NextResponse.json({ 
        success: true, 
        data: recordWithoutVector 
      });
    } catch (error: any) {
      console.error('Error updating record:', error);
      return NextResponse.json(
        { 
          success: false,
          error: error.message || 'Failed to update record',
          details: {
            code: error.code,
            fields: error.fields,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
          }
        },
        { status: error.status || 500 }
      );
    }
  }, { params });
}

export async function DELETE(
  request: NextRequest,
  context: ModelRouteContext
): Promise<Response> {
  const params = await context.params;
  return withPublicApiKey(request, async (req) => {
    try {
      const { model_name } = params;
      const { user_id } = req.apiKey;
      const { searchParams } = new URL(request.url);
      const id = searchParams.get('id');

      if (!id) {
        return NextResponse.json(
          { error: 'Record ID is required' },
          { status: 400 }
        );
      }

      const model = await modelService.getModelDefinitionByName(model_name, user_id);
      const dataService = new PostgresDataService(model);

      await dataService.deleteRecord(id);

      return new NextResponse(null, { status: 204 });
    } catch (error: any) {
      console.error('Error deleting record:', error);
      return NextResponse.json(
        { 
          success: false,
          error: error.message || 'Failed to delete record',
          details: {
            code: error.code,
            fields: error.fields,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
          }
        },
        { status: error.status || 500 }
      );
    }
  }, { params });
}

// Implement POST, PUT, DELETE similarly... 