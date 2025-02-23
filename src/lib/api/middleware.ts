import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, JWTPayload } from '@/lib/auth/jwt';
import { validateApiKeyFormat, hashApiKey } from '@/lib/auth/apikey';
import { PostgresApiKeyService } from '@/lib/db/postgres/apiKeyService';

export type AuthenticatedRequest = NextRequest & {
  auth: {
    type: 'jwt';
    payload: JWTPayload & {
      user_id: string;
    };
  };
};

export type RouteContext<T extends Record<string, string | string[]> = {}> = {
  params: T;
};

export function createErrorResponse(error: string | { field: string; message: string }, status: number) {
  return NextResponse.json(
    { error: typeof error === 'string' ? { message: error } : error },
    { status }
  );
}

const apiKeyService = new PostgresApiKeyService();

export async function withAuth<T extends Record<string, string | string[]> = {}>(
  req: NextRequest,
  handler: (
    req: AuthenticatedRequest,
    context: { params: T }
  ) => Promise<NextResponse>,
  context: { params: T }
): Promise<NextResponse> {
  try {
    // Try to get token from Authorization header first
    const authHeader = req.headers.get('authorization');
    let token: string | undefined;

    if (authHeader) {
      const [type, value] = authHeader.split(' ');
      if (type === 'Bearer') {
        token = value;
      }
    }

    // If no Authorization header or not Bearer, try to get token from cookie
    if (!token) {
      token = req.cookies.get('token')?.value;
    }

    if (!token) {
      return NextResponse.json(
        { error: 'No authorization token found' },
        { status: 401 }
      );
    }

    try {
      const payload = verifyToken(token);
      const authenticatedReq = req as AuthenticatedRequest;
      authenticatedReq.auth = {
        type: 'jwt',
        payload: {
          ...payload,
          user_id: payload.sub
        }
      };
      return handler(authenticatedReq, context);
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid JWT token' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Authentication error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 401 }
    );
  }
} 