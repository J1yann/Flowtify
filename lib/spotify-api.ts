const BASE_URL = 'https://api.spotify.com/v1';

export async function fetchSpotifyAPI(endpoint: string, token: string) {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Spotify API error: ${response.statusText}`);
  }

  return response.json();
}

export async function getTopTracks(token: string, timeRange: 'short_term' | 'medium_term' | 'long_term' = 'medium_term', limit = 20) {
  return fetchSpotifyAPI(`/me/top/tracks?time_range=${timeRange}&limit=${limit}`, token);
}

export async function getTopArtists(token: string, timeRange: 'short_term' | 'medium_term' | 'long_term' = 'medium_term', limit = 20) {
  return fetchSpotifyAPI(`/me/top/artists?time_range=${timeRange}&limit=${limit}`, token);
}

export async function getRecentlyPlayed(token: string, limit = 50) {
  return fetchSpotifyAPI(`/me/player/recently-played?limit=${limit}`, token);
}

export async function getUserProfile(token: string) {
  return fetchSpotifyAPI('/me', token);
}

export async function getCurrentlyPlaying(token: string) {
  try {
    const response = await fetch(`${BASE_URL}/me/player/currently-playing`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    if (response.status === 204 || !response.ok) {
      return null;
    }
    
    return response.json();
  } catch {
    return null;
  }
}
