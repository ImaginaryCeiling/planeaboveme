// ============================================================================
// REFERENCE ONLY - This API endpoint is disabled
// ============================================================================
// Free route APIs don't have reliable data. Keep this code for reference
// if you want to add a paid API service in the future.
//
// Tested APIs (all failed to provide route data for most flights):
// - OpenSky Network: 404 errors, no route data
// - ADSBDB: 404 errors, no route data
// - FlightRadar24: Returns "Array", needs different endpoint structure
//
// To re-enable:
// 1. Rename this folder back to "routes"
// 2. Uncomment route fetching in components/PlaneTracker.tsx
// 3. Uncomment route display in components/PlaneCard.tsx
// 4. Uncomment route CSS in app/globals.css
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';

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

  try {
    console.log(`[ROUTE API] Fetching route for: ${callsign}`);

    // Try FlightRadar24 unofficial API
    // Note: This is an unofficial endpoint for educational use only
    try {
      const fr24Url = `https://data-live.flightradar24.com/clickhandler/?flight=${callsign}`;
      const fr24Response = await fetch(fr24Url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      console.log(`[ROUTE API] FR24 response status for ${callsign}: ${fr24Response.status}`);

      if (fr24Response.ok) {
        const responseText = await fr24Response.text();
        console.log(`[ROUTE API] FR24 raw response for ${callsign}:`, responseText.substring(0, 200));

        // Skip if response is just "Array" or empty
        if (!responseText || responseText === 'Array' || responseText.length < 10) {
          console.log(`[ROUTE API] ✗ FR24 returned empty/invalid data for ${callsign}`);
        } else {
          try {
            const fr24Data = JSON.parse(responseText);
            console.log(`[ROUTE API] FR24 data for ${callsign}:`, JSON.stringify(fr24Data).substring(0, 300));

            // FR24 API returns origin and destination airport codes
            const origin = fr24Data.airport?.origin?.code?.iata || fr24Data.airport?.origin?.code?.icao;
            const destination = fr24Data.airport?.destination?.code?.iata || fr24Data.airport?.destination?.code?.icao;

            if (origin || destination) {
              const result = { origin, destination };
              console.log(`[ROUTE API] ✓ Found route from FR24 for ${callsign}:`, result);
              return NextResponse.json(result);
            } else {
              console.log(`[ROUTE API] ✗ No route data in FR24 response for ${callsign}`);
            }
          } catch (parseError) {
            console.log(`[ROUTE API] FR24 JSON parse failed for ${callsign}`);
          }
        }
      } else {
        console.log(`[ROUTE API] ✗ FR24 API error for ${callsign}: ${fr24Response.status}`);
      }
    } catch (fr24Error) {
      console.log(`[ROUTE API] FR24 fetch failed for ${callsign}:`, fr24Error);
    }

    // Fallback 1: Try ADSBDB API
    try {
      const adsbdbUrl = `https://api.adsbdb.com/v0/callsign/${callsign}`;
      const adsbdbResponse = await fetch(adsbdbUrl);

      if (adsbdbResponse.ok) {
        const data = await adsbdbResponse.json();
        const origin = data.response?.route?.origin || null;
        const destination = data.response?.route?.destination || null;

        if (origin || destination) {
          const result = { origin, destination };
          console.log(`[ROUTE API] ✓ Found route from ADSBDB for ${callsign}:`, result);
          return NextResponse.json(result);
        }
      }
    } catch (adsbdbError) {
      console.log(`[ROUTE API] ADSBDB fetch failed for ${callsign}`);
    }

    // Fallback 2: Try OpenSky routes API
    try {
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
    } catch (openSkyError) {
      console.log(`[ROUTE API] OpenSky fetch failed for ${callsign}`);
    }

    console.log(`[ROUTE API] ✗ No route data available for ${callsign}`);
    return NextResponse.json({ origin: null, destination: null });
  } catch (error) {
    console.error(`[ROUTE API] Error fetching route for ${callsign}:`, error);
    return NextResponse.json({ origin: null, destination: null });
  }
}
