import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest, createErrorResponse } from '@/lib/api/middleware';
import { withLogging } from '@/lib/api/logging';
import { connectToDatabase } from '@/lib/db/mongodb';

async function handler(req: AuthenticatedRequest) {
  try {
    const { db } = await connectToDatabase();
    
    // Get user ID from JWT payload
    const userId = 'sub' in req.auth.payload ? req.auth.payload.sub : req.auth.payload.user_id;
    
    // Find user
    const user = await db.collection('users').findOne(
      { id: userId },
      { projection: { password_hash: 0, _id: 0 } }  // Exclude password hash and _id
    );
    
    if (!user) {
      return createErrorResponse('User not found', 404);
    }

    // Check if user is active
    if (user.status !== 'active') {
      return createErrorResponse('Account is inactive', 403);
    }
    
    return NextResponse.json({
      authenticated: true,
      user
    });
    
  } catch (error) {
    console.error('Auth check error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

export async function GET(req: NextRequest) {
  return withAuth(req, async (authReq) => {
    try {
      const { db } = await connectToDatabase();
      const userId = 'sub' in authReq.auth.payload ? authReq.auth.payload.sub : authReq.auth.payload.user_id;
      
      const user = await db.collection('users').findOne(
        { id: userId },
        { projection: { password_hash: 0, _id: 0 } }
      );
      
      if (!user) {
        return createErrorResponse('User not found', 404);
      }

      if (user.status !== 'active') {
        return createErrorResponse('Account is inactive', 403);
      }
      
      return NextResponse.json({
        authenticated: true,
        user
      });
      
    } catch (error) {
      console.error('Auth check error:', error);
      return createErrorResponse('Internal server error', 500);
    }
  }, { params: {} }); // Add empty context
} 