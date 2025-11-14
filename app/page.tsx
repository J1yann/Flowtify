import AuthButton from '@/components/auth-button';

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 md:p-4">
      <div className="max-w-2xl w-full text-center space-y-10 md:space-y-8 py-8 md:py-0">
        <div className="space-y-5 md:space-y-4 px-2">
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Flowtify
          </h1>
          <p className="text-lg md:text-xl leading-relaxed px-4 md:px-0" style={{ color: 'var(--text-secondary)' }}>
            Your music tells a story. We help you see it, share it, and celebrate it.
          </p>
          <p className="text-sm md:text-base px-2 md:px-0" style={{ color: 'var(--text-tertiary)', opacity: 0.8 }}>
            Turn your Spotify listening into beautiful visuals that actually feel like you.
          </p>
        </div>

        <div className="flex flex-col items-center gap-8 md:gap-6 pt-4 md:pt-8">
          <AuthButton />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-4 w-full pt-6 md:pt-8">
            <div className="p-7 md:p-6 rounded-2xl backdrop-blur-xl" style={{ 
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              boxShadow: '0 4px 16px var(--shadow)'
            }}>
              <h3 className="font-medium mb-3 md:mb-2 text-xl md:text-lg" style={{ color: 'var(--text-primary)' }}>Weekly Stats</h3>
              <p className="text-base md:text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>See what you've been vibing to this week with shareable cards</p>
            </div>

            <div className="p-7 md:p-6 rounded-2xl backdrop-blur-xl" style={{ 
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              boxShadow: '0 4px 16px var(--shadow)'
            }}>
              <h3 className="font-medium mb-3 md:mb-2 text-xl md:text-lg" style={{ color: 'var(--text-primary)' }}>Spotify Receipt</h3>
              <p className="text-base md:text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>Your listening history as a cute little receipt you can print or share</p>
            </div>

            <div className="p-7 md:p-6 rounded-2xl backdrop-blur-xl" style={{ 
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              boxShadow: '0 4px 16px var(--shadow)'
            }}>
              <h3 className="font-medium mb-3 md:mb-2 text-xl md:text-lg" style={{ color: 'var(--text-primary)' }}>DIY Wrapped</h3>
              <p className="text-base md:text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>Why wait for December? Make your own year-in-review anytime</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
