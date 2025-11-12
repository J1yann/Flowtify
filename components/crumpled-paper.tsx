'use client';

import { useEffect, useRef } from 'react';

export default function CrumpledPaper({ children }: { children: React.ReactNode }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width = 400;
    const h = canvas.height = 800;

    // Base paper color
    const baseColor = '#f5f5dc';
    ctx.fillStyle = baseColor;
    ctx.fillRect(0, 0, w, h);

    // Generate noise texture
    const generateNoise = (size = 512) => {
      const noise = document.createElement('canvas');
      noise.width = noise.height = size;
      const nctx = noise.getContext('2d');
      if (!nctx) return noise;
      
      const imgData = nctx.createImageData(size, size);
      for (let i = 0; i < imgData.data.length; i += 4) {
        const val = Math.random() * 255;
        imgData.data[i] = imgData.data[i + 1] = imgData.data[i + 2] = val;
        imgData.data[i + 3] = 255;
      }
      nctx.putImageData(imgData, 0, 0);
      return noise;
    };

    const noiseTex = generateNoise(512);
    ctx.globalAlpha = 0.03;
    ctx.drawImage(noiseTex, 0, 0, w, h);
    ctx.globalAlpha = 1;

    // Add lighting simulation for wrinkles
    const imgData = ctx.getImageData(0, 0, w, h);
    const d = imgData.data;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = (y * w + x) * 4;
        const light = (Math.sin(x * 0.02) + Math.cos(y * 0.02)) * 8;
        const depth = ((d[i] - 128) / 255) * 30 + light;
        const shade = 245 + depth;
        d[i] = d[i + 1] = d[i + 2] = Math.min(255, Math.max(0, shade));
      }
    }
    ctx.putImageData(imgData, 0, 0);

    // Add creases
    ctx.strokeStyle = 'rgba(0,0,0,0.06)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 8; i++) {
      const startX = Math.random() * w;
      const startY = Math.random() * h;
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      for (let j = 0; j < 4; j++) {
        ctx.lineTo(
          startX + Math.random() * 80 - 40,
          startY + Math.random() * 80 - 40
        );
      }
      ctx.stroke();
    }

    // Vignette
    const grad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 1.5);
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(1, 'rgba(0,0,0,0.15)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
  }, []);

  return (
    <div className="relative" style={{ perspective: '1000px' }}>
      <div className="relative" style={{ 
        transform: 'rotateX(2deg) rotateY(-1deg)',
        transformStyle: 'preserve-3d'
      }}>
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
          style={{
            maxWidth: '400px',
            margin: '0 auto',
            boxShadow: '0 20px 40px rgba(0,0,0,0.3), inset 0 0 20px rgba(0,0,0,0.05)',
          }}
        />
        <div className="relative z-10" style={{ maxWidth: '400px', margin: '0 auto' }}>
          {children}
        </div>
      </div>
    </div>
  );
}
