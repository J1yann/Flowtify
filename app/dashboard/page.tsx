'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUserProfile } from '@/lib/spotify-api';
import NowPlaying from '@/components/now-playing';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showRecentModal, setShowRecentModal] = useState(false);
  const [showUniqueModal, setShowUniqueModal] = useState(false);
  const [recentTracks, setRecentTracks] = useState<any[]>([]);
  const [uniqueTracksList, setUniqueTracksList] = useState<any[]>([]);
  const [aiMood, setAiMood] = useState<string>('Analyzing your vibe...');

  useEffect(() => {
    const token = localStorage.getItem('spotify_access_token');
    
    if (!token) {
      router.push('/');
      return;
    }

    Promise.all([
      getUserProfile(token),
      import('@/lib/spotify-api').then(m => m.getTopTracks(token, 'short_term', 5)),
      import('@/lib/spotify-api').then(m => m.getTopArtists(token, 'short_term', 5)),
      import('@/lib/spotify-api').then(m => m.getRecentlyPlayed(token, 50))
    ])
      .then(([userData, topTracks, topArtists, recentlyPlayed]) => {
        // Filter to only today's plays (midnight to midnight)
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        
        const todayItems = recentlyPlayed.items.filter((item: any) => {
          const playedAt = new Date(item.played_at);
          return playedAt >= todayStart;
        });
        
        const topTrackId = topTracks.items[0]?.id;
        const topTrackPlayCount = todayItems.filter((item: any) => item.track.id === topTrackId).length;
        
        // Get unique tracks with their play counts (today only)
        const trackMap = new Map();
        todayItems.forEach((item: any) => {
          const track = item.track;
          if (trackMap.has(track.id)) {
            trackMap.get(track.id).playCount++;
          } else {
            trackMap.set(track.id, { ...track, playCount: 1 });
          }
        });
        
        setUser(userData);
        setRecentTracks(todayItems.slice(0, 20).map((i: any) => i.track));
        setUniqueTracksList(Array.from(trackMap.values()));
        setStats({
          topTrack: topTracks.items[0],
          topTrackPlayCount,
          topArtist: topArtists.items[0],
          totalPlays: todayItems.length,
          uniqueTracks: trackMap.size
        });

        // Fetch AI mood with caching (3 hours)
        fetchAIMood(todayItems, topArtists.items);
      })
      .catch(() => router.push('/'))
      .finally(() => setLoading(false));
  }, [router]);

  const fetchAIMood = async (todayItems: any[], topArtists: any[]) => {
    try {
      // Check cache first
      const cached = localStorage.getItem('aiMoodCache');
      if (cached) {
        const { mood, timestamp } = JSON.parse(cached);
        const threeHoursAgo = Date.now() - (3 * 60 * 60 * 1000); // 3 hours in ms
        
        if (timestamp > threeHoursAgo) {
          console.log('Using cached mood:', mood);
          setAiMood(mood);
          return;
        }
      }

      // No valid cache, fetch from AI
      if (todayItems.length === 0) {
        setAiMood('Start listening to discover your mood! 🎵');
        return;
      }

      console.log('Fetching AI mood for', todayItems.length, 'tracks');

      // Prepare tracks with genre info from artists
      const tracksWithGenres = todayItems.slice(0, 20).map((item: any) => {
        const track = item.track;
        // Try to match artist genres
        const artistGenres = topArtists
          .filter((artist: any) => track.artists?.some((ta: any) => ta.name === artist.name))
          .flatMap((artist: any) => artist.genres || []);
        
        return {
          name: track.name,
          artist: track.artists?.[0]?.name || 'Unknown',
          genres: artistGenres.slice(0, 3) // Top 3 genres
        };
      });

      console.log('Sending tracks to AI:', tracksWithGenres);

      const response = await fetch('/api/detect-mood', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tracks: tracksWithGenres })
      });

      if (!response.ok) {
        console.error('API response not OK:', response.status);
      }

      const data = await response.json();
      console.log('AI response:', data);
      
      const mood = data.mood || 'Vibing with great music! 🎵';
      const isAIGenerated = data.isAIGenerated;
      
      setAiMood(mood);
      
      // Only cache if it's actually AI-generated (not fallback)
      if (isAIGenerated) {
        console.log('Caching AI-generated mood');
        localStorage.setItem('aiMoodCache', JSON.stringify({
          mood,
          timestamp: Date.now()
        }));
      } else {
        console.log('Not caching fallback text');
      }
    } catch (error) {
      console.error('Error fetching AI mood:', error);
      setAiMood('Vibing with great music! 🎵');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-[var(--accent-primary)] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated background gradient blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div 
          className="absolute -top-40 -right-40 w-96 h-96 rounded-full blur-3xl animate-pulse-glow"
          style={{ background: 'var(--accent-primary)' }}
        />
        <div 
          className="absolute top-1/3 left-1/4 w-64 h-64 rounded-full blur-3xl animate-pulse-glow"
          style={{ background: 'var(--accent-tertiary)', animationDelay: '2s' }}
        />
        <div 
          className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full blur-3xl animate-pulse-glow"
          style={{ background: 'var(--accent-secondary)', animationDelay: '1s' }}
        />
        
        {/* Floating music notes */}
        <div className="absolute top-20 left-[10%] text-4xl opacity-20 animate-float">🎵</div>
        <div className="absolute top-40 right-[15%] text-3xl opacity-15 animate-float-delayed">🎶</div>
        <div className="absolute bottom-32 left-[20%] text-5xl opacity-10 animate-float">🎸</div>
        <div className="absolute top-1/2 right-[25%] text-4xl opacity-15 animate-float-delayed">🎧</div>
        <div className="absolute bottom-20 right-[30%] text-3xl opacity-20 animate-float">✨</div>
      </div>

      <nav className="relative border-b backdrop-blur-xl" style={{ borderColor: 'var(--border)', background: 'var(--surface-overlay)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-semibold bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] bg-clip-text text-transparent">
              Flowtify
            </h1>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium" style={{ background: 'var(--accent-primary)', color: 'white' }}>
                  {user?.display_name?.[0]?.toUpperCase()}
                </div>
                <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{user?.display_name}</span>
              </div>
              <button
                onClick={() => {
                  localStorage.clear();
                  router.push('/');
                }}
                className="text-sm px-4 py-2 rounded-full transition-all hover:scale-105"
                style={{ color: 'var(--text-secondary)', border: '1px solid var(--border)', background: 'var(--surface)' }}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8 animate-bounce-in">
          <h2 className="text-4xl font-bold mb-3 bg-gradient-to-r from-[var(--accent-primary)] via-[var(--accent-tertiary)] to-[var(--accent-secondary)] bg-clip-text text-transparent">
            Hey {user?.display_name?.split(' ')[0]}! 👋✨
          </h2>
          <p className="text-xl" style={{ color: 'var(--text-secondary)' }}>
            Your music taste is looking fire today 🔥
          </p>
        </div>

        {/* Live stats - moved to top */}
        {stats && (
          <div className="mb-12 space-y-6 animate-bounce-in" style={{ animationDelay: '0.1s' }}>
            <h3 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
              Today's Vibes 🎧💫
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Top Track Card */}
              <div className="group p-6 rounded-2xl backdrop-blur-xl transition-all duration-300 hover:scale-[1.03] hover:rotate-1 cursor-pointer" style={{ 
                background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-tertiary), var(--accent-secondary))',
                boxShadow: '0 12px 32px var(--shadow)'
              }}>
                <div className="flex items-start gap-4">
                  {stats.topTrack?.album?.images?.[0] && (
                    <img 
                      src={stats.topTrack.album.images[0].url} 
                      alt={stats.topTrack.name}
                      className="w-16 h-16 rounded-lg shadow-lg"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium mb-1 opacity-90" style={{ color: 'white' }}>
                      🔥 Your Top Track This Month
                    </div>
                    <h4 className="font-semibold text-lg mb-1 truncate" style={{ color: 'white' }}>
                      {stats.topTrack?.name}
                    </h4>
                    <p className="text-sm opacity-90 truncate" style={{ color: 'white' }}>
                      {stats.topTrack?.artists?.[0]?.name}
                    </p>
                    <div className="mt-2 text-xs font-medium opacity-90" style={{ color: 'white' }}>
                      Played {stats.topTrackPlayCount} {stats.topTrackPlayCount === 1 ? 'time' : 'times'} recently
                    </div>
                  </div>
                </div>
              </div>

              {/* Top Artist Card */}
              <div className="group p-6 rounded-2xl backdrop-blur-xl transition-all duration-300 hover:scale-[1.03] hover:-rotate-1 cursor-pointer" style={{ 
                background: 'var(--surface)',
                border: '2px solid var(--border)',
                boxShadow: '0 12px 32px var(--shadow)'
              }}>
                <div className="flex items-start gap-4">
                  {stats.topArtist?.images?.[0] && (
                    <img 
                      src={stats.topArtist.images[0].url} 
                      alt={stats.topArtist.name}
                      className="w-16 h-16 rounded-full shadow-lg"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                      ⭐ Your Top Artist This Month
                    </div>
                    <h4 className="font-semibold text-lg mb-1 truncate" style={{ color: 'var(--text-primary)' }}>
                      {stats.topArtist?.name}
                    </h4>
                    <p className="text-sm truncate" style={{ color: 'var(--text-secondary)' }}>
                      {stats.topArtist?.genres?.slice(0, 2).join(', ') || 'Artist'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button
                onClick={() => setShowRecentModal(true)}
                className="p-6 rounded-2xl text-center backdrop-blur-xl transition-all hover:scale-110 hover:-translate-y-1 cursor-pointer" 
                style={{ 
                  background: 'var(--surface)',
                  border: '2px solid var(--border)',
                  boxShadow: '0 8px 24px var(--shadow)'
                }}
              >
                <div className="text-3xl font-bold mb-1" style={{ color: 'var(--accent-primary)' }}>
                  {stats.totalPlays}
                </div>
                <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Today's Plays
                </div>
                <div className="text-xs mt-1" style={{ color: 'var(--accent-primary)' }}>
                  Click to view
                </div>
              </button>

              <button
                onClick={() => setShowUniqueModal(true)}
                className="p-6 rounded-2xl text-center backdrop-blur-xl transition-all hover:scale-110 hover:-translate-y-1 cursor-pointer" 
                style={{ 
                  background: 'var(--surface)',
                  border: '2px solid var(--border)',
                  boxShadow: '0 8px 24px var(--shadow)'
                }}
              >
                <div className="text-3xl font-bold mb-1" style={{ color: 'var(--accent-primary)' }}>
                  {stats.uniqueTracks}
                </div>
                <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Unique Tracks
                </div>
                <div className="text-xs mt-1" style={{ color: 'var(--accent-primary)' }}>
                  Click to view
                </div>
              </button>

              <div className="p-6 rounded-2xl backdrop-blur-xl transition-all hover:scale-105 hover:-translate-y-1 col-span-2 overflow-hidden flex flex-col items-center justify-center" style={{ 
                background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-tertiary))',
                boxShadow: '0 8px 24px var(--shadow)',
                minHeight: '120px'
              }}>
                <div className="text-xs font-medium mb-2 opacity-90" style={{ color: 'white' }}>
                  Let me guess...
                </div>
                <div className="text-sm font-semibold leading-relaxed text-center" style={{ color: 'white' }}>
                  {aiMood}
                </div>
              </div>


            </div>
          </div>
        )}

        <div className="space-y-6 animate-bounce-in" style={{ animationDelay: '0.2s' }}>
          <h3 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Create Something Cool!
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button
            onClick={() => router.push('/dashboard/weekly-stats')}
            className="group relative p-8 rounded-2xl text-left transition-all duration-300 hover:-translate-y-3 hover:scale-[1.02] hover:rotate-1 overflow-hidden"
            style={{ 
              background: 'var(--surface)',
              border: '2px solid var(--border)',
              boxShadow: '0 8px 24px var(--shadow)'
            }}
          >
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" 
              style={{ background: 'linear-gradient(135deg, rgba(255, 107, 157, 0.15), rgba(199, 125, 255, 0.15))' }}
            />
            <div className="relative">
              <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                Weekly Stats
              </h2>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                See what you've been vibing to this week with shareable cards
              </p>
              <div className="mt-4 flex items-center gap-2 text-sm font-medium" style={{ color: 'var(--accent-primary)' }}>
                Explore <span className="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </div>
          </button>

          <button
            onClick={() => router.push('/dashboard/receipt')}
            className="group relative p-8 rounded-2xl text-left transition-all duration-300 hover:-translate-y-3 hover:scale-[1.02] overflow-hidden"
            style={{ 
              background: 'var(--surface)',
              border: '2px solid var(--border)',
              boxShadow: '0 8px 24px var(--shadow)'
            }}
          >
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" 
              style={{ background: 'linear-gradient(135deg, rgba(255, 160, 122, 0.15), rgba(255, 107, 157, 0.15))' }}
            />
            <div className="relative">
              <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                Spotify Receipt
              </h2>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                Your listening history as a cute little receipt you can print or share
              </p>
              <div className="mt-4 flex items-center gap-2 text-sm font-medium" style={{ color: 'var(--accent-primary)' }}>
                Create <span className="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </div>
          </button>

          <button
            onClick={() => router.push('/dashboard/wrapped')}
            className="group relative p-8 rounded-2xl text-left transition-all duration-300 hover:-translate-y-3 hover:scale-[1.02] hover:-rotate-1 overflow-hidden"
            style={{ 
              background: 'var(--surface)',
              border: '2px solid var(--border)',
              boxShadow: '0 8px 24px var(--shadow)'
            }}
          >
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" 
              style={{ background: 'linear-gradient(135deg, rgba(199, 125, 255, 0.15), rgba(255, 160, 122, 0.15))' }}
            />
            <div className="relative">
              <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                DIY Wrapped
              </h2>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                Why wait for December? Make your own year-in-review anytime
              </p>
              <div className="mt-4 flex items-center gap-2 text-sm font-medium" style={{ color: 'var(--accent-primary)' }}>
                Build <span className="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </div>
          </button>
        </div>
        </div>
      </main>

      {/* Recent Plays Modal */}
      {showRecentModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          style={{ background: 'rgba(0, 0, 0, 0.7)' }}
          onClick={() => setShowRecentModal(false)}
        >
          <div 
            className="max-w-2xl w-full max-h-[80vh] overflow-y-auto rounded-2xl p-6"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                Recently Played Songs
              </h3>
              <button
                onClick={() => setShowRecentModal(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110"
                style={{ background: 'var(--surface-overlay)', color: 'var(--text-secondary)' }}
              >
                ✕
              </button>
            </div>
            <div className="space-y-3">
              {recentTracks.map((track: any, i: number) => (
                <div 
                  key={`${track.id}-${i}`}
                  className="flex items-center gap-3 p-3 rounded-xl transition-all hover:scale-[1.02]"
                  style={{ background: 'var(--surface-overlay)' }}
                >
                  {track.album?.images?.[2] && (
                    <img 
                      src={track.album.images[2].url} 
                      alt={track.name}
                      className="w-12 h-12 rounded-lg"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                      {i + 1}. {track.name}
                    </div>
                    <div className="text-sm truncate" style={{ color: 'var(--text-secondary)' }}>
                      {track.artists?.map((a: any) => a.name).join(', ')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Now Playing Widget */}
      <NowPlaying />

      {/* Unique Tracks Modal */}
      {showUniqueModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          style={{ background: 'rgba(0, 0, 0, 0.7)' }}
          onClick={() => setShowUniqueModal(false)}
        >
          <div 
            className="max-w-2xl w-full max-h-[80vh] overflow-y-auto rounded-2xl p-6"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                Your Unique Tracks
              </h3>
              <button
                onClick={() => setShowUniqueModal(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110"
                style={{ background: 'var(--surface-overlay)', color: 'var(--text-secondary)' }}
              >
                ✕
              </button>
            </div>
            <div className="space-y-3">
              {uniqueTracksList
                .sort((a, b) => b.playCount - a.playCount)
                .map((track: any, i: number) => (
                <div 
                  key={track.id}
                  className="flex items-center gap-3 p-3 rounded-xl transition-all hover:scale-[1.02]"
                  style={{ background: 'var(--surface-overlay)' }}
                >
                  {track.album?.images?.[2] && (
                    <img 
                      src={track.album.images[2].url} 
                      alt={track.name}
                      className="w-12 h-12 rounded-lg"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                      {i + 1}. {track.name}
                    </div>
                    <div className="text-sm truncate" style={{ color: 'var(--text-secondary)' }}>
                      {track.artists?.map((a: any) => a.name).join(', ')}
                    </div>
                  </div>
                  <div className="text-sm font-medium px-3 py-1 rounded-full" style={{ 
                    background: 'var(--accent-primary)', 
                    color: 'white' 
                  }}>
                    {track.playCount}×
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
