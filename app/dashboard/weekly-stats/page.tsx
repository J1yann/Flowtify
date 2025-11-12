'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getRecentlyPlayed } from '@/lib/spotify-api';

export default function WeeklyStatsPage() {
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showTracksModal, setShowTracksModal] = useState(false);
  const [showArtistsModal, setShowArtistsModal] = useState(false);
  const [showRecentModal, setShowRecentModal] = useState(false);
  const [allTracks, setAllTracks] = useState<any[]>([]);
  const [allArtists, setAllArtists] = useState<any[]>([]);
  const [recentPlays, setRecentPlays] = useState<any[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('spotify_access_token');
    
    if (!token) {
      router.push('/');
      return;
    }

    getRecentlyPlayed(token, 50)
      .then((data) => {
        const tracks = data.items.map((item: any) => item.track);
        const uniqueTracks = Array.from(new Map(tracks.map((t: any) => [t.id, t])).values());
        const artists = tracks.map((t: any) => t.artists[0].name);
        const uniqueArtists = [...new Set(artists)];
        
        // Calculate total listening time in milliseconds
        const totalMs = tracks.reduce((sum: number, track: any) => sum + (track.duration_ms || 0), 0);
        const totalMinutes = Math.round(totalMs / 60000);
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        
        // Calculate average track length
        const avgMs = totalMs / tracks.length;
        const avgMinutes = Math.floor(avgMs / 60000);
        const avgSeconds = Math.floor((avgMs % 60000) / 1000);
        
        // Store full lists for modals
        setAllTracks(uniqueTracks);
        setAllArtists(uniqueArtists.map(name => ({ name })));
        setRecentPlays(tracks);
        
        setStats({
          totalPlays: data.items.length,
          uniqueTracks: uniqueTracks.length,
          uniqueArtists: uniqueArtists.length,
          topTrack: tracks[0],
          topArtist: artists[0],
          totalMinutes,
          listeningTime: hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`,
          avgTrackLength: `${avgMinutes}:${avgSeconds.toString().padStart(2, '0')}`,
        });
      })
      .catch(() => router.push('/'))
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-[var(--accent-primary)] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => router.push('/dashboard')}
          className="mb-6 text-sm px-4 py-2 rounded-full"
          style={{ color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
        >
          ← Back
        </button>

        <h1 className="text-3xl font-semibold mb-8" style={{ color: 'var(--text-primary)' }}>
          Weekly Listening Stats
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Total Listening Time - Featured */}
          <div className="md:col-span-2 lg:col-span-1 p-8 rounded-2xl" style={{ 
            background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
            color: 'white'
          }}>
            <div className="text-sm mb-2 opacity-90">🎧 Total Listening Time</div>
            <div className="text-5xl font-bold mb-2">{stats?.listeningTime}</div>
            <div className="text-sm opacity-90">
              That's {stats?.totalMinutes} minutes of pure music
            </div>
          </div>

          <button
            onClick={() => setShowRecentModal(true)}
            className="p-8 rounded-2xl text-left transition-all hover:scale-105 cursor-pointer" 
            style={{ 
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              boxShadow: '0 4px 16px var(--shadow)'
            }}
          >
            <div className="text-5xl font-bold mb-2" style={{ color: 'var(--accent-primary)' }}>
              {stats?.totalPlays}
            </div>
            <div style={{ color: 'var(--text-secondary)' }}>Total Plays</div>
            <div className="text-xs mt-2" style={{ color: 'var(--accent-primary)' }}>
              Click to view all
            </div>
          </button>

          <button
            onClick={() => setShowTracksModal(true)}
            className="p-8 rounded-2xl text-left transition-all hover:scale-105 cursor-pointer" 
            style={{ 
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              boxShadow: '0 4px 16px var(--shadow)'
            }}
          >
            <div className="text-5xl font-bold mb-2" style={{ color: 'var(--accent-primary)' }}>
              {stats?.uniqueTracks}
            </div>
            <div style={{ color: 'var(--text-secondary)' }}>Unique Tracks</div>
            <div className="text-xs mt-2" style={{ color: 'var(--accent-primary)' }}>
              Click to view all
            </div>
          </button>

          <button
            onClick={() => setShowArtistsModal(true)}
            className="p-8 rounded-2xl text-left transition-all hover:scale-105 cursor-pointer" 
            style={{ 
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              boxShadow: '0 4px 16px var(--shadow)'
            }}
          >
            <div className="text-5xl font-bold mb-2" style={{ color: 'var(--accent-primary)' }}>
              {stats?.uniqueArtists}
            </div>
            <div style={{ color: 'var(--text-secondary)' }}>Unique Artists</div>
            <div className="text-xs mt-2" style={{ color: 'var(--accent-primary)' }}>
              Click to view all
            </div>
          </button>

          <div className="p-8 rounded-2xl" style={{ 
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            boxShadow: '0 4px 16px var(--shadow)'
          }}>
            <div className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>⏱️ Avg Track Length</div>
            <div className="text-3xl font-bold mb-1" style={{ color: 'var(--accent-primary)' }}>
              {stats?.avgTrackLength}
            </div>
            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              minutes
            </div>
          </div>

          <div className="p-8 rounded-2xl" style={{ 
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            boxShadow: '0 4px 16px var(--shadow)'
          }}>
            <div className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>🔥 Top Track</div>
            <div className="font-medium truncate" style={{ color: 'var(--text-primary)' }}>
              {stats?.topTrack?.name}
            </div>
            <div className="text-sm mt-1 truncate" style={{ color: 'var(--text-secondary)' }}>
              {stats?.topArtist}
            </div>
          </div>
        </div>
      </div>

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
              {recentPlays.map((track: any, i: number) => (
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
                  <div className="text-xs px-2 py-1 rounded" style={{ 
                    background: 'var(--surface)', 
                    color: 'var(--text-secondary)' 
                  }}>
                    {Math.floor(track.duration_ms / 60000)}:{String(Math.floor((track.duration_ms % 60000) / 1000)).padStart(2, '0')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Unique Tracks Modal */}
      {showTracksModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          style={{ background: 'rgba(0, 0, 0, 0.7)' }}
          onClick={() => setShowTracksModal(false)}
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
                onClick={() => setShowTracksModal(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110"
                style={{ background: 'var(--surface-overlay)', color: 'var(--text-secondary)' }}
              >
                ✕
              </button>
            </div>
            <div className="space-y-3">
              {allTracks.map((track: any, i: number) => (
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
                  <div className="text-xs px-2 py-1 rounded" style={{ 
                    background: 'var(--surface)', 
                    color: 'var(--text-secondary)' 
                  }}>
                    {Math.floor(track.duration_ms / 60000)}:{String(Math.floor((track.duration_ms % 60000) / 1000)).padStart(2, '0')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Unique Artists Modal */}
      {showArtistsModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          style={{ background: 'rgba(0, 0, 0, 0.7)' }}
          onClick={() => setShowArtistsModal(false)}
        >
          <div 
            className="max-w-2xl w-full max-h-[80vh] overflow-y-auto rounded-2xl p-6"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                Your Unique Artists
              </h3>
              <button
                onClick={() => setShowArtistsModal(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110"
                style={{ background: 'var(--surface-overlay)', color: 'var(--text-secondary)' }}
              >
                ✕
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {allArtists.map((artist: any, i: number) => (
                <div 
                  key={i}
                  className="p-4 rounded-xl transition-all hover:scale-[1.02]"
                  style={{ background: 'var(--surface-overlay)' }}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium" 
                      style={{ background: 'var(--accent-primary)', color: 'white' }}>
                      {i + 1}
                    </div>
                    <div className="font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                      {artist.name}
                    </div>
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
