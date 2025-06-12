import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { config as appConfig } from './lib/config';

function setCorsHeaders(response: NextResponse): void {
  const { cors } = appConfig.api;
  response.headers.set('Access-Control-Allow-Origin', cors.allowOrigin);
  response.headers.set('Access-Control-Allow-Methods', cors.allowMethods);
  response.headers.set('Access-Control-Allow-Headers', cors.allowHeaders);
  response.headers.set('Access-Control-Max-Age', cors.maxAge);
}

export function middleware(request: NextRequest) {
  try {
    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      const response = new NextResponse(null, { status: 200 });
      setCorsHeaders(response);
      return response;
    }

    // Forward the request to the destination
    const response = NextResponse.next();
    setCorsHeaders(response);
    return response;
  } catch (error) {
    console.error('Middleware error:', error);
    const errorResponse = new NextResponse(
      JSON.stringify({ error: 'Internal Server Error' }),
      { status: 500 }
    );
    setCorsHeaders(errorResponse);
    return errorResponse;
  }
}

export const config = {
  matcher: [
    // Match all API routes
    '/api/:path*',
    // Match all question routes
    '/question/:path*'
  ],
} as const;
