import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest, createErrorResponse, RouteContext } from '@/lib/api/middleware';
import { ViewService } from '@/lib/views/viewService';
import { ViewConfig, ViewConfigSchema, ModelView, ModelViewSchema } from '@/types/viewDefinition';
import { z } from 'zod';
import { executeQuery } from '@/lib/db/postgres';
import { pool } from '@/lib/db/postgres';
import { getCurrentUser } from '@/lib/auth/session';

const viewService = new ViewService();

async function handleGet(req: AuthenticatedRequest, context: RouteContext<{ id: string }>) {
  try {
    const userId = req.auth.payload.sub;
    const params = await context.params;
    const { id } = params;

    const result = await executeQuery(
      `SELECT * FROM model_views 
       WHERE model_id = $1 
       AND (owner_id = $2 OR is_public = true)
       ORDER BY created_at DESC`,
      [id, userId]
    );

    // Map the rows to ModelView objects and validate them
    const views = result.rows.map(row => ({
      id: row.id,
      model_id: row.model_id,
      owner_id: row.owner_id,
      name: row.name,
      description: row.description,
      config: row.config,
      is_default: row.is_default,
      is_public: row.is_public,
      created_at: row.created_at,
      updated_at: row.updated_at
    }));

    // Return the data in the expected format
    return NextResponse.json({ data: views });
  } catch (error) {
    console.error('Error fetching views:', error);
    return createErrorResponse('Failed to fetch views', 500);
  }
}

async function handlePost(req: AuthenticatedRequest, context: RouteContext<{ id: string }>) {
  try {
    const userId = req.auth.payload.sub;
    const params = await context.params;
    const { id } = params;
    const body = await req.json();
    
    // Validate config
    const validatedConfig = ViewConfigSchema.parse(body.config);

    // Check if default view exists if this is marked as default
    if (body.is_default) {
      const defaultViewResult = await executeQuery(
        'SELECT id FROM model_views WHERE model_id = $1 AND is_default = true',
        [id]
      );

      if (defaultViewResult.rows.length > 0) {
        return createErrorResponse('A default view already exists', 400);
      }
    }

    const result = await executeQuery(
      `INSERT INTO model_views (
        name, description, config, is_default, is_public,
        model_id, owner_id, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      ) RETURNING *`,
      [
        body.name,
        body.description || '',
        validatedConfig,
        body.is_default || false,
        body.is_public || false,
        id,
        userId
      ]
    );

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error creating view:', error);
    return createErrorResponse('Failed to create view', 500);
  }
}

async function handlePut(req: AuthenticatedRequest, context: RouteContext<{ id: string }>) {
  try {
    const userId = req.auth.payload.sub;
    const params = await context.params;
    const modelId = params.id;
    const { searchParams } = new URL(req.url);
    const viewId = searchParams.get('viewId');
    
    if (!viewId) {
      return createErrorResponse('View ID is required', 400);
    }

    const body = await req.json();
    const view = await viewService.updateView(viewId, userId, body);
    return NextResponse.json({ success: true, data: view });
  } catch (error: any) {
    console.error('Error updating view:', error);
    return createErrorResponse(error.message || 'Failed to update view', error.status || 500);
  }
}

async function handleDelete(req: AuthenticatedRequest, context: RouteContext<{ id: string }>) {
  try {
    const userId = req.auth.payload.sub;
    const params = await context.params;
    const modelId = params.id;
    const { searchParams } = new URL(req.url);
    const viewId = searchParams.get('viewId');
    
    if (!viewId) {
      return createErrorResponse('View ID is required', 400);
    }

    await viewService.deleteView(viewId, userId);
    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    console.error('Error deleting view:', error);
    return createErrorResponse(error.message || 'Failed to delete view', error.status || 500);
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  const resolvedParams = await params;
  return withAuth(req, handleGet, { params: resolvedParams });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  const resolvedParams = await params;
  return withAuth(req, handlePost, { params: resolvedParams });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  const resolvedParams = await params;
  return withAuth(req, handlePut, { params: resolvedParams });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  const resolvedParams = await params;
  return withAuth(req, handleDelete, { params: resolvedParams });
} 