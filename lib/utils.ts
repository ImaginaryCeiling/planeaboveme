import { AircraftState } from './types';

// Calculate distance between two coordinates (Haversine formula)
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Get bounding box for API query
export function getBoundingBox(lat: number, lon: number, radiusKm: number) {
  const latDelta = radiusKm / 111; // 1 degree lat ≈ 111 km
  const lonDelta = radiusKm / (111 * Math.cos(toRadians(lat)));

  return {
    latMin: lat - latDelta,
    latMax: lat + latDelta,
    lonMin: lon - lonDelta,
    lonMax: lon + lonDelta,
  };
}

// Convert degrees to radians
function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

// Extract airline information from callsign
export function extractAirlineInfo(callsign: string) {
  if (!callsign || callsign === 'Unknown') {
    return { code: null, name: 'Unknown', flightNumber: null };
  }

  // Common airline ICAO codes mapping to IATA codes (for logos)
  const airlineMap: { [key: string]: { iata: string; name: string } } = {
    AAL: { iata: 'AA', name: 'American Airlines' },
    UAL: { iata: 'UA', name: 'United Airlines' },
    DAL: { iata: 'DL', name: 'Delta Air Lines' },
    SWA: { iata: 'WN', name: 'Southwest Airlines' },
    BAW: { iata: 'BA', name: 'British Airways' },
    DLH: { iata: 'LH', name: 'Lufthansa' },
    AFR: { iata: 'AF', name: 'Air France' },
    KLM: { iata: 'KL', name: 'KLM' },
    UAE: { iata: 'EK', name: 'Emirates' },
    QTR: { iata: 'QR', name: 'Qatar Airways' },
    SIA: { iata: 'SQ', name: 'Singapore Airlines' },
    ANA: { iata: 'NH', name: 'All Nippon Airways' },
    JAL: { iata: 'JL', name: 'Japan Airlines' },
    CPA: { iata: 'CX', name: 'Cathay Pacific' },
    QFA: { iata: 'QF', name: 'Qantas' },
    ACA: { iata: 'AC', name: 'Air Canada' },
    THY: { iata: 'TK', name: 'Turkish Airlines' },
    SAS: { iata: 'SK', name: 'SAS' },
    IBE: { iata: 'IB', name: 'Iberia' },
    TAP: { iata: 'TP', name: 'TAP Air Portugal' },
    RYR: { iata: 'FR', name: 'Ryanair' },
    EZY: { iata: 'U2', name: 'easyJet' },
    JBU: { iata: 'B6', name: 'JetBlue' },
    VIR: { iata: 'VS', name: 'Virgin Atlantic' },
    ETH: { iata: 'ET', name: 'Ethiopian Airlines' },
    SAA: { iata: 'SA', name: 'South African Airways' },
    AIC: { iata: 'AI', name: 'Air India' },
    CES: { iata: 'MU', name: 'China Eastern' },
    CSN: { iata: 'CZ', name: 'China Southern' },
    CCA: { iata: 'CA', name: 'Air China' },
  };

  // Extract first 3 characters as airline code
  const icaoCode = callsign.substring(0, 3).toUpperCase();
  const flightNumber = callsign.substring(3).trim();

  const airline = airlineMap[icaoCode];

  return {
    code: airline ? airline.iata : icaoCode,
    name: airline ? airline.name : icaoCode,
    flightNumber: flightNumber || null,
  };
}

// Parse aircraft state from OpenSky API response
export function parseAircraftState(state: any[]): AircraftState {
  const callsign = state[1] ? state[1].trim() : 'Unknown';
  const airlineInfo = extractAirlineInfo(callsign);

  return {
    icao24: state[0],
    callsign: callsign,
    airlineCode: airlineInfo.code,
    airlineName: airlineInfo.name,
    flightNumber: airlineInfo.flightNumber,
    origin: state[2],
    lon: state[5],
    lat: state[6],
    altitude: state[7] || state[13], // barometric or geometric altitude
    velocity: state[9],
    heading: state[10],
    verticalRate: state[11],
    onGround: state[8],
  };
}

// Get airline logo URL
export function getAirlineLogoUrl(airlineCode: string | null): string | null {
  if (!airlineCode) return null;
  return `https://images.kiwi.com/airlines/64/${airlineCode}.png`;
}
