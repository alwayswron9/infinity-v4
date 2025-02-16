import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, extractTokenFromHeader, JWTPayload } from '@/lib/auth/jwt';
import { validateApiKeyFormat, hashApiKey } from '@/lib/auth/apikey';
import { connectToDatabase } from '@/lib/db/mongodb';

export type AuthenticatedRequest = NextRequest & {
  auth: {
    type: 'jwt' | 'apikey';
    payload: JWTPayload | { user_id: string };
  };
};

export type RouteContext<T extends Record<string, string | string[]> = {}> = {
  params: T;
};

export async function withAuth(
  req: NextRequest,
  handler: (
    req: AuthenticatedRequest,
    context: { params: Record<string, string | string[]> }
  ) => Promise<NextResponse>,
  context: { params: Record<string, string | string[]> }
): Promise<NextResponse> {
  try {
    // Try to get token from Authorization header first
    const authHeader = req.headers.get('authorization');
    let token: string | undefined;
    let type = 'Bearer';

    if (authHeader) {
      [type, token] = authHeader.split(' ');
    } else {
      // If no Authorization header, try to get token from cookie
      token = req.cookies.get('token')?.value;
    }

    if (!token) {
      return NextResponse.json(
        { error: 'No authorization token found' },
        { status: 401 }
      );
    }
    
    if (type === 'Bearer') {
      // Handle JWT authentication
      try {
        // Check if token is revoked
        const { db } = await connectToDatabase();
        const isRevoked = await db.collection('revoked_tokens').findOne({ token });
        
        if (isRevoked) {
          return NextResponse.json(
            { error: 'Token has been revoked' },
            { status: 401 }
          );
        }

        const payload = verifyToken(token);
        const authenticatedReq = req as AuthenticatedRequest;
        authenticatedReq.auth = {
          type: 'jwt',
          payload,
        };
        return handler(authenticatedReq, context);
      } catch (error) {
        return NextResponse.json(
          { error: 'Invalid JWT token' },
          { status: 401 }
        );
      }
    } else {
      // Handle API Key authentication
      if (!validateApiKeyFormat(token)) {
        return NextResponse.json(
          { error: 'Invalid API key format' },
          { status: 401 }
        );
      }

      const { db } = await connectToDatabase();
      const keyHash = hashApiKey(token);
      
      const apiKey = await db.collection('api_keys').findOne({
        key_hash: keyHash,
        status: 'active',
      });

      if (!apiKey) {
        return NextResponse.json(
          { error: 'Invalid API key' },
          { status: 401 }
        );
      }

      // Update last used timestamp
      await db.collection('api_keys').updateOne(
        { key_hash: keyHash },
        { $set: { last_used_at: new Date() } }
      );

      const authenticatedReq = req as AuthenticatedRequest;
      authenticatedReq.auth = {
        type: 'apikey',
        payload: { user_id: apiKey.user_id },
      };
      
      return handler(authenticatedReq, context);
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

interface ErrorResponse {
  field?: string;
  message: string;
}

// Helper to create error responses
export function createErrorResponse(
  error: string | ErrorResponse,
  status: number = 400
): NextResponse {
  return NextResponse.json(
    { error },
    { status }
  );
} 