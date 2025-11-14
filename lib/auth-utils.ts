import { refreshAccessToken } from './spotify';

export async function getValidToken(): Promise<string | null> {
  if (typeof window === 'undefined') return null;

  const token = localStorage.getItem('spotify_access_token');
  const refreshToken = localStorage.getItem('spotify_refresh_token');
  const expiry = localStorage.getItem('spotify_token_expiry');

  if (!token || !refreshToken || !expiry) {
    return null;
  }

  const expiryTime = parseInt(expiry);
  const now = Date.now();
  
  // If token expires in less than 5 minutes, refresh it
  if (now >= expiryTime - 5 * 60 * 1000) {
    try {
      const data = await refreshAccessToken(refreshToken);
      
      if (data.access_token) {
        localStorage.setItem('spotify_access_token', data.access_token);
        localStorage.setItem('spotify_token_expiry', String(Date.now() + data.expires_in * 1000));
        
        // Update refresh token if a new one is provided
        if (data.refresh_token) {
          localStorage.setItem('spotify_refresh_token', data.refresh_token);
        }
        
        return data.access_token;
      } else {
        // Refresh failed, clear tokens
        localStorage.removeItem('spotify_access_token');
        localStorage.removeItem('spotify_refresh_token');
        localStorage.removeItem('spotify_token_expiry');
        return null;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      localStorage.removeItem('spotify_access_token');
      localStorage.removeItem('spotify_refresh_token');
      localStorage.removeItem('spotify_token_expiry');
      return null;
    }
  }

  return token;
}

export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  
  const token = localStorage.getItem('spotify_access_token');
  const expiry = localStorage.getItem('spotify_token_expiry');
  
  if (!token || !expiry) return false;
  
  return Date.now() < parseInt(expiry);
}
