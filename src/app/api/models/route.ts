import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest, createErrorResponse } from '@/lib/api/middleware';
import { ModelService } from '@/lib/models/modelService';
import { CreateModelDefinitionInput, UpdateModelDefinitionInput } from '@/types/modelDefinition';

const modelService = new ModelService();

async function handleGet(req: AuthenticatedRequest) {
  try {
    // Get user ID from JWT payload
    const userId = req.auth.payload.sub;

    // Get model ID from query params if present
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (id) {
      // Get specific model definition
      const model = await modelService.getModelDefinition(id);
      
      // Verify ownership
      if (model.owner_id !== userId) {
        return createErrorResponse('Unauthorized', 403);
      }

      return NextResponse.json({ success: true, data: model });
    } else {
      // List all model definitions for user
      const models = await modelService.listModelDefinitions(userId);
      return NextResponse.json({ success: true, data: models });
    }
  } catch (error: any) {
    console.error('Error fetching model definition(s):', error);
    return createErrorResponse(error.message || 'Failed to fetch model definition(s)', error.status || 500);
  }
}

async function handlePost(req: AuthenticatedRequest) {
  try {
    const userId = req.auth.payload.sub;
    const body = await req.json();
    const model = await modelService.createModelDefinition(body as CreateModelDefinitionInput, userId);
    return NextResponse.json({ success: true, data: model }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating model definition:', error);
    return createErrorResponse(error.message || 'Failed to create model definition', error.status || 500);
  }
}

async function handlePut(req: AuthenticatedRequest) {
  try {
    const userId = req.auth.payload.sub;
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return createErrorResponse('Model ID is required', 400);
    }

    const body = await req.json();
    const model = await modelService.updateModelDefinition(id, body as UpdateModelDefinitionInput, userId);
    return NextResponse.json({ success: true, data: model });
  } catch (error: any) {
    console.error('Error updating model definition:', error);
    return createErrorResponse(error.message || 'Failed to update model definition', error.status || 500);
  }
}

async function handleDelete(req: AuthenticatedRequest) {
  try {
    const userId = req.auth.payload.sub;
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return createErrorResponse('Model ID is required', 400);
    }

    await modelService.deleteModelDefinition(id, userId);
    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    console.error('Error deleting model definition:', error);
    return createErrorResponse(error.message || 'Failed to delete model definition', error.status || 500);
  }
}

export const GET = (req: NextRequest) => withAuth(req, handleGet, { params: {} });
export const POST = (req: NextRequest) => withAuth(req, handlePost, { params: {} });
export const PUT = (req: NextRequest) => withAuth(req, handlePut, { params: {} });
export const DELETE = (req: NextRequest) => withAuth(req, handleDelete, { params: {} }); 