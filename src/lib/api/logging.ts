import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

export function withLogging(
  req: NextRequest,
  handler: (req: NextRequest) => Promise<NextResponse>
) {
  return async () => {
    const requestId = uuidv4();
    const startTime = Date.now();
    const method = req.method;
    const url = req.url;

    // Log request
    console.log({
      type: 'request',
      timestamp: new Date().toISOString(),
      request_id: requestId,
      method,
      url,
      headers: Object.fromEntries(req.headers),
    });

    try {
      const response = await handler(req);
      
      // Log response
      console.log({
        type: 'response',
        timestamp: new Date().toISOString(),
        request_id: requestId,
        method,
        url,
        status: response.status,
        duration_ms: Date.now() - startTime,
      });

      // Add request ID to response headers
      response.headers.set('X-Request-ID', requestId);
      
      return response;
    } catch (error) {
      // Log error
      console.error({
        type: 'error',
        timestamp: new Date().toISOString(),
        request_id: requestId,
        method,
        url,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        duration_ms: Date.now() - startTime,
      });

      throw error;
    }
  };
} 