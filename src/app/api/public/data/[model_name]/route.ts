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
          meta: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            hasNextPage: page * limit < total,
            hasPreviousPage: page > 1
          }
        });
      }
    } catch (error: any) {
      console.error('Error fetching record(s):', error);
      return NextResponse.json({
        success: false,
        error: error.message || 'Failed to fetch record(s)',
        details: error.details || null
      }, { status: error.status || 500 });
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
      console.log('Raw request body:', JSON.stringify(body));
      
      // Extract and normalize the data
      let itemsToProcess = [];
      
      // If body is an array with a single object containing data with numeric keys
      if (Array.isArray(body) && body.length === 1 && body[0].data) {
        const data = body[0].data;
        // Extract items with numeric keys into array
        itemsToProcess = Object.entries(data)
          .filter(([key]) => !isNaN(Number(key)))
          .sort(([a], [b]) => Number(a) - Number(b))
          .map(([_, value]) => value);
      } else if (Array.isArray(body) && Array.isArray(body[0])) {
        // If it's a nested array format
        itemsToProcess = body[0];
      } else if (Array.isArray(body)) {
        // If it's a direct array
        itemsToProcess = body;
      } else {
        // Single item
        itemsToProcess = [body];
      }

      // Process all items
      const records = [];
      const errors = [];

      for (let i = 0; i < itemsToProcess.length; i++) {
        try {
          const record = await dataService.createRecord(itemsToProcess[i]);
          const { _vector, ...recordWithoutVector } = record;
          records.push(recordWithoutVector);
        } catch (error: any) {
          errors.push({
            index: i,
            data: itemsToProcess[i],
            error: error.message
          });
        }
      }

      return NextResponse.json({
        success: true,
        data: records,
        meta: {
          total: records.length,
          failed: errors.length,
          errors: errors.length > 0 ? errors : undefined
        }
      }, { status: 201 });
    } catch (error: any) {
      console.error('Error creating record(s):', error);
      return NextResponse.json(
        { 
          error: error.message || 'Failed to create record(s)',
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

      if (!id) {
        return NextResponse.json(
          { error: 'Record ID is required' },
          { status: 400 }
        );
      }

      const model = await modelService.getModelDefinitionByName(model_name, user_id);

      const dataService = new PostgresDataService(model);

      const body = await req.json();
      const record = await dataService.updateRecord(id, body);

      // Exclude vector data
      const { _vector, ...recordWithoutVector } = record;
      return NextResponse.json({ success: true, data: recordWithoutVector });
    } catch (error: any) {
      console.error('Error updating record:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to update record' },
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
      return NextResponse.json(
        { success: true },
        { status: 200 }
      );
    } catch (error: any) {
      console.error('Error deleting record:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to delete record' },
        { status: error.status || 500 }
      );
    }
  }, { params });
}

// Implement POST, PUT, DELETE similarly... 