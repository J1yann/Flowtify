'use client';

import { useEffect, useState } from 'react';
import { getCurrentlyPlaying } from '@/lib/spotify-api';

export default function NowPlaying() {
  const [nowPlaying, setNowPlaying] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('spotify_access_token');
    if (!token) return;

    const fetchNowPlaying = async () => {
      const data = await getCurrentlyPlaying(token);
      if (data && data.item) {
        setNowPlaying(data.item);
        setIsPlaying(data.is_playing);
      } else {
        setNowPlaying(null);
        setIsPlaying(false);
      }
    };

    fetchNowPlaying();
    const interval = setInterval(fetchNowPlaying, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }, []);

  if (!nowPlaying) {
    return null;
  }

  const progress = nowPlaying.duration_ms ? (nowPlaying.progress_ms / nowPlaying.duration_ms) * 100 : 0;

  return (
    <div 
      className="fixed bottom-6 right-6 w-80 p-4 rounded-2xl backdrop-blur-xl shadow-2xl transition-all duration-300 hover:scale-105 z-40"
      style={{ 
        background: 'var(--surface)',
        border: '1px solid var(--border)',
      }}
    >
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-2 h-2 rounded-full ${isPlaying ? 'animate-pulse' : ''}`} 
          style={{ background: isPlaying ? '#1DB954' : 'var(--text-secondary)' }} 
        />
        <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
          {isPlaying ? 'Now Playing' : 'Paused'}
        </span>
      </div>
      
      <div className="flex items-center gap-3">
        {nowPlaying.album?.images?.[0] && (
          <img 
            src={nowPlaying.album.images[0].url} 
            alt={nowPlaying.name}
            className="w-16 h-16 rounded-lg shadow-lg"
          />
        )}
        <div className="flex-1 min-w-0">
          <div className="font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
            {nowPlaying.name}
          </div>
          <div className="text-sm truncate" style={{ color: 'var(--text-secondary)' }}>
            {nowPlaying.artists?.map((a: any) => a.name).join(', ')}
          </div>
        </div>
      </div>

      {/* Progress bar */}
      {isPlaying && (
        <div className="mt-3">
          <div className="w-full h-1 rounded-full overflow-hidden" style={{ background: 'var(--surface-overlay)' }}>
            <div 
              className="h-full transition-all duration-1000"
              style={{ 
                background: 'var(--accent-primary)',
                width: `${progress}%`
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
