import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/mongodb';
import { withAuth, AuthenticatedRequest, createErrorResponse, RouteContext } from '@/lib/api/middleware';
import { JWTPayload } from '@/lib/auth/jwt';

// Helper to get user ID from auth payload
function getUserId(payload: JWTPayload | { user_id: string }): string {
  if ('sub' in payload) {
    return payload.sub;
  }
  return payload.user_id;
}

type DeleteContext = {
  params: Promise<{ id: string }>;
};

// Update DELETE export to use Next.js compatible typing
export async function DELETE(
  request: NextRequest,
  context: DeleteContext
): Promise<Response> {
  const params = await context.params;
  return withAuth(request, async (authReq) => {
    try {
      const { db } = await connectToDatabase();
      const userId = getUserId(authReq.auth.payload);

      // Handle JWT token revocation
      if (params.id === 'current') {
        const token = authReq.cookies.get('token')?.value;
        if (!token) return createErrorResponse('No active session', 400);

        await db.collection('revoked_tokens').insertOne({
          token,
          revoked_at: new Date(),
          user_id: userId
        });

        const response = NextResponse.json({ message: 'Token revoked successfully' });
        response.cookies.delete('token');
        return response;
      }

      // Handle API key revocation
      const result = await db.collection('api_keys').updateOne(
        { id: params.id, user_id: userId, status: 'active' },
        { $set: { status: 'revoked', updated_at: new Date() } }
      );

      return result.matchedCount === 0
        ? createErrorResponse('API key not found', 404)
        : NextResponse.json({ message: 'API key revoked successfully' });
        
    } catch (error) {
      console.error('Revocation error:', error);
      return createErrorResponse('Internal server error', 500);
    }
  }, { params });
} 