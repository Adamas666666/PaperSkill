import React, { useEffect, useRef, useState } from 'react';
import { WidgetProps } from './registry';
import { setupCanvas, observeCanvas, clamp, lerpColor } from '../lib/canvasKit';

// ---- Hero: old method (puffy clothes crammed) ----
export const HeroOld: React.FC<WidgetProps> = () => {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    const cv = ref.current;
    const stop = observeCanvas(
      cv,
      () => {
        const ctx = setupCanvas(cv, 320, 200);
        let t = 0;
        let raf = 0;
        const draw = () => {
          t += 0.02;
          ctx.clearRect(0, 0, 320, 200);
          ctx.fillStyle = '#eef3fb';
          ctx.fillRect(0, 0, 320, 200);
          for (let i = 0; i < 60; i++) {
            const x = (i * 53) % 320;
            const y = 40 + ((i * 37) % 140) + Math.sin(t + i) * 4;
            ctx.fillStyle = lerpColor('#c9d6ee', '#e23b3b', (i % 7) / 7);
            ctx.beginPath();
            ctx.arc(x, y, 9, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.fillStyle = '#e23b3b';
          ctx.font = '13px sans-serif';
          ctx.fillText('200K token embeddings 整团塞入 🐢', 12, 190);
          raf = requestAnimationFrame(draw);
        };
        draw();
        return () => cancelAnimationFrame(raf);
      },
      () => {}
    );
    return stop;
  }, []);
  return <canvas ref={ref} />;
};

// ---- Hero: new method (vacuum bricks) ----
export const HeroNew: React.FC<WidgetProps> = () => {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    const cv = ref.current;
    const stop = observeCanvas(
      cv,
      () => {
        const ctx = setupCanvas(cv, 320, 200);
        let t = 0;
        let raf = 0;
        const draw = () => {
          t += 0.02;
          ctx.clearRect(0, 0, 320, 200);
          ctx.fillStyle = '#eef3fb';
          ctx.fillRect(0, 0, 320, 200);
          for (let r = 0; r < 5; r++) {
            for (let c = 0; c < 6; c++) {
              const x = 20 + c * 48;
              const y = 30 + r * 32;
              const p = 1 - clamp(Math.sin(t + r + c) * 0.5 + 0.5, 0, 1) * 0.3;
              ctx.fillStyle = lerpColor('#2f6fed', '#1f9d6b', ((r + c) % 4) / 4);
              ctx.save();
              ctx.translate(x, y);
              ctx.scale(1, p);
              ctx.fillRect(-16, -12, 32, 24);
              ctx.restore();
            }
          }
          ctx.fillStyle = '#1f9d6b';
          ctx.font = '13px sans-serif';
          ctx.fillText('Concept Embeddings 整齐码放 ⚡', 12, 190);
          raf = requestAnimationFrame(draw);
        };
        draw();
        return () => cancelAnimationFrame(raf);
      },
      () => {}
    );
    return stop;
  }, []);
  return <canvas ref={ref} />;
};

// ---- w1: O(N^2) bar by context length ----
export const W1: React.FC<WidgetProps> = () => {
  const ref = useRef<HTMLCanvasElement>(null);
  const [n, setN] = useState(2000);
  useEffect(() => {
    if (!ref.current) return;
    const cv = ref.current;
    const stop = observeCanvas(
      cv,
      () => {
        const ctx = setupCanvas(cv, 320, 200);
        const draw = () => {
          ctx.clearRect(0, 0, 320, 200);
          ctx.fillStyle = '#eef3fb';
          ctx.fillRect(0, 0, 320, 200);
          const v = (n * n) / (200000 * 200000);
          const h = clamp(v * 180, 6, 180);
          ctx.fillStyle = '#e23b3b';
          ctx.fillRect(40, 190 - h, 60, h);
          ctx.fillStyle = '#1c2536';
          ctx.font = '12px sans-serif';
          ctx.fillText(`N=${n}`, 40, 190 - h - 6);
          ctx.fillText('O(N²) 预填代价', 130, 110);
        };
        draw();
      },
      () => {}
    );
    return stop;
  }, [n]);
  return (
    <div>
      <canvas ref={ref} />
      <input type="range" min={500} max={200000} value={n} onChange={(e) => setN(+e.target.value)} />
    </div>
  );
};

// ---- w2: hard vs soft toggle ----
export const W2: React.FC<WidgetProps> = () => {
  const ref = useRef<HTMLCanvasElement>(null);
  const [soft, setSoft] = useState(true);
  useEffect(() => {
    if (!ref.current) return;
    const cv = ref.current;
    const stop = observeCanvas(
      cv,
      () => {
        const ctx = setupCanvas(cv, 320, 200);
        const draw = () => {
          ctx.clearRect(0, 0, 320, 200);
          ctx.fillStyle = '#eef3fb';
          ctx.fillRect(0, 0, 320, 200);
          if (soft) {
            for (let i = 0; i < 8; i++) {
              ctx.fillStyle = lerpColor('#2f6fed', '#1f9d6b', i / 8);
              ctx.fillRect(40 + i * 30, 80, 22, 50);
            }
            ctx.fillStyle = '#1f9d6b';
            ctx.font = '13px sans-serif';
            ctx.fillText('软压缩：连续 CE 表示（端到端可训）', 12, 170);
          } else {
            ctx.fillStyle = '#1c2536';
            ctx.font = '13px sans-serif';
            ctx.fillText('硬压缩：可读但信息有损的文本', 20, 100);
            ctx.fillText('"the cat sat on the mat"', 20, 130);
          }
        };
        draw();
      },
      () => {}
    );
    return stop;
  }, [soft]);
  return (
    <div>
      <canvas ref={ref} />
      <button onClick={() => setSoft((s) => !s)}>{soft ? '切到硬压缩' : '切到软压缩'}</button>
    </div>
  );
};

// ---- w3: segment -> CE bricks animation ----
export const W3: React.FC<WidgetProps> = () => {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    const cv = ref.current;
    const stop = observeCanvas(
      cv,
      () => {
        const ctx = setupCanvas(cv, 320, 200);
        let t = 0;
        let raf = 0;
        const draw = () => {
          t += 0.015;
          ctx.clearRect(0, 0, 320, 200);
          ctx.fillStyle = '#eef3fb';
          ctx.fillRect(0, 0, 320, 200);
          for (let i = 0; i < 6; i++) {
            const p = clamp((t - i * 0.3) % 2, 0, 1);
            const x = 30 + i * 48;
            const y = 60 - p * 20;
            ctx.fillStyle = '#2f6fed';
            ctx.fillRect(x, y, 36, 16 + p * 24);
            ctx.fillStyle = '#1f9d6b';
            const by = 150 - p * 10;
            ctx.fillRect(x, by, 36, 18);
          }
          ctx.fillStyle = '#5b6b85';
          ctx.font = '12px sans-serif';
          ctx.fillText('段 → 独立压缩 → CE 砖块', 60, 190);
          raf = requestAnimationFrame(draw);
        };
        draw();
        return () => cancelAnimationFrame(raf);
      },
      () => {}
    );
    return stop;
  }, []);
  return <canvas ref={ref} />;
};

// ---- w4: three properties cards (static canvas) ----
export const W4: React.FC<WidgetProps> = () => {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    const cv = ref.current;
    const stop = observeCanvas(
      cv,
      () => {
        const ctx = setupCanvas(cv, 320, 200);
        const items = [
          ['效率', '#2f6fed'],
          ['可扩展', '#1f9d6b'],
          ['可复用', '#7c5cff'],
        ];
        const draw = () => {
          ctx.clearRect(0, 0, 320, 200);
          ctx.fillStyle = '#eef3fb';
          ctx.fillRect(0, 0, 320, 200);
          items.forEach((it, i) => {
            ctx.fillStyle = it[1];
            ctx.fillRect(20 + i * 100, 50, 80, 90);
            ctx.fillStyle = '#fff';
            ctx.font = '14px sans-serif';
            ctx.fillText(it[0], 36 + i * 100, 100);
          });
        };
        draw();
      },
      () => {}
    );
    return stop;
  }, []);
  return <canvas ref={ref} />;
};

// ---- w5: TE collapses to CE in latent space ----
export const W5: React.FC<WidgetProps> = () => {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    const cv = ref.current;
    const stop = observeCanvas(
      cv,
      () => {
        const ctx = setupCanvas(cv, 320, 200);
        let t = 0;
        let raf = 0;
        const te = [
          [80, 60],
          [120, 80],
          [90, 120],
          [130, 110],
        ];
        const draw = () => {
          t += 0.02;
          const p = clamp((Math.sin(t) + 1) / 2, 0, 1);
          ctx.clearRect(0, 0, 320, 200);
          ctx.fillStyle = '#eef3fb';
          ctx.fillRect(0, 0, 320, 200);
          const ce0 = [200, 70];
          const ce1 = [210, 130];
          te.forEach((tx, i) => {
            const cx = lerpColorRgb(tx[0], i < 2 ? ce0[0] : ce1[0], p);
            const cy = lerpColorRgb(tx[1], i < 2 ? ce0[1] : ce1[1], p);
            ctx.fillStyle = '#2f6fed';
            ctx.beginPath();
            ctx.arc(cx, cy, 6, 0, Math.PI * 2);
            ctx.fill();
          });
          ctx.fillStyle = '#1f9d6b';
          ctx.beginPath();
          ctx.arc(ce0[0], ce0[1], 8, 0, Math.PI * 2);
          ctx.arc(ce1[0], ce1[1], 8, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#5b6b85';
          ctx.font = '11px sans-serif';
          ctx.fillText('4 TE → 2 CE（同 LLM 输出空间）', 40, 190);
          raf = requestAnimationFrame(draw);
        };
        draw();
        return () => cancelAnimationFrame(raf);
      },
      () => {}
    );
    return stop;
  }, []);
  return <canvas ref={ref} />;
};

function lerpColorRgb(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

// ---- w6: O(NS) linear scaling by S ----
export const W6: React.FC<WidgetProps> = () => {
  const ref = useRef<HTMLCanvasElement>(null);
  const [s, setS] = useState(20);
  useEffect(() => {
    if (!ref.current) return;
    const cv = ref.current;
    const stop = observeCanvas(
      cv,
      () => {
        const ctx = setupCanvas(cv, 320, 200);
        const N = 200000;
        const draw = () => {
          ctx.clearRect(0, 0, 320, 200);
          ctx.fillStyle = '#eef3fb';
          ctx.fillRect(0, 0, 320, 200);
          const cost = N * s;
          const refCost = N * N;
          const h = clamp((cost / refCost) * 180, 4, 180);
          ctx.fillStyle = '#1f9d6b';
          ctx.fillRect(40, 190 - h, 60, h);
          ctx.fillStyle = '#1c2536';
          ctx.font = '12px sans-serif';
          ctx.fillText(`S=${s} → O(N·S) 线性`, 40, 190 - h - 6);
        };
        draw();
      },
      () => {}
    );
    return stop;
  }, [s]);
  return (
    <div>
      <canvas ref={ref} />
      <input type="range" min={10} max={40} value={s} onChange={(e) => setS(+e.target.value)} />
    </div>
  );
};
