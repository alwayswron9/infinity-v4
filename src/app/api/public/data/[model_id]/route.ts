import { NextRequest, NextResponse } from 'next/server';
import { withPublicApiKey, PublicApiRequest } from '@/lib/api/publicMiddleware';
import { ModelService } from '@/lib/models/modelService';
import { DataService } from '@/lib/data/dataService';
import { connectToDataDatabase, getDataMongoClient } from '@/lib/db/dataDb';

const modelService = new ModelService();

type ModelRouteContext = {
  params: Promise<{ model_id: string }>;
};

export async function GET(
  request: NextRequest,
  context: ModelRouteContext
): Promise<Response> {
  const params = await context.params;
  return withPublicApiKey(request, async (req) => {
    try {
      await connectToDataDatabase();
      const client = getDataMongoClient();
      const db = client.db();

      const { model_id } = params;
      const { user_id } = req.apiKey;

      // Get model and verify access
      const model = await modelService.getModelDefinition(model_id);
      if (model.owner_id !== user_id) {
        return NextResponse.json(
          { error: 'Unauthorized - You do not have access to this model' },
          { status: 403 }
        );
      }

      const dataService = new DataService(model);
      await dataService.initializeCollection();

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
      const { model_id } = params;
      const { user_id } = req.apiKey;

      const model = await modelService.getModelDefinition(model_id);
      if (model.owner_id !== user_id) {
        return NextResponse.json(
          { error: 'Unauthorized - You do not have access to this model' },
          { status: 403 }
        );
      }

      const dataService = new DataService(model);
      await dataService.initializeCollection();

      const body = await req.json();
      const record = await dataService.createRecord(body);

      // Exclude vector data
      const { _vector, ...recordWithoutVector } = record;
      return NextResponse.json(
        { success: true, data: recordWithoutVector },
        { status: 201 }
      );
    } catch (error: any) {
      console.error('Error creating record:', error);
      return NextResponse.json(
        { 
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
      const { model_id } = params;
      const { user_id } = req.apiKey;
      const { searchParams } = new URL(request.url);
      const id = searchParams.get('id');

      if (!id) {
        return NextResponse.json(
          { error: 'Record ID is required' },
          { status: 400 }
        );
      }

      const model = await modelService.getModelDefinition(model_id);
      if (model.owner_id !== user_id) {
        return NextResponse.json(
          { error: 'Unauthorized - You do not have access to this model' },
          { status: 403 }
        );
      }

      const dataService = new DataService(model);
      await dataService.initializeCollection();

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
      const { model_id } = params;
      const { user_id } = req.apiKey;
      const { searchParams } = new URL(request.url);
      const id = searchParams.get('id');

      if (!id) {
        return NextResponse.json(
          { error: 'Record ID is required' },
          { status: 400 }
        );
      }

      const model = await modelService.getModelDefinition(model_id);
      if (model.owner_id !== user_id) {
        return NextResponse.json(
          { error: 'Unauthorized - You do not have access to this model' },
          { status: 403 }
        );
      }

      const dataService = new DataService(model);
      await dataService.initializeCollection();

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