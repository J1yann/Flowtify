'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getTopTracks, getTopArtists } from '@/lib/spotify-api';

export default function WrappedPage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  const fetchWrappedInsight = async (tracks: any[], artists: any[], genres: string[]) => {
    try {
      // Check cache first (24 hours)
      const cached = localStorage.getItem('wrappedInsightCache');
      if (cached) {
        const { insight, timestamp } = JSON.parse(cached);
        const twentyFourHoursAgo = Date.now() - (24 * 60 * 60 * 1000); // 24 hours in ms
        
        if (timestamp > twentyFourHoursAgo) {
          console.log('Using cached wrapped insight');
          setData((prev: any) => ({ ...prev, aiInsight: insight }));
          return;
        }
      }

      // No valid cache, fetch from AI
      const aiEnabled = process.env.NEXT_PUBLIC_ENABLE_AI === 'true';
      
      if (aiEnabled) {
        const response = await fetch('/api/generate-insight', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tracks,
            artists,
            genres: genres.slice(0, 8),
            period: 'last month'
          })
        });
        
        const { insight } = await response.json();
        setData((prev: any) => ({ ...prev, aiInsight: insight }));
        
        // Cache the result (only if not default fallback)
        if (insight && !insight.includes('unique and wonderful')) {
          console.log('Caching wrapped insight');
          localStorage.setItem('wrappedInsightCache', JSON.stringify({
            insight,
            timestamp: Date.now()
          }));
        }
      } else {
        setData((prev: any) => ({ 
          ...prev, 
          aiInsight: 'Your music taste this month is unique and wonderful! Keep discovering new sounds.' 
        }));
      }
    } catch (error) {
      console.error('Error fetching wrapped insight:', error);
      setData((prev: any) => ({ 
        ...prev, 
        aiInsight: 'Your music taste this month is unique and wonderful! Keep discovering new sounds.' 
      }));
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('spotify_access_token');
    
    if (!token) {
      router.push('/');
      return;
    }

    Promise.all([
      getTopTracks(token, 'short_term', 10),
      getTopArtists(token, 'short_term', 10)
    ])
      .then(async ([tracks, artists]) => {
        // Prepare detailed data for AI
        const topTracksWithArtists = tracks.items.slice(0, 5).map((t: any) => ({
          name: t.name,
          artist: t.artists[0].name,
          popularity: t.popularity
        }));
        
        const topArtistsWithGenres = artists.items.slice(0, 5).map((a: any) => ({
          name: a.name,
          genres: a.genres?.slice(0, 3) || []
        }));
        
        const allGenres = [...new Set(artists.items.flatMap((a: any) => a.genres || []))] as string[];
        
        setData({ 
          tracks: tracks.items, 
          artists: artists.items,
          aiInsight: 'Generating your personalized insight...'
        });

        // Generate AI insight with caching (24 hours)
        await fetchWrappedInsight(topTracksWithArtists, topArtistsWithGenres, allGenres);
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

  const slides = [
    {
      title: 'This Month\'s Top Artist',
      content: data?.artists[0]?.name,
      subtitle: 'Your most played artist',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    {
      title: 'This Month\'s Top Track',
      content: data?.tracks[0]?.name,
      subtitle: `by ${data?.tracks[0]?.artists[0]?.name}`,
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
    },
    {
      title: 'Great!',
      content: data?.aiInsight || 'Generating your personalized insight...',
      subtitle: 'Powered by Gemini AI',
      gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      isAI: true
    },
    {
      title: 'Top 5 Artists',
      content: data?.artists.slice(0, 5).map((a: any, i: number) => `${i + 1}. ${a.name}`).join('\n'),
      subtitle: 'Last 4 weeks',
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
    },
    {
      title: 'Top 5 Tracks',
      content: data?.tracks.slice(0, 5).map((t: any, i: number) => `${i + 1}. ${t.name}`).join('\n'),
      subtitle: 'Last 4 weeks',
      gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
    }
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <button
        onClick={() => router.push('/dashboard')}
        className="absolute top-4 left-4 text-sm px-4 py-2 rounded-full"
        style={{ color: 'var(--text-secondary)', border: '1px solid var(--border)', background: 'var(--surface)' }}
      >
        ← Back
      </button>

      <div className="max-w-2xl w-full">
        <div 
          className="aspect-square rounded-3xl p-12 flex flex-col items-center justify-center text-center text-white transition-all duration-500"
          style={{ background: slides[currentSlide].gradient }}
        >
          <h2 className="text-4xl font-bold mb-4">{slides[currentSlide].title}</h2>
          <div className={`${slides[currentSlide].isAI ? 'text-xl' : 'text-2xl'} font-medium mb-2 whitespace-pre-line max-w-lg`}>
            {slides[currentSlide].content}
          </div>
          {slides[currentSlide].subtitle && (
            <p className="text-lg opacity-80">{slides[currentSlide].subtitle}</p>
          )}
        </div>

        <div className="flex justify-center gap-2 mt-6">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className="w-2 h-2 rounded-full transition-all"
              style={{ 
                background: i === currentSlide ? 'var(--accent-primary)' : 'var(--border)',
                width: i === currentSlide ? '2rem' : '0.5rem'
              }}
            />
          ))}
        </div>

        <div className="flex justify-between mt-6">
          <button
            onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
            disabled={currentSlide === 0}
            className="px-6 py-3 rounded-full"
            style={{ 
              background: 'var(--surface)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border)',
              opacity: currentSlide === 0 ? 0.5 : 1
            }}
          >
            Previous
          </button>
          <button
            onClick={() => setCurrentSlide(Math.min(slides.length - 1, currentSlide + 1))}
            disabled={currentSlide === slides.length - 1}
            className="px-6 py-3 rounded-full"
            style={{ 
              background: 'var(--accent-primary)',
              color: 'white',
              opacity: currentSlide === slides.length - 1 ? 0.5 : 1
            }}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
