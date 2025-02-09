import { NextRequest, NextResponse } from 'next/server';
import { withLogging } from '@/lib/api/logging';

async function handler() {
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
}

export const GET = (req: NextRequest) => withLogging(req, handler)(); 