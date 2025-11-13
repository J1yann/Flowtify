'use client';

import { useEffect, useState } from 'react';
import { getCurrentlyPlaying } from '@/lib/spotify-api';

export default function NowPlaying() {
  const [nowPlaying, setNowPlaying] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [position, setPosition] = useState({ x: 24, y: window.innerHeight - 120 }); // bottom-left default
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [mounted, setMounted] = useState(false);

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

  // Load saved position from localStorage and set default bottom-left position
  useEffect(() => {
    setMounted(true);
    const savedPosition = localStorage.getItem('nowPlayingPosition');
    if (savedPosition) {
      setPosition(JSON.parse(savedPosition));
    } else {
      // Set default to bottom-left
      setPosition({ x: 24, y: window.innerHeight - 120 });
    }

    // Handle window resize - keep widget in bounds
    const handleResize = () => {
      setPosition((prev) => {
        const circleSize = 80;
        const maxX = window.innerWidth - circleSize;
        const maxY = window.innerHeight - circleSize;
        
        return {
          x: Math.max(0, Math.min(prev.x, maxX)),
          y: Math.max(0, Math.min(prev.y, maxY))
        };
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle drag - only for minimized state
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isMinimized) return; // Only drag when minimized
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleExpandClick = (e: React.MouseEvent) => {
    if (isDragging) return; // Don't expand if we were dragging
    e.stopPropagation();
    setIsMinimized(false);
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;
      
      // Keep circle fully visible - account for circle size (80px including badge)
      const circleSize = 80;
      const maxX = window.innerWidth - circleSize;
      const maxY = window.innerHeight - circleSize;
      
      const boundedX = Math.max(0, Math.min(newX, maxX));
      const boundedY = Math.max(0, Math.min(newY, maxY));
      
      setPosition({ x: boundedX, y: boundedY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      // Save position to localStorage
      localStorage.setItem('nowPlayingPosition', JSON.stringify(position));
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset, position, isMinimized]);

  if (!nowPlaying) {
    return null;
  }

  const progress = nowPlaying.duration_ms ? (nowPlaying.progress_ms / nowPlaying.duration_ms) * 100 : 0;
  
  // Smart positioning: flip card to stay on screen
  const cardWidth = 320; // w-80 = 320px
  const cardHeight = 180; // approximate height of expanded card
  
  // Horizontal: flip left if circle is on right side
  const shouldFlipLeft = position.x > window.innerWidth / 2;
  const cardX = shouldFlipLeft ? position.x - cardWidth + 80 : position.x; // 80px = circle width
  
  // Vertical: flip up if circle is near bottom
  const shouldFlipUp = position.y > window.innerHeight - cardHeight - 80;
  const cardY = shouldFlipUp ? position.y - cardHeight + 80 : position.y;

  return (
    <>
      {isMinimized ? (
        // Minimized view - draggable circle
        <div
          className="fixed group z-40"
          style={{ 
            left: `${position.x}px`, 
            top: `${position.y}px`,
            cursor: isDragging ? 'grabbing' : 'grab'
          }}
          onMouseDown={handleMouseDown}
        >
          <div 
            onClick={handleExpandClick}
            className="relative cursor-pointer"
            role="button"
            aria-label="Expand now playing"
          >
            {/* Album art with ring */}
            <div 
              className="w-16 h-16 rounded-full p-0.5 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3"
              style={{
                background: isPlaying 
                  ? 'linear-gradient(135deg, var(--accent-primary), var(--accent-tertiary))' 
                  : 'var(--border)'
              }}
            >
              <div className="w-full h-full rounded-full overflow-hidden bg-black">
                {nowPlaying.album?.images?.[0] && (
                  <img 
                    src={nowPlaying.album.images[0].url} 
                    alt={nowPlaying.name}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
            </div>
            
            {/* Music note icon - bottom right */}
            <div 
              className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 group-hover:scale-110"
              style={{ 
                background: 'var(--accent-primary)',
                color: 'white'
              }}
            >
              <span className="text-xs">🎵</span>
            </div>
          </div>
        </div>
      ) : (
        // Expanded view - smart positioning (flips to stay fully visible)
        <div 
          className="fixed w-80 p-4 rounded-2xl backdrop-blur-xl shadow-2xl transition-all duration-300 z-40"
          style={{ 
            left: `${cardX}px`, 
            top: `${cardY}px`,
            background: 'var(--surface)',
            border: '2px solid var(--border)',
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isPlaying ? 'animate-pulse' : ''}`} 
                style={{ background: isPlaying ? '#1DB954' : 'var(--text-secondary)' }} 
              />
              <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                {isPlaying ? 'Now Playing' : 'Paused'}
              </span>
            </div>
            <button
              onClick={() => setIsMinimized(true)}
              className="w-6 h-6 rounded-full flex items-center justify-center transition-all hover:scale-110 hover:bg-opacity-80"
              style={{ background: 'var(--surface-overlay)' }}
              aria-label="Minimize now playing"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: 'var(--text-secondary)' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
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
      )}
    </>
  );
}
