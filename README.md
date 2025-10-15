# ✈️ Plane Above Me

Real-time aircraft tracking app that shows planes flying overhead using the OpenSky Network API.

## Features

- 🗺️ Interactive map with real-time aircraft positions
- ✈️ Airline logos and flight information
- 📍 Automatic geolocation
- 🔄 Auto-refresh every 15 seconds
- 📱 Responsive design
- 🚀 Fast & lightweight - no paid APIs required

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- React Leaflet for maps
- OpenSky Network API (real-time aircraft data)
- Vercel for deployment

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Build for production

```bash
npm run build
npm start
```

## Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/planeaboveme)

Or manually:

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Deploy!

No environment variables or configuration needed!

## How It Works

1. Gets your location using the browser's Geolocation API
2. Fetches nearby aircraft data from OpenSky Network
3. Displays planes within 50km radius
4. Shows airline info, altitude, speed, heading, and more
5. Updates automatically every 15 seconds

## API Routes

- `/api/flights` - Fetches aircraft data (proxies OpenSky Network API)

All APIs are free and require no authentication!

## Note on Route Data

Origin/destination route data is not included because free APIs don't provide reliable route information. The route API code is preserved in `app/api/routes-reference/` for reference if you want to integrate a paid service in the future.

## License

MIT
