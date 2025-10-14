import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const lamin = searchParams.get('lamin');
  const lomin = searchParams.get('lomin');
  const lamax = searchParams.get('lamax');
  const lomax = searchParams.get('lomax');

  if (!lamin || !lomin || !lamax || !lomax) {
    return NextResponse.json(
      { error: 'Missing required parameters' },
      { status: 400 }
    );
  }

  try {
    const url = `https://opensky-network.org/api/states/all?lamin=${lamin}&lomin=${lomin}&lamax=${lamax}&lomax=${lomax}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error('OpenSky API request failed');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching flights:', error);
    return NextResponse.json(
      { error: 'Failed to fetch flight data' },
      { status: 500 }
    );
  }
}
