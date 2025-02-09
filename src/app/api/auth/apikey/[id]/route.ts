import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/mongodb';
import { withAuth, AuthenticatedRequest, createErrorResponse } from '@/lib/api/middleware';
import { JWTPayload } from '@/lib/auth/jwt';

// Helper to get user ID from auth payload
function getUserId(payload: JWTPayload | { user_id: string }): string {
  if ('sub' in payload) {
    return payload.sub;
  }
  return payload.user_id;
}

// Revoke API key
async function handleDelete(
  req: AuthenticatedRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { db } = await connectToDatabase();
    const userId = getUserId(req.auth.payload);
    
    // Find and update the API key
    const result = await db.collection('api_keys').updateOne(
      {
        id: params.id,
        user_id: userId,
        status: 'active',
      },
      {
        $set: {
          status: 'revoked',
          updated_at: new Date(),
        },
      }
    );
    
    if (result.matchedCount === 0) {
      return createErrorResponse('API key not found or already revoked', 404);
    }
    
    return NextResponse.json({
      message: 'API key revoked successfully',
    });
    
  } catch (error) {
    console.error('API key revocation error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

// Route handler
export async function DELETE(
  req: NextRequest,
  context: { params: { id: string } }
) {
  return withAuth(req, (authenticatedReq) => handleDelete(authenticatedReq, context));
} 