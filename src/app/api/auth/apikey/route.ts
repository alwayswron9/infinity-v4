import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { connectToDatabase } from '@/lib/db/mongodb';
import { generateApiKey, hashApiKey, ApiKeyRecord } from '@/lib/auth/apikey';
import { withAuth, AuthenticatedRequest, createErrorResponse } from '@/lib/api/middleware';
import { JWTPayload } from '@/lib/auth/jwt';
import { z } from 'zod';

// Schema for API key creation
const CreateApiKeySchema = z.object({
  name: z.string().min(1).max(100),
});

// Helper to get user ID from auth payload
function getUserId(payload: JWTPayload | { user_id: string }): string {
  if ('sub' in payload) {
    return payload.sub;
  }
  return payload.user_id;
}

// Generate new API key
async function handlePost(req: AuthenticatedRequest) {
  try {
    const body = await req.json();
    const validatedData = CreateApiKeySchema.parse(body);
    
    const apiKey = generateApiKey();
    const now = new Date();
    
    const apiKeyRecord: ApiKeyRecord = {
      id: uuidv4(),
      user_id: getUserId(req.auth.payload),
      key_hash: hashApiKey(apiKey),
      name: validatedData.name,
      created_at: now,
      last_used_at: null,
      status: 'active',
    };
    
    const { db } = await connectToDatabase();
    await db.collection('api_keys').insertOne(apiKeyRecord);
    
    // Return the API key - this is the only time it will be shown in plain text
    return NextResponse.json({
      id: apiKeyRecord.id,
      name: apiKeyRecord.name,
      key: apiKey,
      created_at: apiKeyRecord.created_at,
    }, { status: 201 });
    
  } catch (error) {
    console.error('API key generation error:', error);
    if (error instanceof z.ZodError) {
      return createErrorResponse('Invalid request data', 400);
    }
    return createErrorResponse('Internal server error', 500);
  }
}

// List API keys
async function handleGet(req: AuthenticatedRequest) {
  try {
    const { db } = await connectToDatabase();
    const userId = getUserId(req.auth.payload);
    
    const apiKeys = await db
      .collection('api_keys')
      .find({ 
        user_id: userId,
        status: 'active'  // Only return active keys
      })
      .project<Omit<ApiKeyRecord, 'key_hash'>>({ key_hash: 0 })
      .toArray();
    
    return NextResponse.json({ api_keys: apiKeys });
    
  } catch (error) {
    console.error('API key list error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

// Route handler
export async function POST(req: NextRequest) {
  return withAuth(req, handlePost, { params: {} });
}

export async function GET(req: NextRequest) {
  return withAuth(req, handleGet, { params: {} });
} 