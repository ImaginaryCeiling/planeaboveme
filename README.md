# ✈️ Plane Above Me

Real-time aircraft tracking app that shows planes flying overhead using the OpenSky Network API.

## Features

- 🗺️ Interactive map with real-time aircraft positions
- ✈️ Airline logos and flight information
- 📍 Automatic geolocation
- 🔄 Auto-refresh every 15 seconds
- 🛫 Origin and destination routes
- 📱 Responsive design

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- React Leaflet for maps
- OpenSky Network API
- Vercel for deployment

## Getting Started

### 1. Get your AviationStack API Key (Optional but Recommended)

To enable origin/destination routes for flights:

1. Go to [aviationstack.com/signup/free](https://aviationstack.com/signup/free)
2. Sign up for a free account (500 requests/month)
3. Copy your API key from the dashboard
4. Add it to `.env.local`:

```bash
AVIATIONSTACK_API_KEY=your_api_key_here
```

**Note:** The app works without the API key, but routes won't be displayed.

### 2. Install dependencies

```bash
npm install
```

### 3. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for production

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
4. Add environment variable:
   - Key: `AVIATIONSTACK_API_KEY`
   - Value: Your API key from aviationstack.com
5. Deploy!

**Note:** If you skip the API key, the app will work but won't show flight routes.

## How It Works

1. Gets your location using the browser's Geolocation API
2. Fetches nearby aircraft data from OpenSky Network
3. Displays planes within 50km radius
4. Shows airline info, altitude, speed, heading, and routes
5. Updates automatically every 15 seconds

## API Routes

- `/api/flights` - Fetches aircraft data (proxies OpenSky API)
- `/api/routes/[callsign]` - Fetches route information for specific flights

## License

MIT
