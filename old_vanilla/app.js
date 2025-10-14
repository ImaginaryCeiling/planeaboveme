// Configuration
const CONFIG = {
    radiusKm: 50, // Search radius in kilometers
    refreshInterval: 15000, // Refresh every 15 seconds
    openSkyApiUrl: 'https://opensky-network.org/api/states/all'
};

// Global state
let userLocation = null;
let map = null;
let markers = [];
let userMarker = null;

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    getUserLocation();
});

// Get user's location
function getUserLocation() {
    if (!navigator.geolocation) {
        showError('Geolocation is not supported by your browser');
        return;
    }

    navigator.geolocation.getCurrentPosition(
        (position) => {
            userLocation = {
                lat: position.coords.latitude,
                lon: position.coords.longitude
            };

            hideElement('status');
            showElement('location-info');
            updateLocationDisplay();
            initializeMap();
            fetchFlightData();

            // Auto-refresh
            setInterval(fetchFlightData, CONFIG.refreshInterval);
        },
        (error) => {
            let message = 'Unable to get your location. ';
            switch(error.code) {
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
            showError(message);
        }
    );
}

// Initialize the map
function initializeMap() {
    showElement('map');

    map = L.map('map').setView([userLocation.lat, userLocation.lon], 9);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
    }).addTo(map);

    // Add user location marker
    userMarker = L.marker([userLocation.lat, userLocation.lon], {
        icon: L.divIcon({
            className: 'user-marker',
            html: '<div style="background: #667eea; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.3);"></div>',
            iconSize: [16, 16]
        })
    }).addTo(map).bindPopup('You are here');

    // Draw search radius circle
    L.circle([userLocation.lat, userLocation.lon], {
        radius: CONFIG.radiusKm * 1000,
        color: '#667eea',
        fillColor: '#667eea',
        fillOpacity: 0.1,
        weight: 2
    }).addTo(map);
}

// Fetch flight data from OpenSky API
async function fetchFlightData() {
    try {
        // Calculate bounding box
        const bounds = getBoundingBox(userLocation.lat, userLocation.lon, CONFIG.radiusKm);

        const url = `${CONFIG.openSkyApiUrl}?lamin=${bounds.latMin}&lomin=${bounds.lonMin}&lamax=${bounds.latMax}&lomax=${bounds.lonMax}`;

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error('Failed to fetch flight data');
        }

        const data = await response.json();
        processFlightData(data);
        updateLastUpdate();

    } catch (error) {
        console.error('Error fetching flight data:', error);
        showError('Failed to fetch flight data. The OpenSky API might be temporarily unavailable.');
    }
}

// Process and display flight data
function processFlightData(data) {
    if (!data.states || data.states.length === 0) {
        displayNoPlanes();
        return;
    }

    // Clear existing plane markers
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];

    // Process each aircraft
    const planes = data.states
        .map(state => parseAircraftState(state))
        .filter(plane => plane.lat && plane.lon)
        .map(plane => {
            plane.distance = calculateDistance(
                userLocation.lat,
                userLocation.lon,
                plane.lat,
                plane.lon
            );
            return plane;
        })
        .filter(plane => plane.distance <= CONFIG.radiusKm)
        .sort((a, b) => a.distance - b.distance);

    if (planes.length === 0) {
        displayNoPlanes();
        return;
    }

    displayPlanes(planes);
    addPlaneMarkers(planes);
}

// Parse aircraft state from OpenSky API response
function parseAircraftState(state) {
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
        onGround: state[8]
    };
}

// Extract airline information from callsign
function extractAirlineInfo(callsign) {
    if (!callsign || callsign === 'Unknown') {
        return { code: null, name: 'Unknown', flightNumber: null };
    }

    // Common airline ICAO codes mapping to IATA codes (for logos)
    const airlineMap = {
        'AAL': { iata: 'AA', name: 'American Airlines' },
        'UAL': { iata: 'UA', name: 'United Airlines' },
        'DAL': { iata: 'DL', name: 'Delta Air Lines' },
        'SWA': { iata: 'WN', name: 'Southwest Airlines' },
        'BAW': { iata: 'BA', name: 'British Airways' },
        'DLH': { iata: 'LH', name: 'Lufthansa' },
        'AFR': { iata: 'AF', name: 'Air France' },
        'KLM': { iata: 'KL', name: 'KLM' },
        'UAE': { iata: 'EK', name: 'Emirates' },
        'QTR': { iata: 'QR', name: 'Qatar Airways' },
        'SIA': { iata: 'SQ', name: 'Singapore Airlines' },
        'ANA': { iata: 'NH', name: 'All Nippon Airways' },
        'JAL': { iata: 'JL', name: 'Japan Airlines' },
        'CPA': { iata: 'CX', name: 'Cathay Pacific' },
        'QFA': { iata: 'QF', name: 'Qantas' },
        'ACA': { iata: 'AC', name: 'Air Canada' },
        'THY': { iata: 'TK', name: 'Turkish Airlines' },
        'SAS': { iata: 'SK', name: 'SAS' },
        'IBE': { iata: 'IB', name: 'Iberia' },
        'TAP': { iata: 'TP', name: 'TAP Air Portugal' },
        'RYR': { iata: 'FR', name: 'Ryanair' },
        'EZY': { iata: 'U2', name: 'easyJet' },
        'JBU': { iata: 'B6', name: 'JetBlue' },
        'VIR': { iata: 'VS', name: 'Virgin Atlantic' },
        'ETH': { iata: 'ET', name: 'Ethiopian Airlines' },
        'SAA': { iata: 'SA', name: 'South African Airways' },
        'AIC': { iata: 'AI', name: 'Air India' },
        'CES': { iata: 'MU', name: 'China Eastern' },
        'CSN': { iata: 'CZ', name: 'China Southern' },
        'CCA': { iata: 'CA', name: 'Air China' }
    };

    // Extract first 3 characters as airline code
    const icaoCode = callsign.substring(0, 3).toUpperCase();
    const flightNumber = callsign.substring(3).trim();

    const airline = airlineMap[icaoCode];

    return {
        code: airline ? airline.iata : icaoCode,
        name: airline ? airline.name : icaoCode,
        flightNumber: flightNumber || null
    };
}

// Get airline logo URL
function getAirlineLogoUrl(airlineCode) {
    if (!airlineCode) return null;
    // Using a free airline logo CDN
    return `https://images.kiwi.com/airlines/64/${airlineCode}.png`;
}

// Display planes in the UI
function displayPlanes(planes) {
    showElement('planes-container');

    const planesList = document.getElementById('planes-list');
    const planeCount = document.getElementById('plane-count');

    planeCount.textContent = planes.length;
    planesList.innerHTML = '';

    // Note: Route fetching removed due to CORS restrictions
    // OpenSky API doesn't allow direct browser access to routes endpoint
    planes.forEach(plane => {
        const card = createPlaneCard(plane);
        planesList.appendChild(card);
    });
}

// Create a plane card element
function createPlaneCard(plane) {
    const card = document.createElement('div');
    card.className = 'plane-card';

    const altitude = plane.altitude ? Math.round(plane.altitude) + ' m' : 'N/A';
    const altitudeFt = plane.altitude ? Math.round(plane.altitude * 3.28084) + ' ft' : 'N/A';
    const velocity = plane.velocity ? Math.round(plane.velocity * 3.6) + ' km/h' : 'N/A';
    const heading = plane.heading !== null ? Math.round(plane.heading) + '°' : 'N/A';
    const verticalRate = plane.verticalRate ? (plane.verticalRate > 0 ? '↑ ' : '↓ ') + Math.abs(Math.round(plane.verticalRate)) + ' m/s' : 'Level';

    // Airline logo and info
    const logoUrl = plane.airlineCode ? getAirlineLogoUrl(plane.airlineCode) : null;
    const airlineLogoHtml = logoUrl
        ? `<img src="${logoUrl}" alt="${plane.airlineName}" class="airline-logo" onerror="this.style.display='none'">`
        : '';

    const airlineInfoHtml = plane.airlineName !== 'Unknown'
        ? `<div class="airline-info">
               ${airlineLogoHtml}
               <div class="airline-details">
                   <div class="airline-name">${plane.airlineName}</div>
                   ${plane.flightNumber ? `<div class="flight-number">Flight ${plane.flightNumber}</div>` : ''}
               </div>
           </div>`
        : '';

    card.innerHTML = `
        <div class="plane-header">
            <div class="plane-main-info">
                <div class="plane-callsign">${plane.callsign}</div>
                ${airlineInfoHtml}
            </div>
            <div class="plane-distance">${plane.distance.toFixed(1)} km</div>
        </div>
        <div class="plane-details">
            <div class="detail-item">
                <div class="detail-label">Altitude</div>
                <div class="detail-value">${altitudeFt}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Speed</div>
                <div class="detail-value">${velocity}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Heading</div>
                <div class="detail-value">${heading}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Vertical Rate</div>
                <div class="detail-value">${verticalRate}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Status</div>
                <div class="detail-value">${plane.onGround ? '🛬 On Ground' : '✈️ Airborne'}</div>
            </div>
        </div>
    `;

    return card;
}

// Add plane markers to the map
function addPlaneMarkers(planes) {
    planes.forEach(plane => {
        const icon = L.divIcon({
            className: 'plane-marker',
            html: `<div style="transform: rotate(${plane.heading || 0}deg); font-size: 20px;">✈️</div>`,
            iconSize: [20, 20]
        });

        const marker = L.marker([plane.lat, plane.lon], { icon })
            .addTo(map)
            .bindPopup(`
                <strong>${plane.callsign}</strong><br>
                Altitude: ${plane.altitude ? Math.round(plane.altitude * 3.28084) + ' ft' : 'N/A'}<br>
                Speed: ${plane.velocity ? Math.round(plane.velocity * 3.6) + ' km/h' : 'N/A'}<br>
                Distance: ${plane.distance.toFixed(1)} km
            `);

        markers.push(marker);
    });
}

// Display "no planes" message
function displayNoPlanes() {
    showElement('planes-container');

    const planesList = document.getElementById('planes-list');
    const planeCount = document.getElementById('plane-count');

    planeCount.textContent = '0';
    planesList.innerHTML = '<div class="no-planes">No aircraft detected within 50km radius 🔍</div>';

    // Clear plane markers
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];
}

// Calculate distance between two coordinates (Haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

// Get bounding box for API query
function getBoundingBox(lat, lon, radiusKm) {
    const latDelta = radiusKm / 111; // 1 degree lat ≈ 111 km
    const lonDelta = radiusKm / (111 * Math.cos(toRadians(lat)));

    return {
        latMin: lat - latDelta,
        latMax: lat + latDelta,
        lonMin: lon - lonDelta,
        lonMax: lon + lonDelta
    };
}

// Convert degrees to radians
function toRadians(degrees) {
    return degrees * Math.PI / 180;
}

// Update location display
function updateLocationDisplay() {
    document.getElementById('user-coords').textContent =
        `${userLocation.lat.toFixed(4)}, ${userLocation.lon.toFixed(4)}`;
}

// Update last update time
function updateLastUpdate() {
    const now = new Date();
    document.getElementById('last-update').textContent =
        now.toLocaleTimeString();
}

// UI helper functions
function showElement(id) {
    document.getElementById(id).classList.remove('hidden');
}

function hideElement(id) {
    document.getElementById(id).classList.add('hidden');
}

function showError(message) {
    hideElement('status');
    hideElement('planes-container');
    hideElement('map');
    hideElement('location-info');
    showElement('error');
    document.getElementById('error-message').textContent = message;
}
