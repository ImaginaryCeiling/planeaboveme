import { NextRequest, NextResponse } from 'next/server';

const AVIATIONSTACK_API_KEY = process.env.AVIATIONSTACK_API_KEY;

export async function GET(
  request: NextRequest,
  { params }: { params: { callsign: string } }
) {
  const { callsign } = params;

  if (!callsign) {
    return NextResponse.json(
      { error: 'Missing callsign parameter' },
      { status: 400 }
    );
  }

  // Check if API key is configured
  if (!AVIATIONSTACK_API_KEY) {
    console.log(`[ROUTE API] ⚠️  No AviationStack API key configured`);
    return NextResponse.json({ origin: null, destination: null });
  }

  try {
    console.log(`[ROUTE API] Fetching route for: ${callsign}`);

    // Try AviationStack API
    const aviationStackUrl = `http://api.aviationstack.com/v1/flights?access_key=${AVIATIONSTACK_API_KEY}&flight_iata=${callsign}`;
    const aviationStackResponse = await fetch(aviationStackUrl);

    console.log(`[ROUTE API] AviationStack response status for ${callsign}: ${aviationStackResponse.status}`);

    if (aviationStackResponse.ok) {
      const data = await aviationStackResponse.json();
      console.log(`[ROUTE API] AviationStack data for ${callsign}:`, JSON.stringify(data));

      if (data.data && data.data.length > 0) {
        const flight = data.data[0];
        const origin = flight.departure?.iata || flight.departure?.icao;
        const destination = flight.arrival?.iata || flight.arrival?.icao;

        if (origin || destination) {
          const result = { origin, destination };
          console.log(`[ROUTE API] ✓ Found route for ${callsign}:`, result);
          return NextResponse.json(result);
        }
      } else {
        console.log(`[ROUTE API] ✗ No flight data from AviationStack for ${callsign}`);
      }
    } else {
      console.log(`[ROUTE API] ✗ AviationStack API error for ${callsign}: ${aviationStackResponse.status}`);
    }

    // Fallback: Try OpenSky routes API (limited data but free)
    const openSkyUrl = `https://opensky-network.org/api/routes?callsign=${callsign}`;
    const openSkyResponse = await fetch(openSkyUrl);

    if (openSkyResponse.ok) {
      const openSkyData = await openSkyResponse.json();

      if (openSkyData.route && openSkyData.route.length > 0) {
        const result = {
          origin: openSkyData.route[0],
          destination: openSkyData.route[openSkyData.route.length - 1]
        };
        console.log(`[ROUTE API] ✓ Found route from OpenSky for ${callsign}:`, result);
        return NextResponse.json(result);
      }
    }

    console.log(`[ROUTE API] ✗ No route data available for ${callsign}`);
    return NextResponse.json({ origin: null, destination: null });
  } catch (error) {
    console.error(`[ROUTE API] Error fetching route for ${callsign}:`, error);
    return NextResponse.json({ origin: null, destination: null });
  }
}
