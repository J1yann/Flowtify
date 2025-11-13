'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getTopTracks, getTopArtists } from '@/lib/spotify-api';
import CrumpledPaper from '@/components/crumpled-paper';

export default function ReceiptPage() {
  const router = useRouter();
  const receiptRef = useRef<HTMLDivElement>(null);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'short_term' | 'medium_term' | 'long_term'>('medium_term');

  useEffect(() => {
    const token = localStorage.getItem('spotify_access_token');
    
    if (!token) {
      router.push('/');
      return;
    }

    setLoading(true);
    
    Promise.all([
      getTopTracks(token, timeRange, 10),
      getTopArtists(token, timeRange, 5)
    ])
      .then(([tracks, artists]) => {
        setData({ 
          tracks: tracks.items, 
          artists: artists.items
        });
      })
      .catch(() => router.push('/'))
      .finally(() => setLoading(false));
  }, [timeRange]);

  const handleDownload = async () => {
    if (!receiptRef.current) return;
    
    try {
      // Use html2canvas to capture the receipt
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(receiptRef.current, {
        backgroundColor: '#f5f5dc',
        scale: 2, // Higher quality
        useCORS: true, // Allow cross-origin images
        allowTaint: true,
        logging: false,
      });
      
      // Convert to blob and download
      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `spotify-receipt-${timeRange}-${Date.now()}.png`;
        link.click();
        URL.revokeObjectURL(url);
      });
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download receipt. Please try again.');
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'My Spotify Receipt',
        text: 'Check out my Spotify listening stats!',
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-[var(--accent-primary)] border-t-transparent rounded-full" />
      </div>
    );
  }

  const timeRangeLabel = {
    short_term: 'Last 4 Weeks',
    medium_term: 'Last 6 Months',
    long_term: 'All Time'
  };

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => router.push('/dashboard')}
          className="mb-6 text-sm px-4 py-2 rounded-full"
          style={{ color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
        >
          ← Back
        </button>

        <div className="flex gap-2 mb-6">
          {(['short_term', 'medium_term', 'long_term'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className="px-4 py-2 rounded-full text-sm transition-all"
              style={{
                background: timeRange === range ? 'var(--accent-primary)' : 'var(--surface)',
                color: timeRange === range ? 'white' : 'var(--text-secondary)',
                border: '1px solid var(--border)'
              }}
            >
              {timeRangeLabel[range]}
            </button>
          ))}
        </div>

        <CrumpledPaper>
          <div ref={receiptRef} className="p-8 font-mono text-sm"
            style={{ color: '#000' }}
          >
              <div className="text-center mb-6 pb-4 border-b-2 border-dashed border-black">
                <div className="text-2xl font-bold mb-2 tracking-wider">SPOTIFY RECEIPT</div>
                <div className="text-xs">━━━━━━━━━━━━━━━━━━━━━━━━━━</div>
                <div className="mt-2 text-sm">{new Date().toLocaleDateString()}</div>
                <div className="text-xs mt-1 opacity-70">{timeRangeLabel[timeRange]}</div>
              </div>

              <div className="mb-6">
                <div className="font-bold mb-3 text-sm tracking-wide">━━ TOP TRACKS ━━</div>
                {data?.tracks.map((track: any, i: number) => (
                  <div key={track.id} className="mb-3">
                    <div className="flex justify-between items-start">
                      <span className="flex-1">{i + 1}. {track.name.substring(0, 22)}</span>
                      <span className="text-xs opacity-60 ml-2">
                        {Math.floor(track.duration_ms / 60000)}:{String(Math.floor((track.duration_ms % 60000) / 1000)).padStart(2, '0')}
                      </span>
                    </div>
                    <div className="text-xs opacity-60 ml-4 mt-1">
                      by {track.artists[0].name}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mb-6 pb-4 border-b-2 border-dashed border-black">
                <div className="font-bold mb-3 text-sm tracking-wide">━━ TOP ARTISTS ━━</div>
                {data?.artists.map((artist: any, i: number) => (
                  <div key={artist.id} className="mb-2 flex justify-between">
                    <span>{i + 1}. {artist.name}</span>
                    <span className="text-xs opacity-60">★</span>
                  </div>
                ))}
              </div>

              <div className="text-center text-xs pt-4">
                <div className="font-bold">Generated in Flowtify</div>
                <div className="mt-3 text-[10px] opacity-50">
                  Thank you for using my app!
                </div>
                <div className="mt-2">━━━━━━━━━━━━━━━━━━━━━━━━━━</div>
              </div>
          </div>
        </CrumpledPaper>

        <div className="flex justify-center gap-4 mt-6">
          <button
            onClick={handleDownload}
            className="px-6 py-3 rounded-full font-medium transition-all hover:scale-105"
            style={{ background: 'var(--accent-primary)', color: 'white' }}
          >
            📥 Download Receipt
          </button>
          {typeof navigator !== 'undefined' && navigator.share && (
            <button
              onClick={handleShare}
              className="px-6 py-3 rounded-full font-medium transition-all hover:scale-105"
              style={{ background: 'var(--surface)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}
            >
              🔗 Share
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
