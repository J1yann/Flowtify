'use client';

export default function CrumpledPaper({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative" style={{ perspective: '1000px' }}>
      <div className="relative" style={{ 
        transform: 'rotateX(1deg)',
        transformStyle: 'preserve-3d'
      }}>
        {/* Crumpled paper background image - using img tag for html2canvas */}
        <img
          src="/design/paper.jpg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          style={{
            maxWidth: '400px',
            margin: '0 auto',
            boxShadow: '0 20px 40px rgba(0,0,0,0.3), inset 0 0 20px rgba(0,0,0,0.05)',
            filter: 'brightness(1.1) contrast(0.95)',
          }}
          crossOrigin="anonymous"
        />
        
        {/* Content overlay */}
        <div className="relative z-10" style={{ maxWidth: '400px', margin: '0 auto' }}>
          {children}
        </div>
      </div>
    </div>
  );
}
