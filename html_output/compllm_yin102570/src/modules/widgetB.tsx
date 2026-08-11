import React, { useEffect, useRef, useState } from 'react';
import { WidgetProps } from './registry';
import { setupCanvas, observeCanvas } from '../lib/canvasKit';

// ---- w7: LoRA + linear architecture ----
export const W7: React.FC<WidgetProps> = () => {
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
          ctx.fillStyle = '#2f6fed';
          ctx.fillRect(20, 80, 70, 40);
          ctx.fillStyle = '#1f9d6b';
          ctx.fillRect(140, 80, 60, 40);
          ctx.fillStyle = '#7c5cff';
          ctx.fillRect(250, 80, 60, 40);
          ctx.fillStyle = '#1c2536';
          ctx.font = '12px sans-serif';
          ctx.fillText('段', 45, 75);
          ctx.fillText('LLM+LoRA', 142, 75);
          ctx.fillText('线性层', 258, 75);
          ctx.fillText('CE×S/C', 262, 138);
          ctx.strokeStyle = '#5b6b85';
          ctx.beginPath();
          ctx.moveTo(90, 100);
          ctx.lineTo(140, 100);
          ctx.moveTo(200, 100);
          ctx.lineTo(250, 100);
          ctx.lineTo(280, 120);
          ctx.stroke();
        };
        draw();
      },
      () => {}
    );
    return stop;
  }, []);
  return <canvas ref={ref} />;
};

// ---- w8: frozen base toggle ----
export const W8: React.FC<WidgetProps> = () => {
  const ref = useRef<HTMLCanvasElement>(null);
  const [plugged, setPlugged] = useState(true);
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
          ctx.fillStyle = plugged ? '#1f9d6b' : '#e23b3b';
          ctx.fillRect(40, 60, 240, 70);
          ctx.fillStyle = '#fff';
          ctx.font = '14px sans-serif';
          ctx.fillText(plugged ? '底座 LLM 冻结 · 已接压缩' : '已拔掉 · 走原始 LLM', 60, 100);
        };
        draw();
      },
      () => {}
    );
    return stop;
  }, [plugged]);
  return (
    <div>
      <canvas ref={ref} />
      <button onClick={() => setPlugged((p) => !p)}>{plugged ? '拔掉压缩' : '接上压缩'}</button>
    </div>
  );
};

// ---- w9: self-distillation hidden states align ----
export const W9: React.FC<WidgetProps> = () => {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    const cv = ref.current;
    const stop = observeCanvas(
      cv,
      () => {
        const ctx = setupCanvas(cv, 360, 200);
        let t = 0;
        let raf = 0;
        const draw = () => {
          t += 0.02;
          ctx.clearRect(0, 0, 360, 200);
          ctx.fillStyle = '#eef3fb';
          ctx.fillRect(0, 0, 360, 200);
          for (let i = 0; i < 5; i++) {
            const y = 40 + i * 30;
            const off = Math.sin(t + i) * 8;
            ctx.fillStyle = '#e23b3b';
            ctx.fillRect(40, y, 100, 12);
            ctx.fillStyle = '#1f9d6b';
            ctx.fillRect(220 + off, y, 100, 12);
          }
          ctx.fillStyle = '#5b6b85';
          ctx.font = '12px sans-serif';
          ctx.fillText('teacher(红) → student(绿) 对齐隐藏态', 80, 190);
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

// ---- w10: compress context, not question ----
export const W10: React.FC<WidgetProps> = () => {
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
          ctx.fillStyle = '#2f6fed';
          ctx.fillRect(20, 50, 130, 40);
          ctx.fillStyle = '#1f9d6b';
          ctx.fillRect(170, 50, 50, 40);
          ctx.fillStyle = '#7c5cff';
          ctx.fillRect(250, 50, 90, 40);
          ctx.fillStyle = '#1c2536';
          ctx.font = '12px sans-serif';
          ctx.fillText('上下文→压缩(CE)', 30, 45);
          ctx.fillText('问题(TE)', 178, 45);
          ctx.fillText('→ LLM', 268, 45);
        };
        draw();
      },
      () => {}
    );
    return stop;
  }, []);
  return <canvas ref={ref} />;
};

// ---- w11: three regimes simulator ----
export const W11: React.FC<WidgetProps> = () => {
  const ref = useRef<HTMLCanvasElement>(null);
  const [reg, setReg] = useState(0); // 0 bigN smallT, 1 bigN bigT, 2 smallN
  const speedups = ['C² = 4×', 'C = 2×', '反而变慢（可拔掉）'];
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
          const base = [220, 120, 40][reg];
          const comp = [55, 60, 70][reg];
          ctx.fillStyle = '#e23b3b';
          ctx.fillRect(40, 190 - base, 50, base);
          ctx.fillStyle = '#1f9d6b';
          ctx.fillRect(130, 190 - comp, 50, comp);
          ctx.fillStyle = '#1c2536';
          ctx.font = '12px sans-serif';
          ctx.fillText(speedups[reg], 60, 30);
        };
        draw();
      },
      () => {}
    );
    return stop;
  }, [reg]);
  return (
    <div>
      <canvas ref={ref} />
      <button onClick={() => setReg((r) => (r + 1) % 3)}>切换场景</button>
    </div>
  );
};

// ---- w12: KV cache halved ----
export const W12: React.FC<WidgetProps> = () => {
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
          ctx.fillStyle = '#e23b3b';
          ctx.fillRect(40, 40, 50, 140);
          ctx.fillStyle = '#1f9d6b';
          ctx.fillRect(130, 110, 50, 70);
          ctx.fillStyle = '#1c2536';
          ctx.font = '12px sans-serif';
          ctx.fillText('KV cache: 基线 100% → CompLLM 50%', 20, 195);
        };
        draw();
      },
      () => {}
    );
    return stop;
  }, []);
  return <canvas ref={ref} />;
};

// ---- w13: accuracy vs context length ----
export const W13: React.FC<WidgetProps> = () => {
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
          ctx.strokeStyle = '#5b6b85';
          ctx.beginPath();
          ctx.moveTo(30, 180);
          ctx.lineTo(330, 180);
          ctx.stroke();
          ctx.strokeStyle = '#e23b3b';
          ctx.beginPath();
          ctx.moveTo(30, 150);
          ctx.lineTo(330, 100);
          ctx.stroke();
          ctx.strokeStyle = '#1f9d6b';
          ctx.beginPath();
          ctx.moveTo(30, 150);
          ctx.lineTo(220, 130);
          ctx.lineTo(330, 70);
          ctx.stroke();
          ctx.fillStyle = '#1c2536';
          ctx.font = '11px sans-serif';
          ctx.fillText('>50K tokens 后 CompLLM 反超', 150, 185);
        };
        draw();
      },
      () => {}
    );
    return stop;
  }, []);
  return <canvas ref={ref} />;
};

// ---- w14: TTFT & KV gauges ----
export const W14: React.FC<WidgetProps> = () => {
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
          ctx.fillRect(30, 40, 110, 60);
          ctx.fillStyle = '#1f9d6b';
          ctx.fillRect(170, 40, 110, 60);
          ctx.fillStyle = '#fff';
          ctx.font = '14px sans-serif';
          ctx.fillText('TTFT 4×', 60, 75);
          ctx.fillText('KV −50%', 195, 75);
        };
        draw();
      },
      () => {}
    );
    return stop;
  }, []);
  return <canvas ref={ref} />;
};
