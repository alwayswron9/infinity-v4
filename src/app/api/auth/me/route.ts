import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/mongodb';
import { withAuth, AuthenticatedRequest, createErrorResponse } from '@/lib/api/middleware';

export async function GET(request: NextRequest): Promise<Response> {
  return withAuth(request, async (authReq) => {
    try {
      const { db } = await connectToDatabase();
      
      // Get user ID from JWT payload
      const userId = 'sub' in authReq.auth.payload ? authReq.auth.payload.sub : authReq.auth.payload.user_id;
      
      // Find user
      const user = await db.collection('users').findOne(
        { id: userId },
        { projection: { password_hash: 0 } }  // Exclude password hash
      );
      
      if (!user) {
        return createErrorResponse('User not found', 404);
      }
      
      return NextResponse.json({ user });
      
    } catch (error) {
      console.error('Profile fetch error:', error);
      return createErrorResponse('Internal server error', 500);
    }
  }, { params: {} });
} 