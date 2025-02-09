import { NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/db/mongodb';
import { withAuth, AuthenticatedRequest, createErrorResponse } from '@/lib/api/middleware';
import { withLogging } from '@/lib/api/logging';

async function handler(req: AuthenticatedRequest) {
  try {
    const { db } = await connectToDatabase();
    
    // Get user ID from JWT payload
    const userId = 'sub' in req.auth.payload ? req.auth.payload.sub : req.auth.payload.user_id;
    
    // Find user
    const user = await db.collection('users').findOne(
      { id: userId },
      { projection: { password_hash: 0 } }  // Exclude password hash
    );
    
    if (!user) {
      return createErrorResponse('User not found', 404);
    }
    
    return Response.json({ user });
    
  } catch (error) {
    console.error('Profile fetch error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

export const GET = withLogging; 