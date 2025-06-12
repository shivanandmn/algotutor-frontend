import { NextRequest, NextResponse } from 'next/server';
import { config } from '@/lib/config';

interface ApiError {
  message: string;
  status: number;
}

function getBackendPath(path: string): string {
  const parts = path.split('/').filter(Boolean);
  const relevantParts = parts.slice(1); // Remove 'api' from the start
  return '/api/' + relevantParts.join('/');
}

async function handleRequest(
  request: NextRequest,
  method: 'GET' | 'POST'
): Promise<NextResponse> {
  const backendPath = getBackendPath(request.nextUrl.pathname);
  const baseUrl = new URL(config.api.url);
  baseUrl.pathname = backendPath;

  if (method === 'GET') {
    const searchParams = request.nextUrl.searchParams.toString();
    if (searchParams) {
      baseUrl.search = searchParams;
    }
  }

  try {
    const headers = new Headers({
      'Authorization': request.headers.get('Authorization') || 'Bearer test',
      'Content-Type': 'application/json'
    });

    const fetchOptions: RequestInit = {
      method,
      headers,
      body: method === 'POST' ? await request.text() : undefined
    };

    const response = await fetch(baseUrl, fetchOptions);

    if (!response.ok) {
      const error: ApiError = {
        message: `Backend returned ${response.status}`,
        status: response.status
      };
      throw error;
    }

    const data = await response.json();

    // Special handling for questions list endpoint
    if (backendPath === '/api/v1/questions' && method === 'GET') {
      const questions = Array.isArray(data) ? data : data?.data || [];
      return NextResponse.json(questions);
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('API proxy error:', error);
    const status = (error as ApiError)?.status || 500;
    const message = (error as ApiError)?.message || 'Internal Server Error';
    
    return NextResponse.json(
      { error: message },
      { status }
    );
  }
}

export async function GET(request: NextRequest) {
  return handleRequest(request, 'GET');
}

export async function POST(request: NextRequest) {
  return handleRequest(request, 'POST');
}

export async function OPTIONS() {
  const { cors } = config.api;
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': cors.allowOrigin,
      'Access-Control-Allow-Methods': cors.allowMethods,
      'Access-Control-Allow-Headers': cors.allowHeaders,
      'Access-Control-Max-Age': cors.maxAge,
    },
  });
}
