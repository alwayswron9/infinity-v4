import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest, createErrorResponse } from '@/lib/api/middleware';
import { PostgresUserService } from '@/lib/db/postgres/userService';

const userService = new PostgresUserService();

export async function GET(req: NextRequest) {
  return withAuth(req, async (authReq) => {
    try {
      // Get user ID from JWT payload
      const userId = authReq.auth.payload.user_id;
      
      // Find user
      const user = await userService.findById(userId);
      
      if (!user) {
        return createErrorResponse('User not found', 404);
      }

      if (user.status !== 'active') {
        return createErrorResponse('Account is inactive', 403);
      }

      // Remove password hash from response
      const { password_hash, ...userWithoutPassword } = user;
      
      return NextResponse.json({
        authenticated: true,
        user: userWithoutPassword
      });
      
    } catch (error) {
      console.error('Auth check error:', error);
      return createErrorResponse('Internal server error', 500);
    }
  }, { params: {} });
} 