import Image from 'next/image';
import { AircraftState } from '@/lib/types';
import { getAirlineLogoUrl } from '@/lib/utils';

interface PlaneCardProps {
  plane: AircraftState;
}

export default function PlaneCard({ plane }: PlaneCardProps) {
  const altitudeFt = plane.altitude
    ? Math.round(plane.altitude * 3.28084) + ' ft'
    : 'N/A';
  const velocity = plane.velocity
    ? Math.round(plane.velocity * 3.6) + ' km/h'
    : 'N/A';
  const heading =
    plane.heading !== null ? Math.round(plane.heading) + '°' : 'N/A';
  const verticalRate = plane.verticalRate
    ? (plane.verticalRate > 0 ? '↑ ' : '↓ ') +
      Math.abs(Math.round(plane.verticalRate)) +
      ' m/s'
    : 'Level';

  const logoUrl = getAirlineLogoUrl(plane.airlineCode);

  return (
    <div className="plane-card">
      <div className="plane-header">
        <div className="plane-main-info">
          <div className="plane-callsign">{plane.callsign}</div>

          {plane.airlineName !== 'Unknown' && (
            <div className="airline-info">
              {logoUrl && (
                <div className="airline-logo-wrapper">
                  <Image
                    src={logoUrl}
                    alt={plane.airlineName}
                    width={48}
                    height={48}
                    className="airline-logo"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              )}
              <div className="airline-details">
                <div className="airline-name">{plane.airlineName}</div>
                {plane.flightNumber && (
                  <div className="flight-number">
                    Flight {plane.flightNumber}
                  </div>
                )}
              </div>
            </div>
          )}

          {plane.routeInfo &&
            (plane.routeInfo.origin || plane.routeInfo.destination) && (
              <div className="route-info">
                <span className="route-label">Route:</span>
                <span className="route-airports">
                  {plane.routeInfo.origin || '?'} →{' '}
                  {plane.routeInfo.destination || '?'}
                </span>
              </div>
            )}
        </div>

        <div className="plane-distance">
          {plane.distance?.toFixed(1)} km
        </div>
      </div>

      <div className="plane-details">
        <div className="detail-item">
          <div className="detail-label">Altitude</div>
          <div className="detail-value">{altitudeFt}</div>
        </div>
        <div className="detail-item">
          <div className="detail-label">Speed</div>
          <div className="detail-value">{velocity}</div>
        </div>
        <div className="detail-item">
          <div className="detail-label">Heading</div>
          <div className="detail-value">{heading}</div>
        </div>
        <div className="detail-item">
          <div className="detail-label">Vertical Rate</div>
          <div className="detail-value">{verticalRate}</div>
        </div>
        <div className="detail-item">
          <div className="detail-label">Status</div>
          <div className="detail-value">
            {plane.onGround ? '🛬 On Ground' : '✈️ Airborne'}
          </div>
        </div>
      </div>
    </div>
  );
}
