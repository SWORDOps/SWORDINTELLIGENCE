'use client';

import { useEffect, useRef } from 'react';

interface TacticalGridProps {
  opacity?: number;
  animate?: boolean;
}

export function TacticalGrid({ opacity = 0.03, animate = true }: TacticalGridProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const gridSize = 50;
    let animationFrame: number;
    let pulseOffset = 0;

    const drawGrid = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw grid lines
      ctx.strokeStyle = `rgba(0, 255, 136, ${opacity})`;
      ctx.lineWidth = 1;

      // Vertical lines
      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }

      // Horizontal lines
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Draw pulsing nodes at intersections
      if (animate) {
        const pulse = Math.sin(pulseOffset) * 0.5 + 0.5;
        ctx.fillStyle = `rgba(0, 255, 136, ${opacity * 3 * pulse})`;

        for (let x = 0; x < canvas.width; x += gridSize * 4) {
          for (let y = 0; y < canvas.height; y += gridSize * 4) {
            ctx.beginPath();
            ctx.arc(x, y, 2, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        pulseOffset += 0.02;
        animationFrame = requestAnimationFrame(drawGrid);
      }
    };

    drawGrid();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [opacity, animate]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ mixBlendMode: 'screen' }}
    />
  );
}
