import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest, createErrorResponse } from '@/lib/api/middleware';
import { pool } from '@/lib/db/postgres';

type RouteContext = {
  params: { id: string };
};

async function handleGet(req: AuthenticatedRequest, context: RouteContext) {
  try {
    const userId = req.auth.payload.sub;
    const modelId = context.params.id;

    // First try to get user's default view
    const { rows: [userDefault] } = await pool.query(
      `SELECT * FROM model_views 
       WHERE model_id = $1 
       AND owner_id = $2 
       AND is_default = true
       LIMIT 1`,
      [modelId, userId]
    );

    if (userDefault) {
      return NextResponse.json({ success: true, data: userDefault });
    }

    // If no user default, try to get public default view
    const { rows: [publicDefault] } = await pool.query(
      `SELECT * FROM model_views 
       WHERE model_id = $1 
       AND is_public = true 
       AND is_default = true
       LIMIT 1`,
      [modelId]
    );

    if (publicDefault) {
      return NextResponse.json({ success: true, data: publicDefault });
    }

    // If no default view exists, create one
    const { rows: [modelFields] } = await pool.query(
      'SELECT fields FROM model_definitions WHERE id = $1',
      [modelId]
    );

    if (!modelFields) {
      return createErrorResponse('Model not found', 404);
    }

    const defaultConfig = {
      columns: Object.keys(modelFields.fields).map(field => ({
        field,
        visible: true,
        sortable: true,
        filterable: true,
        width: 150,
        format: {
          type: 'text'
        }
      })),
      sorting: [{
        field: '_id',
        direction: 'asc'
      }],
      filters: [],
      layout: {
        density: 'normal',
        theme: 'system'
      }
    };

    const { rows: [newDefault] } = await pool.query(
      `INSERT INTO model_views (
        id, model_id, owner_id, name, description,
        config, is_default, is_public, created_at, updated_at
      ) VALUES (
        gen_random_uuid(), $1, $2, $3, $4, $5, true, false,
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      ) RETURNING *`,
      [
        modelId,
        userId,
        'Default View',
        'Auto-generated default view',
        defaultConfig,
      ]
    );

    return NextResponse.json({ success: true, data: newDefault });
  } catch (error: any) {
    console.error('Error handling default view:', error);
    return createErrorResponse(error.message || 'Failed to handle default view', error.status || 500);
  }
}

async function handlePut(req: AuthenticatedRequest, context: RouteContext) {
  try {
    const userId = req.auth.payload.sub;
    const modelId = context.params.id;
    const { viewId } = await req.json();

    // Begin transaction
    await pool.query('BEGIN');

    // Unset current default view
    await pool.query(
      `UPDATE model_views 
       SET is_default = false 
       WHERE model_id = $1 
       AND owner_id = $2 
       AND is_default = true`,
      [modelId, userId]
    );

    // Set new default view
    const { rows: [view] } = await pool.query(
      `UPDATE model_views 
       SET is_default = true 
       WHERE id = $1 
       AND model_id = $2 
       AND owner_id = $3
       RETURNING *`,
      [viewId, modelId, userId]
    );

    if (!view) {
      await pool.query('ROLLBACK');
      return createErrorResponse('View not found', 404);
    }

    await pool.query('COMMIT');
    return NextResponse.json({ success: true, data: view });
  } catch (error: any) {
    await pool.query('ROLLBACK');
    console.error('Error setting default view:', error);
    return createErrorResponse(error.message || 'Failed to set default view', error.status || 500);
  }
}

export const GET = (req: NextRequest, context: RouteContext) => 
  withAuth(req, handleGet, context);

export const PUT = (req: NextRequest, context: RouteContext) => 
  withAuth(req, handlePut, context); 