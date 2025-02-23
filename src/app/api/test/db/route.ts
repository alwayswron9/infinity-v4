import { NextRequest, NextResponse } from 'next/server';
import { withLogging } from '@/lib/api/logging';
import { pool } from '@/lib/db/postgres';

async function handler() {
  try {
    const startTime = Date.now();
    
    // Test DB connection with a simple query
    const result = await pool.query('SELECT NOW()');
    
    return NextResponse.json({
      status: 'ok',
      message: 'Database connection successful',
      timestamp: result.rows[0].now,
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