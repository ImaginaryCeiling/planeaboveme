# Quick Setup Guide

## Step 1: Get Your Free AviationStack API Key

1. Visit: https://aviationstack.com/signup/free
2. Fill out the signup form
3. Verify your email
4. Go to your dashboard: https://aviationstack.com/dashboard
5. Copy your API Access Key

## Step 2: Add API Key to Your Project

1. Open `.env.local` in this project
2. Replace the empty value:
   ```
   AVIATIONSTACK_API_KEY=your_actual_api_key_here
   ```
3. Save the file

## Step 3: Restart Dev Server

Since you modified the environment variables, restart the dev server:

1. Stop the current server (Ctrl+C or ask Claude to kill it)
2. Run: `npm run dev`
3. Open: http://localhost:3000
4. Check the terminal logs for route data

## What to Expect

Once configured, you should see logs like:
```
[ROUTE API] ✓ Found route for AAL123: { origin: 'JFK', destination: 'LAX' }
```

And route badges will appear on plane cards showing "JFK → LAX"

## Troubleshooting

**Routes still not showing?**
- Check that your API key is correct in `.env.local`
- AviationStack uses callsign matching - some private planes won't have routes
- Free tier has 500 requests/month (should be plenty for testing)

**API key not working?**
- Make sure you activated your account via email
- Check dashboard for API status
- Try a different browser if having issues signing up

## Alternative: Skip Route Data

The app works great without routes! You'll still see:
- All plane positions on map
- Airline logos
- Flight numbers
- Speed, altitude, heading
- Distance from you
