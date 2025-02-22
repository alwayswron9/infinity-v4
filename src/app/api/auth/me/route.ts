import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest, createErrorResponse } from '@/lib/api/middleware';
import { PostgresUserService } from '@/lib/db/postgres/userService';

const userService = new PostgresUserService();

export async function GET(request: NextRequest): Promise<Response> {
  return withAuth(request, async (authReq) => {
    try {
      // Get user ID from JWT payload
      const userId = authReq.auth.payload.user_id;
      
      // Find user
      const user = await userService.findById(userId);
      
      if (!user) {
        return createErrorResponse('User not found', 404);
      }

      // Remove password hash from response
      const { password_hash, ...userWithoutPassword } = user;
      
      return NextResponse.json({ user: userWithoutPassword });
      
    } catch (error) {
      console.error('Profile fetch error:', error);
      return createErrorResponse('Internal server error', 500);
    }
  }, { params: {} });
} 