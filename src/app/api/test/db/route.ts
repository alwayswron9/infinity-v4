import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/mongodb';
import { withLogging } from '@/lib/api/logging';

async function handler() {
  try {
    const startTime = Date.now();
    const { db } = await connectToDatabase();
    
    // Test DB connection with a simple command
    await db.command({ ping: 1 });
    
    return NextResponse.json({
      status: 'ok',
      message: 'Database connection successful',
      latency_ms: Date.now() - startTime,
    });
  } catch (error) {
    console.error('Database connection test failed:', error);
    return NextResponse.json({
      status: 'error',
      message: 'Database connection failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

export const GET = (req: NextRequest) => withLogging(req, handler)(); 