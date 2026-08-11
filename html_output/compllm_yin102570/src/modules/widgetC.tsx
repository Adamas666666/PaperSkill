import React, { useEffect, useRef, useState } from 'react';
import { WidgetProps } from './registry';
import { setupCanvas, observeCanvas } from '../lib/canvasKit';

// ---- w15: LOFT five datasets ----
export const W15: React.FC<WidgetProps> = () => {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    const cv = ref.current;
    const stop = observeCanvas(
      cv,
      () => {
        const ctx = setupCanvas(cv, 360, 220);
        const names = ['HotpotQA', 'Musique', 'NQ', 'Qampari', 'Quest'];
        const base = [0.45, 0.4, 0.5, 0.4, 0.35];
        const comp = [0.47, 0.42, 0.5, 0.41, 0.37];
        const draw = () => {
          ctx.clearRect(0, 0, 360, 220);
          ctx.fillStyle = '#eef3fb';
          ctx.fillRect(0, 0, 360, 220);
          names.forEach((n, i) => {
            const x = 40 + i * 62;
            ctx.fillStyle = '#e23b3b';
            ctx.fillRect(x, 200 - base[i] * 200, 22, base[i] * 200);
            ctx.fillStyle = '#1f9d6b';
            ctx.fillRect(x + 24, 200 - comp[i] * 200, 22, comp[i] * 200);
            ctx.fillStyle = '#1c2536';
            ctx.font = '9px sans-serif';
            ctx.fillText(n, x, 215);
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

// ---- w16: small model vs frontier ----
export const W16: React.FC<WidgetProps> = () => {
  const ref = useRef<HTMLCanvasElement>(null);
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
          ctx.fillStyle = '#2f6fed';
          ctx.fillRect(30, 70, 90, 60);
          ctx.fillStyle = '#7c5cff';
          ctx.fillRect(150, 70, 90, 60);
          ctx.fillStyle = '#fff';
          ctx.font = '12px sans-serif';
          ctx.fillText('4B+CompLLM', 42, 105);
          ctx.fillText('前沿大模型', 158, 105);
        };
        draw();
      },
      () => {}
    );
    return stop;
  }, []);
  return <canvas ref={ref} />;
};

// ---- w17: method comparison table ----
export const W17: React.FC<WidgetProps> = () => {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    const cv = ref.current;
    const stop = observeCanvas(
      cv,
      () => {
        const ctx = setupCanvas(cv, 360, 200);
        const draw = () => {
          ctx.clearRect(0, 0, 360, 200);
          ctx.fillStyle = '#eef3fb';
          ctx.fillRect(0, 0, 360, 200);
          ctx.fillStyle = '#1f9d6b';
          ctx.fillRect(20, 40, 320, 40);
          ctx.fillStyle = '#fff';
          ctx.font = '12px sans-serif';
          ctx.fillText('CompLLM: 保权重 ✓ 线性 ✓ 可复用 ✓', 30, 65);
          ctx.fillStyle = '#5b6b85';
          ctx.fillText('其它软压缩常缺其中一项', 30, 130);
        };
        draw();
      },
      () => {}
    );
    return stop;
  }, []);
  return <canvas ref={ref} />;
};

// ---- w18: C / S ablation ----
export const W18: React.FC<WidgetProps> = () => {
  const ref = useRef<HTMLCanvasElement>(null);
  const [c, setC] = useState(2);
  const drops: Record<number, number> = { 2: 1, 4: 0.96, 8: 0.85 };
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
          const y = 180 - drops[c] * 160;
          ctx.fillStyle = '#1f9d6b';
          ctx.fillRect(140, y, 40, 180 - y);
          ctx.fillStyle = '#1c2536';
          ctx.font = '12px sans-serif';
          ctx.fillText(`C=${c} → 准确率≈${(drops[c] * 100).toFixed(0)}%`, 90, 30);
        };
        draw();
      },
      () => {}
    );
    return stop;
  }, [c]);
  return (
    <div>
      <canvas ref={ref} />
      <input type="range" min={2} max={8} step={2} value={c} onChange={(e) => setC(+e.target.value)} />
    </div>
  );
};

// ---- w19: limitations list ----
export const W19: React.FC<WidgetProps> = () => {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    const cv = ref.current;
    const stop = observeCanvas(
      cv,
      () => {
        const ctx = setupCanvas(cv, 360, 200);
        const items = ['只编码语义(计数/错字弱)', 'OOD 数据不支持', '不顺时可跳过压缩'];
        const draw = () => {
          ctx.clearRect(0, 0, 360, 200);
          ctx.fillStyle = '#eef3fb';
          ctx.fillRect(0, 0, 360, 200);
          items.forEach((t, i) => {
            ctx.fillStyle = '#ff6b6b';
            ctx.fillRect(20, 30 + i * 45, 320, 34);
            ctx.fillStyle = '#1c2536';
            ctx.font = '12px sans-serif';
            ctx.fillText(t, 30, 52 + i * 45);
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

// ---- w20: future + summary ----
export const W20: React.FC<WidgetProps> = () => {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    const cv = ref.current;
    const stop = observeCanvas(
      cv,
      () => {
        const ctx = setupCanvas(cv, 360, 200);
        const items = ['动态压缩率', '更大底座', '纯文本自蒸馏', '更强复用', '多模态'];
        const draw = () => {
          ctx.clearRect(0, 0, 360, 200);
          ctx.fillStyle = '#eef3fb';
          ctx.fillRect(0, 0, 360, 200);
          items.forEach((t, i) => {
            ctx.fillStyle = i % 2 ? '#2f6fed' : '#1f9d6b';
            ctx.fillRect(20, 20 + i * 32, 320, 26);
            ctx.fillStyle = '#fff';
            ctx.font = '12px sans-serif';
            ctx.fillText(t, 30, 38 + i * 32);
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
