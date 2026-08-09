import React, { useEffect, useRef } from 'react';

interface LiveCanvasProps {
  type: 'canvas-matrix' | 'canvas-particles' | 'canvas-cybergrid' | 'canvas-starfield' | 'canvas-rain' | string;
}

export const LiveCanvasWallpaper: React.FC<LiveCanvasProps> = ({ type }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // 1. MATRIX DIGITAL RAIN
    if (type === 'canvas-matrix') {
      const chars = '0123456789ABCDEFｦｱｳｴｵｶｷｹｺｻｼｽｾｿﾀﾂﾃﾅﾆﾇﾈﾊﾋﾎﾏﾐﾑﾒﾓﾔﾕﾗﾘﾜ';
      const fontSize = 14;
      const columns = Math.floor(width / fontSize);
      const drops: number[] = new Array(columns).fill(1);

      const drawMatrix = () => {
        ctx.fillStyle = 'rgba(5, 10, 20, 0.15)';
        ctx.fillRect(0, 0, width, height);

        ctx.fillStyle = '#00f3ff';
        ctx.font = `${fontSize}px monospace`;

        for (let i = 0; i < drops.length; i++) {
          const text = chars[Math.floor(Math.random() * chars.length)];
          const x = i * fontSize;
          const y = drops[i] * fontSize;

          // Highlight lead character
          if (Math.random() > 0.85) {
            ctx.fillStyle = '#ffffff';
          } else {
            ctx.fillStyle = '#00f3ff';
          }

          ctx.fillText(text, x, y);

          if (y > height && Math.random() > 0.975) {
            drops[i] = 0;
          }
          drops[i]++;
        }

        animationFrameId = requestAnimationFrame(drawMatrix);
      };

      drawMatrix();
    }
    // 2. CYBER GRID (SYNTHWAVE PERSPECTIVE HORIZON)
    else if (type === 'canvas-cybergrid') {
      let speed = 0;

      const drawCyberGrid = () => {
        speed = (speed + 0.8) % 40;

        ctx.fillStyle = '#0a0a16';
        ctx.fillRect(0, 0, width, height);

        const horizonY = height * 0.55;

        // Draw Glowing Sun at horizon
        const sunGradient = ctx.createRadialGradient(
          width / 2, horizonY, 10,
          width / 2, horizonY, 180
        );
        sunGradient.addColorStop(0, '#ff007f');
        sunGradient.addColorStop(0.5, '#7928ca');
        sunGradient.addColorStop(1, 'transparent');

        ctx.fillStyle = sunGradient;
        ctx.beginPath();
        ctx.arc(width / 2, horizonY, 180, 0, Math.PI * 2);
        ctx.fill();

        // Horizontal Grid Lines moving forward
        ctx.strokeStyle = 'rgba(0, 243, 255, 0.4)';
        ctx.lineWidth = 1.5;

        for (let y = horizonY; y < height; y += (y - horizonY) * 0.15 + 2) {
          const drawY = y + speed * ((y - horizonY) / height);
          if (drawY > horizonY && drawY < height) {
            ctx.beginPath();
            ctx.moveTo(0, drawY);
            ctx.lineTo(width, drawY);
            ctx.stroke();
          }
        }

        // Perspective Vertical Lines
        const vpX = width / 2;
        const lineCount = 24;
        for (let i = -lineCount; i <= lineCount; i++) {
          const targetX = vpX + i * (width / lineCount) * 1.5;
          ctx.beginPath();
          ctx.moveTo(vpX, horizonY);
          ctx.lineTo(targetX, height);
          ctx.stroke();
        }

        animationFrameId = requestAnimationFrame(drawCyberGrid);
      };

      drawCyberGrid();
    }
    // 3. CONSTELLATION PARTICLES
    else if (type === 'canvas-particles') {
      const numParticles = Math.min(100, Math.floor((width * height) / 12000));
      const particles = Array.from({ length: numParticles }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        radius: Math.random() * 2.5 + 1
      }));

      const drawParticles = () => {
        ctx.fillStyle = '#080d1a';
        ctx.fillRect(0, 0, width, height);

        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          p.x += p.vx;
          p.y += p.vy;

          if (p.x < 0 || p.x > width) p.vx *= -1;
          if (p.y < 0 || p.y > height) p.vy *= -1;

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = '#6366f1';
          ctx.fill();

          // Connect nearby particles
          for (let j = i + 1; j < particles.length; j++) {
            const p2 = particles[j];
            const dx = p.x - p2.x;
            const dy = p.y - p2.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 120) {
              ctx.beginPath();
              ctx.moveTo(p.x, p.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.strokeStyle = `rgba(99, 102, 241, ${1 - dist / 120})`;
              ctx.lineWidth = 0.8;
              ctx.stroke();
            }
          }
        }

        animationFrameId = requestAnimationFrame(drawParticles);
      };

      drawParticles();
    }
    // 4. STARFIELD WARP
    else if (type === 'canvas-starfield') {
      const numStars = 250;
      const stars = Array.from({ length: numStars }, () => ({
        x: (Math.random() - 0.5) * width,
        y: (Math.random() - 0.5) * height,
        z: Math.random() * width
      }));

      const drawStarfield = () => {
        ctx.fillStyle = '#030712';
        ctx.fillRect(0, 0, width, height);

        const cx = width / 2;
        const cy = height / 2;

        for (let i = 0; i < stars.length; i++) {
          const s = stars[i];
          s.z -= 2;

          if (s.z <= 0) {
            s.x = (Math.random() - 0.5) * width;
            s.y = (Math.random() - 0.5) * height;
            s.z = width;
          }

          const k = 128 / s.z;
          const px = s.x * k + cx;
          const py = s.y * k + cy;

          if (px >= 0 && px <= width && py >= 0 && py <= height) {
            const size = (1 - s.z / width) * 3 + 0.5;
            const alpha = 1 - s.z / width;

            ctx.beginPath();
            ctx.arc(px, py, size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
            ctx.fill();
          }
        }

        animationFrameId = requestAnimationFrame(drawStarfield);
      };

      drawStarfield();
    }
    // 5. ATMOSPHERIC NEON RAIN
    else {
      const numDrops = 140;
      const drops = Array.from({ length: numDrops }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        length: Math.random() * 25 + 10,
        speed: Math.random() * 8 + 6
      }));

      const drawRain = () => {
        ctx.fillStyle = 'rgba(10, 15, 30, 0.2)';
        ctx.fillRect(0, 0, width, height);

        ctx.strokeStyle = 'rgba(0, 243, 255, 0.6)';
        ctx.lineWidth = 1.2;

        for (let i = 0; i < drops.length; i++) {
          const d = drops[i];
          ctx.beginPath();
          ctx.moveTo(d.x, d.y);
          ctx.lineTo(d.x - 2, d.y + d.length);
          ctx.stroke();

          d.y += d.speed;
          d.x -= 0.5;

          if (d.y > height) {
            d.y = -d.length;
            d.x = Math.random() * width;
          }
        }

        animationFrameId = requestAnimationFrame(drawRain);
      };

      drawRain();
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [type]);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full object-cover pointer-events-none" />;
};
