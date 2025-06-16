import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Get query parameters
  const searchParams = request.nextUrl.searchParams;
  const name = searchParams.get('name');
  const room = searchParams.get('room');

  if (!name || !room) {
    return NextResponse.json({ error: 'Missing name or room parameter' }, { status: 400 });
  }

  try {
    // Forward the request to the LiveKit token service
    const response = await fetch(
      `https://us-central1-openlabel-lab-firebase.cloudfunctions.net/get_token?name=${encodeURIComponent(name)}&room=${encodeURIComponent(room)}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const token = await response.text();
    
    // Return the token as plain text
    return new NextResponse(token, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  } catch (error) {
    console.error('Failed to fetch LiveKit token:', error);
    return NextResponse.json(
      { error: 'Failed to fetch token' },
      { status: 500 }
    );
  }
}
