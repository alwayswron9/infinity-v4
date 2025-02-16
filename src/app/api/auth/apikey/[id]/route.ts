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

// Revoke access token (API key or JWT)
async function handleDelete(
  req: AuthenticatedRequest,
  id: string,
  context: { params: { id: string } }
) {
  try {
    const { db } = await connectToDatabase();
    const userId = getUserId(req.auth.payload);
    
    // Check if this is a JWT token revocation (special case where id is 'current')
    if (id === 'current') {
      const token = req.cookies.get('token')?.value;
      if (!token) {
        return createErrorResponse('No active session', 400);
      }

      // Add token to revoked_tokens collection
      await db.collection('revoked_tokens').insertOne({
        token,
        revoked_at: new Date(),
        user_id: userId
      });

      // Clear client-side cookie
      const response = NextResponse.json({
        message: 'Token revoked successfully'
      });
      response.cookies.delete('token');
      
      return response;
    }

    // Otherwise, handle API key revocation
    const result = await db.collection('api_keys').updateOne(
      {
        id,
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
    console.error('Access token revocation error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

// Update DELETE export to use Next.js compatible typing
export const DELETE = (
  req: NextRequest,
  context: { params: { id: string } }
) => {
  return withAuth(req, (authReq) => handleDelete(authReq, context.params.id, context), context);
}; 