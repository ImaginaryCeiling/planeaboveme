'use client';

import { useEffect, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import PlaneCard from './PlaneCard';
import { AircraftState, UserLocation } from '@/lib/types';
import {
  calculateDistance,
  getBoundingBox,
  parseAircraftState,
} from '@/lib/utils';

// Dynamically import map component to avoid SSR issues with Leaflet
const MapComponent = dynamic(() => import('./MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="map">
      <div className="status">
        <div className="spinner"></div>
        <p>Loading map...</p>
      </div>
    </div>
  ),
});

const RADIUS_KM = 50;
const REFRESH_INTERVAL = 15000;

export default function PlaneTracker() {
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [planes, setPlanes] = useState<AircraftState[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const fetchFlightData = useCallback(async (location: UserLocation) => {
    try {
      const bounds = getBoundingBox(location.lat, location.lon, RADIUS_KM);
      const url = `/api/flights?lamin=${bounds.latMin}&lomin=${bounds.lonMin}&lamax=${bounds.latMax}&lomax=${bounds.lonMax}`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('Failed to fetch flight data');
      }

      const data = await response.json();

      if (!data.states || data.states.length === 0) {
        setPlanes([]);
        setLastUpdate(new Date());
        return;
      }

      // Process aircraft
      const processedPlanes = data.states
        .map((state: any[]) => parseAircraftState(state))
        .filter((plane: AircraftState) => plane.lat && plane.lon)
        .map((plane: AircraftState) => {
          plane.distance = calculateDistance(
            location.lat,
            location.lon,
            plane.lat,
            plane.lon
          );
          return plane;
        })
        .filter((plane: AircraftState) => plane.distance! <= RADIUS_KM)
        .sort((a: AircraftState, b: AircraftState) => a.distance! - b.distance!);

      // Route fetching disabled - free APIs don't have reliable route data
      // Keeping this code commented for reference if you get a paid API key later

      // const planesWithRoutes = await Promise.all(
      //   processedPlanes.map(async (plane: AircraftState) => {
      //     try {
      //       const routeResponse = await fetch(
      //         `/api/routes/${encodeURIComponent(plane.callsign)}`
      //       );
      //       if (routeResponse.ok) {
      //         const routeData = await routeResponse.json();
      //         plane.routeInfo = routeData;
      //       }
      //     } catch (err) {
      //       console.log(`Could not fetch route for ${plane.callsign}`);
      //     }
      //     return plane;
      //   })
      // );
      // setPlanes(planesWithRoutes);

      setPlanes(processedPlanes);
      setLastUpdate(new Date());
    } catch (err) {
      console.error('Error fetching flight data:', err);
      setError('Failed to fetch flight data');
    }
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        };
        setUserLocation(location);
        setLoading(false);
        fetchFlightData(location);

        // Set up auto-refresh
        const interval = setInterval(() => {
          fetchFlightData(location);
        }, REFRESH_INTERVAL);

        return () => clearInterval(interval);
      },
      (error) => {
        let message = 'Unable to get your location. ';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message += 'Please allow location access.';
            break;
          case error.POSITION_UNAVAILABLE:
            message += 'Location information unavailable.';
            break;
          case error.TIMEOUT:
            message += 'Location request timed out.';
            break;
          default:
            message += 'Unknown error occurred.';
        }
        setError(message);
        setLoading(false);
      }
    );
  }, [fetchFlightData]);

  if (loading) {
    return (
      <div className="status">
        <div className="spinner"></div>
        <p>Getting your location...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error">
        <p>⚠️ {error}</p>
        <button onClick={() => window.location.reload()}>Try Again</button>
      </div>
    );
  }

  if (!userLocation) {
    return null;
  }

  return (
    <>
      <div className="location-info">
        <p>
          📍 Your location:{' '}
          <span>
            {userLocation.lat.toFixed(4)}, {userLocation.lon.toFixed(4)}
          </span>
        </p>
        <p>
          🔄 Last updated: <span>{lastUpdate.toLocaleTimeString()}</span>
        </p>
      </div>

      <MapComponent
        userLocation={userLocation}
        planes={planes}
        radius={RADIUS_KM}
      />

      <div className="planes-container">
        <h2>
          Nearby Aircraft (<span>{planes.length}</span>)
        </h2>
        <div className="planes-list">
          {planes.length === 0 ? (
            <div className="no-planes">
              No aircraft detected within 50km radius 🔍
            </div>
          ) : (
            planes.map((plane) => (
              <PlaneCard key={plane.icao24} plane={plane} />
            ))
          )}
        </div>
      </div>
    </>
  );
}
