'use client';

import { MapContainer, TileLayer, Marker, Circle, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { AircraftState, UserLocation } from '@/lib/types';

interface MapComponentProps {
  userLocation: UserLocation;
  planes: AircraftState[];
  radius: number;
}

export default function MapComponent({
  userLocation,
  planes,
  radius,
}: MapComponentProps) {
  // User marker icon
  const userIcon = L.divIcon({
    className: 'user-marker',
    html: '<div style="background: #667eea; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.3);"></div>',
    iconSize: [16, 16],
  });

  // Plane marker icon
  const createPlaneIcon = (heading: number | null) => {
    return L.divIcon({
      className: 'plane-marker',
      html: `<div style="transform: rotate(${heading || 0}deg); font-size: 20px;">✈️</div>`,
      iconSize: [20, 20],
    });
  };

  return (
    <div className="map">
      <MapContainer
        center={[userLocation.lat, userLocation.lon]}
        zoom={9}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* User location marker */}
        <Marker
          position={[userLocation.lat, userLocation.lon]}
          icon={userIcon}
        >
          <Popup>You are here</Popup>
        </Marker>

        {/* Search radius circle */}
        <Circle
          center={[userLocation.lat, userLocation.lon]}
          radius={radius * 1000}
          pathOptions={{
            color: '#667eea',
            fillColor: '#667eea',
            fillOpacity: 0.1,
            weight: 2,
          }}
        />

        {/* Plane markers */}
        {planes.map((plane) => (
          <Marker
            key={plane.icao24}
            position={[plane.lat, plane.lon]}
            icon={createPlaneIcon(plane.heading)}
          >
            <Popup>
              <strong>{plane.callsign}</strong>
              <br />
              Altitude:{' '}
              {plane.altitude
                ? Math.round(plane.altitude * 3.28084) + ' ft'
                : 'N/A'}
              <br />
              Speed:{' '}
              {plane.velocity
                ? Math.round(plane.velocity * 3.6) + ' km/h'
                : 'N/A'}
              <br />
              Distance: {plane.distance?.toFixed(1)} km
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
