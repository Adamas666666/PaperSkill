import React, { useEffect, useRef, useState } from 'react';
import { setupCanvas, observeCanvas } from '../lib/canvasKit';
import type { WidgetProps } from './registry';
import { SC, clearScene, drawSceneLabel, drawInset } from './climbKit';

// §9 M9.1 瓶颈 vs 普通 —— P4 芯片 + 参数量条
// 论文 §3.3 瓶颈设计：1×1 降维 → 3×3 → 1×1 升维；256 维输入下参数约省 17 倍。

const W = 560;
const H = 250;

const BLOCKS = [
  {
    key: 'normal',
    label: '普通块（2×3×3）',
    params: 1179648, // 2 * 3*3*256*256
    desc: '普通块：两个 3×3 卷积都在 256 维上做，参数量约 118 万。',
    cls: '',
    shape: '256 → 256 → 256',
  },
  {
    key: 'bottle',
    label: '瓶颈块（1×1-3×3-1×1）',
    params: 69632, // 1*1*256*64 + 3*3*64*64 + 1*1*64*256
    desc: '瓶颈块：先用 1×1 降到 64，3×3 在 64 维上算，再 1×1 升回 256，参数量约 7 万——省约 17 倍。',
    cls: 'good',
    shape: '256 → 64 → 64 → 256',
  },
];

function fmtParams(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + ' 百万';
  if (n >= 1000) return (n / 1000).toFixed(0) + ' 千';
  return String(n);
}

export const ModBottleneck: React.FC<WidgetProps> = ({ chapterId, moduleId }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({ b: 1 });
  const rafRef = useRef<number | null>(null);
  const [b, setB] = useState(1);
  const [feedback, setFeedback] = useState({ text: BLOCKS[1].desc, cls: BLOCKS[1].cls });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let ctx: CanvasRenderingContext2D;
    try {
      ctx = setupCanvas(canvas, W, H);
    } catch {
      return;
    }

    const render = (s: { b: number }) => {
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = SC.sceneBg;
      ctx.fillRect(0, 0, W, H);

      const cur = BLOCKS[s.b];

      // 左侧：块结构示意
      const cx = 120;
      const widths = s.b === 0 ? [64, 64] : [56, 26, 56];
      const labels = s.b === 0 ? ['3×3', '3×3'] : ['1×1', '3×3', '1×1'];
      const heights = s.b === 0 ? [30, 30] : [26, 16, 26];
      let y = 60;
      ctx.fillStyle = SC.ink;
      ctx.font = 'bold 12px "Segoe UI", sans-serif';
      ctx.fillText('块结构', 40, 42);
      for (let i = 0; i < widths.length; i++) {
        ctx.fillStyle = s.b === 0 ? SC.climber : i === 1 ? SC.flag : SC.climber;
        ctx.fillRect(cx - widths[i] / 2, y, widths[i], heights[i]);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 10px "Segoe UI", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(labels[i], cx, y + heights[i] / 2 + 3);
        y += heights[i] + 12;
      }
      ctx.textAlign = 'left';
      ctx.fillStyle = SC.inkMuted;
      ctx.font = '10px "Segoe UI", sans-serif';
      ctx.fillText(cur.shape, 40, y + 6);

      // 右侧：参数量条
      const bx = 290;
      const bw = 220;
      const maxP = BLOCKS[0].params;
      ctx.fillStyle = SC.ink;
      ctx.font = 'bold 12px "Segoe UI", sans-serif';
      ctx.fillText('参数量对比', bx, 42);

      BLOCKS.forEach((bl, i) => {
        const yy = 60 + i * 64;
        const isCur = i === s.b;
        ctx.fillStyle = '#eef1f7';
        ctx.fillRect(bx, yy, bw, 22);
        const wbar = (bl.params / maxP) * bw;
        ctx.fillStyle = i === 0 ? SC.climber : SC.rope;
        ctx.fillRect(bx, yy, wbar, 22);
        ctx.fillStyle = SC.ink;
        ctx.font = '11px "Segoe UI", sans-serif';
        ctx.fillText(bl.label, bx, yy + 38);
        ctx.fillStyle = isCur ? SC.ink : SC.inkMuted;
        ctx.font = 'bold 11px "Segoe UI", sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(fmtParams(bl.params), bx + bw, yy + 16);
        ctx.textAlign = 'left';
        if (isCur) {
          ctx.strokeStyle = i === 0 ? SC.climber : SC.rope;
          ctx.lineWidth = 2;
          ctx.strokeRect(bx - 3, yy - 2, bw + 6, 26);
        }
      });

      // 比值标注
      const ratio = (BLOCKS[0].params / BLOCKS[1].params).toFixed(0);
      ctx.fillStyle = SC.flag;
      ctx.font = 'bold 12px "Segoe UI", sans-serif';
      ctx.fillText('瓶颈块参数约为普通块的 1/' + ratio, bx, 210);

      drawSceneLabel(ctx, '登山者把背包压缩过窄缝', 40, 236, SC.inkMuted);

      if (!canvas.classList.contains('is-ready')) canvas.classList.add('is-ready');
    };

    const tick = () => {
      render(stateRef.current);
      rafRef.current = requestAnimationFrame(tick);
    };
    const stop = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
    const start = () => {
      if (!rafRef.current) rafRef.current = requestAnimationFrame(tick);
    };
    const disconnect = observeCanvas(canvas, start, stop);
    return () => {
      stop();
      disconnect();
    };
  }, []);

  const select = (i: number) => {
    stateRef.current.b = i;
    setB(i);
    setFeedback({ text: BLOCKS[i].desc, cls: BLOCKS[i].cls });
  };

  return (
    <div>
      <canvas id={`cv-${chapterId}-${moduleId}`} ref={canvasRef} width={W} height={H} />
      <div className="chip-row">
        {BLOCKS.map((bl, i) => (
          <button key={bl.key} type="button" className={`chip ${i === b ? 'selected' : ''}`} onClick={() => select(i)}>
            {bl.label}
          </button>
        ))}
      </div>
      <div className={`feedback ${feedback.cls}`}>{feedback.text}</div>
    </div>
  );
};

export default ModBottleneck;
