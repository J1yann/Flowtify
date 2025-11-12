# Flowtify

A modern, minimal web app that transforms Spotify listening data into elegant, shareable visual artifacts.

## Features

- **Weekly Listening Stats**: Mini-Wrapped style cards showing your recent listening patterns
- **Spotify Receipt**: Receiptify-inspired printable receipt of your top tracks and artists
- **DIY Mini-Wrapped**: Customizable year-in-review with gradient-rich, typography-driven slides

## Tech Stack

- Next.js 16 (App Router)
- React 19
- Tailwind CSS v4
- Bun v1.2+
- Spotify Web API (OAuth 2.0 PKCE)

## Setup

1. Create a Spotify App at [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Add `http://localhost:3000/callback` to your app's Redirect URIs
3. Copy `.env.local.example` to `.env.local` and fill in your credentials:

```bash
NEXT_PUBLIC_SPOTIFY_CLIENT_ID=your_client_id
NEXT_PUBLIC_SPOTIFY_REDIRECT_URI=http://localhost:3000/callback
```

4. Install dependencies and run:

```bash
bun install
bun dev
```

5. Open [http://localhost:3000](http://localhost:3000)

## Design System

Flowtify uses a custom design system with:
- Glassmorphism/soft UI aesthetic
- Dark mode first with light mode toggle
- Fluid typography and responsive layouts
- Spring-based micro-interactions
- Performance-optimized (target: Lighthouse ≥95)

## Performance Budget

- TTI < 1.8s on 3G
- Initial bundle < 170KB (gzipped)
- Mobile-first, touch-friendly (≥48px tap targets)

## License

MIT


## AI Features (Optional)

Flowtify can use Google's Gemini AI to generate personalized music insights in the DIY Wrapped section.

### Enable AI:
1. Set `NEXT_PUBLIC_ENABLE_AI=true` in your `.env.local`
2. Get a free Gemini API Key from [Google AI Studio](https://aistudio.google.com/app/apikey)
3. Add it to your `.env.local`:
   ```
   NEXT_PUBLIC_ENABLE_AI=true
   GEMINI_API_KEY=your_api_key_here
   ```

### Disable AI:
Set `NEXT_PUBLIC_ENABLE_AI=false` in your `.env.local` to use default insights instead.

The free tier includes 15 requests per minute, which is more than enough for this app!
