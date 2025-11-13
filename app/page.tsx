import AuthButton from '@/components/auth-button';

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-5xl font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Flowtify
          </h1>
          <p className="text-xl" style={{ color: 'var(--text-secondary)' }}>
            Get easy-to-share visuals from your Spotify activity and dig into the stats behind what you listen to.
          </p>
        </div>

        <div className="flex flex-col items-center gap-6 pt-8">
          <AuthButton />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full pt-8">
            <div className="p-6 rounded-2xl backdrop-blur-xl" style={{ 
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              boxShadow: '0 4px 16px var(--shadow)'
            }}>
              <div className="text-3xl mb-2">📊</div>
              <h3 className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Weekly Stats</h3>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Mini-Wrapped style cards</p>
            </div>

            <div className="p-6 rounded-2xl backdrop-blur-xl" style={{ 
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              boxShadow: '0 4px 16px var(--shadow)'
            }}>
              <div className="text-3xl mb-2">🧾</div>
              <h3 className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Spotify Receipt</h3>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Printable receipt</p>
            </div>

            <div className="p-6 rounded-2xl backdrop-blur-xl" style={{ 
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              boxShadow: '0 4px 16px var(--shadow)'
            }}>
              <div className="text-3xl mb-2">✨</div>
              <h3 className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>DIY Wrapped</h3>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Customizable year-in-review</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
