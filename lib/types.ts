export interface AircraftState {
  icao24: string;
  callsign: string;
  airlineCode: string | null;
  airlineName: string;
  flightNumber: string | null;
  origin: string;
  lon: number;
  lat: number;
  altitude: number | null;
  velocity: number | null;
  heading: number | null;
  verticalRate: number | null;
  onGround: boolean;
  distance?: number;
  routeInfo?: RouteInfo | null;
}

export interface RouteInfo {
  origin: string | null;
  destination: string | null;
}

export interface UserLocation {
  lat: number;
  lon: number;
}
