'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { exchangeCodeForToken } from '@/lib/spotify';

function CallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const code = searchParams.get('code');
    const errorParam = searchParams.get('error');

    if (errorParam) {
      setError('Authentication failed. Please try again.');
      return;
    }

    if (code) {
      const verifier = sessionStorage.getItem('code_verifier');
      
      if (!verifier) {
        setError('Session expired. Please try again.');
        return;
      }

      exchangeCodeForToken(code, verifier)
        .then((data) => {
          if (data.access_token) {
            localStorage.setItem('spotify_access_token', data.access_token);
            localStorage.setItem('spotify_refresh_token', data.refresh_token);
            localStorage.setItem('spotify_token_expiry', String(Date.now() + data.expires_in * 1000));
            sessionStorage.removeItem('code_verifier');
            router.push('/dashboard');
          } else {
            setError('Failed to get access token');
          }
        })
        .catch(() => {
          setError('Authentication failed. Please try again.');
        });
    }
  }, [searchParams, router]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <p style={{ color: 'var(--text-primary)' }}>{error}</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-2 rounded-full"
            style={{ background: 'var(--accent-primary)', color: 'white' }}
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="animate-spin w-8 h-8 border-4 border-[var(--accent-primary)] border-t-transparent rounded-full mx-auto" />
        <p style={{ color: 'var(--text-secondary)' }}>Connecting to Spotify...</p>
      </div>
    </div>
  );
}

export default function CallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-[var(--accent-primary)] border-t-transparent rounded-full" />
      </div>
    }>
      <CallbackContent />
    </Suspense>
  );
}
