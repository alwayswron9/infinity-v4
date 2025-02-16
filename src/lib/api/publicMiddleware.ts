import { NextRequest, NextResponse } from 'next/server';
import { validateApiKeyFormat, hashApiKey } from '@/lib/auth/apikey';
import { connectToDatabase } from '@/lib/db/mongodb';

export type PublicApiRequest = NextRequest & {
  apiKey: {
    user_id: string;
    key_id: string;
  };
};

export async function withPublicApiKey<T extends Record<string, string | string[]> = {}>(
  req: NextRequest,
  handler: (
    req: PublicApiRequest,
    context: { params: T }
  ) => Promise<NextResponse>,
  context: { params: T }
): Promise<NextResponse> {
  try {
    const apiKey = req.headers.get('x-api-key');
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key is required' },
        { status: 401 }
      );
    }

    if (!validateApiKeyFormat(apiKey)) {
      return NextResponse.json(
        { error: 'Invalid API key format' },
        { status: 401 }
      );
    }

    const { db } = await connectToDatabase();
    const keyHash = hashApiKey(apiKey);
    
    const apiKeyRecord = await db.collection('api_keys').findOne({
      key_hash: keyHash,
      status: 'active',
    });

    if (!apiKeyRecord) {
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

    const authenticatedReq = req as PublicApiRequest;
    authenticatedReq.apiKey = {
      user_id: apiKeyRecord.user_id,
      key_id: apiKeyRecord.id,
    };
    
    return handler(authenticatedReq, context);
  } catch (error) {
    console.error('API key authentication error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 401 }
    );
  }
} 