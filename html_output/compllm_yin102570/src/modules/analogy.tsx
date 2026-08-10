import React, { useEffect, useRef } from 'react';
import { WidgetProps } from './registry';
import { setupCanvas, observeCanvas } from '../lib/canvasKit';

// Shared: an animated vacuum-bag scene. `variant` tweaks the label/count so each
// analogy chapter shows a slightly different framing of the same metaphor.
function BagScene({ variant }: { variant: number }): JSX.Element {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    const cv = ref.current;
    const stop = observeCanvas(
      cv,
      () => {
        const ctx = setupCanvas(cv, 320, 160);
        let t = 0;
        let raf = 0;
        const draw = () => {
          t += 0.02;
          ctx.clearRect(0, 0, 320, 160);
          ctx.fillStyle = '#eef3fb';
          ctx.fillRect(0, 0, 320, 160);
          const n = 5 + (variant % 3);
          for (let i = 0; i < n; i++) {
            const p = clamp01((Math.sin(t + i * 0.5) + 1) / 2);
            const x = 30 + (i % 4) * 70;
            const y = 30 + Math.floor(i / 4) * 60;
            ctx.fillStyle = '#c9d6ee';
            ctx.fillRect(x, y, 50, 40);
            ctx.fillStyle = '#1f9d6b';
            ctx.fillRect(x, y + 40 - p * 30, 50, 30 - (40 - p * 30) + 40 - p * 30);
            ctx.fillStyle = '#1f9d6b';
            const bh = 8 + p * 24;
            ctx.fillRect(x, y + 50 - bh, 50, bh);
          }
          ctx.fillStyle = '#5b6b85';
          ctx.font = '11px sans-serif';
          ctx.fillText('真空袋：蓬松衣物 → 扁砖（CE）', 50, 155);
          raf = requestAnimationFrame(draw);
        };
        draw();
        return () => cancelAnimationFrame(raf);
      },
      () => {}
    );
    return stop;
  }, [variant]);
  return <canvas ref={ref} />;
}

function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v));
}

export const Ana1: React.FC<WidgetProps> = () => <BagScene variant={0} />;
export const Ana2: React.FC<WidgetProps> = () => <BagScene variant={1} />;
export const Ana3: React.FC<WidgetProps> = () => <BagScene variant={2} />;
export const Ana4: React.FC<WidgetProps> = () => <BagScene variant={3} />;
export const Ana5: React.FC<WidgetProps> = () => <BagScene variant={4} />;
export const Ana6: React.FC<WidgetProps> = () => <BagScene variant={5} />;
export const Ana7: React.FC<WidgetProps> = () => <BagScene variant={6} />;
export const Ana8: React.FC<WidgetProps> = () => <BagScene variant={7} />;
export const Ana9: React.FC<WidgetProps> = () => <BagScene variant={8} />;
export const Ana10: React.FC<WidgetProps> = () => <BagScene variant={9} />;
